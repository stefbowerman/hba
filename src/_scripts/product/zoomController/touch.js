import $ from 'jquery';
import panzoom from 'panzoom';
import BaseZoomController from './base';

const selectors = {
  blowup: '[data-blowup]',
  blowupImage: '[data-blowup-image]',
  blowupClose: '[data-blowup-close]'
};

const classes = {
  bodyBlowupOpen: 'blowup-open',
  blowupActive: 'is-active',
  blowupRevealed: 'is-revealed',
  blowupImageVisible: 'image-visible'
};

const $window = $(window);
const $body = $(document.body);

export default class TouchZoomController extends BaseZoomController {
  constructor($el, options) {
    super($el, options);

    this.pzInstance = null;

    this.$blowup       = $(selectors.blowup, this.$el);
    this.$blowupImage  = $(selectors.blowupImage, this.$el);
    this.$blowupClose  = $(selectors.blowupClose, this.$el);        
  }

  addEventListeners() {
    super.addEventListeners();
    this.$blowupClose.on([this.events.CLICK, this.events.TOUCHSTART].join(' '), this.zoomOut.bind(this));
  }

  removeEventListeners() {
    super.removeEventListeners();
    this.$blowupClose.off([this.events.CLICK, this.events.TOUCHSTART].join(' '));
  }  

  destroy() {
    this.destroyPZInstance();
    super.destroy();
  }

  getInitialZoomAttributes() {
    let minZoom = 0.1;
    const maxZoom = 0.75; // Ensure that the image remains crisp
    const startZoomRatio = 1.5; // Start by making the image 150% of the screen dimension in the shortest direction
    const imageHeight = this.$blowupImage.outerHeight();
    const imageWidth = this.$blowupImage.outerWidth();
    const winHeight = $window.height();
    const winWidth = $window.width();

    // Landscape
    if (winWidth > winHeight) {
      minZoom = winHeight/imageHeight;
    }
    // Portrait
    else {
      minZoom = winWidth/imageWidth;
    }

    let startZoom = startZoomRatio * minZoom;

    if (startZoom > maxZoom) {
      startZoom = maxZoom;
    }

    const startX = Math.floor(-1 * (((imageWidth * startZoom) - winWidth)/2));
    const startY = Math.floor(-1 * (((imageHeight * startZoom) - winHeight)/2));

    return {
      minZoom,
      maxZoom,
      startZoom,
      startX,
      startY
    };
  }

  createPZInstance() {
    const attrs = this.getInitialZoomAttributes();

    const instance = panzoom(this.$blowupImage.get(0), {
      minZoom: attrs.minZoom,
      maxZoom: attrs.maxZoom,
      bounds: true,
      beforeWheel: () => false, // Ignore scroll
      filterKey: () => true // Ignore keyboard events
    });

    instance.zoomAbs(0, 0, attrs.startZoom); // This doesn't seem to set the initial position correctly
    instance.moveTo(attrs.startX, attrs.startY); // This does :-/

    return instance;
  }

  destroyPZInstance() {
    this.pzInstance && this.pzInstance.dispose();
    this.$blowupImage.attr('style', '');
    this.pzInstance = null;
  }

  zoomIn(src) {
    if (this.isZoomed || !this.enabled) return;
    
    this.$blowupImage.one('load', this.onBlowupImageReady.bind(this));

    // Set the smaller image immediately (it should already be loaded from the slideshow)
    this.$blowupImage.attr('src', src);

    setTimeout(() => {
      this.$blowup.addClass(classes.blowupRevealed);
    }, 600);

    this.$blowup.addClass(classes.blowupActive);
    $body.addClass(classes.bodyBlowupOpen);

    super.zoomIn();
  }  

  zoomOut() {
    if (!this.isZoomed) return;

    const classesToRemove = [classes.blowupActive, classes.blowupRevealed, classes.blowupImageVisible].join(' ');
    this.$blowup.removeClass(classesToRemove);

    setTimeout(() => {
      $body.removeClass(classes.bodyBlowupOpen);
      this.$blowupImage.attr('src', '');
      this.isZoomed = false;
      this.onBlowupCloseComplete();
      this.settings.onZoomOut();
    }, 600);
  }

  onBlowupImageReady() {
    this.$blowup.addClass(classes.blowupImageVisible);
    this.pzInstance = this.createPZInstance();
  }

  // Triggered as we apply classes to close the blowup
  onBlowupCloseComplete() {
    this.destroyPZInstance();
  }

  onOrientationchange() {
    if (!(this.isZoomed && this.pzInstance)) return;

    this.destroyPZInstance();
    this.$blowupImage.one(this.transitionEndEvent, () => {
      this.createPZInstance();
    });
  }
}

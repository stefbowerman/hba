import $ from 'jquery';
import {
  isTouch,
  whichTransitionEnd
} from '../../core/utils';

const selectors = {
  imageLink: '[data-image-link]'
};

const $window = $(window);

export default class BaseZoomController {
  /**
   * BaseZoomController
   *
   * @constructor
   * @param {jQuery} $el - element containing all required elements
   * @param {Object} options
   */
  constructor($el, options) {
    this.name = 'BaseZoomController';
    this.namespace = '.'+this.name;

    this.events = {
      CLICK: `click${this.namespace}`,
      TOUCHSTART: `touchstart${this.namespace}`
    };

    const defaults = {
      onZoomIn: () => {},
      onZoomOut: () => {}
    };

    if (!$el) {
      console.warn(`[${this.name}] - $el required to initialize`);
      return;
    }

    this.$el = $el;
    this.enabled = false;
    this.isZoomed = false;
    this.isTouch = isTouch();
    this.transitionEndEvent = whichTransitionEnd();
    this.orientationchangeCallback = this.onOrientationchange.bind(this);
    this.settings = $.extend({}, defaults, options);

    this.onKeydown = this.onKeydown.bind(this);
  }

  addEventListeners() {
    this.$el.on(this.events.CLICK, selectors.imageLink, this.onImageLinkClick.bind(this));
  }

  removeEventListeners() {
    this.$el.off(this.events.CLICK);
  }

  enable() {
    if (this.enabled) return;
    this.addEventListeners();
    $window.on('keydown', this.onKeydown);
    this.enabled = true;
  }

  disable() {
    if (!this.enabled) return;
    this.removeEventListeners();
    $window.off('keydown', this.onKeydown);
    this.enabled = false;
  }

  destroy() {
    this.disable();
  }

  onKeydown(e) {
    if (e.which === 27) {
      this.zoomOut();
    }
  }

  onImageLinkClick(e) {
    e.preventDefault();
    this.zoomIn($(e.currentTarget).attr('href'));
  }

  zoomIn(src) {
    this.isZoomed = true;
    this.settings.onZoomIn();
  }

  zoomOut() {}

  onOrientationchange() {}
}

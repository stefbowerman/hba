import $ from 'jquery';
import Swiper from 'swiper';
import { isTouch } from '../core/utils';
import DesktopZoomController from './zoomController/desktop';
import TouchZoomController from './zoomController/touch';

const selectors = {
  productGallerySlideshow: '[data-product-gallery-slideshow]',
  productGalleryThumbnailsSlide: '[data-product-gallery-thumbnails-slide]',
  initialSlide: '[data-initial-slide]'
};

const classes = {
  thumbnailSlideActive: 'is-active'
};

export default class ProductDetailGallery {
  /**
   * Product Detail Gallery Constructor
   * Handles the interaction between the gallery and the set of thumbnails
   * See: snippets/product-detail-gallery.liquid
   *
   * @param {HTMLElement | jQuery} el - gallery element containing elements matching the slideshow and thumbnails selectors
   */
  constructor(el) {
    this.$el = $(el);
    this.$slideshow = this.$el.find(selectors.productGallerySlideshow);
    this.$thumbnailSlides = this.$el.find(selectors.productGalleryThumbnailsSlide);

    const $initialSlide = $(selectors.initialSlide, this.$slideshow);
    this.initialSlide = $initialSlide.index() === -1 ? 0 : $initialSlide.index(); // If the initial slide doesn't exist, jQuery will return -1
    this.swiper = null;

    this.desktopZoomController = new DesktopZoomController(this.$el);
    this.touchZoomController   = new TouchZoomController(this.$el);

    this[isTouch() ? 'touchZoomController' : 'desktopZoomController'].enable();

    this.$thumbnailSlides.on(`${isTouch() ? 'touchstart' : 'click'}`, this.onThumbnailSlideClick.bind(this));
  }

  destroy() {
    this.swiper && this.swiper.destroy();
  }

  onReveal() {
    this.swiper = new Swiper(this.$slideshow.get(0), {
      init: false,
      initialSlide: this.initialSlide, 
      speed: 0,
      simulateTouch: false,
      on: {
        init: this.onSlideShowInit.bind(this),
        slideChangeTransitionEnd: this.onSlideChangeTransitionEnd.bind(this)
      }
    });

    this.swiper.init();
  }

  onHidden() {
    this.swiper && this.swiper.destroy();
  }

  onSlideShowInit() {
    const sw = this.swiper;
    this.desktopZoomController.initHoverZoom($(sw.slides[sw.activeIndex]));
  }

  onSlideChangeTransitionEnd() {
    const sw = this.swiper;
    this.desktopZoomController.destroyHoverZoom($(sw.slides[sw.previousIndex]));
    this.desktopZoomController.initHoverZoom($(sw.slides[sw.activeIndex]));
    this.$thumbnailSlides.removeClass(classes.thumbnailSlideActive);
    this.$thumbnailSlides.eq(sw.activeIndex - 1).addClass(classes.thumbnailSlideActive);
  }

  onThumbnailSlideClick(e) {
    this.swiper && this.swiper.slideTo($(e.currentTarget).index());
  }
}

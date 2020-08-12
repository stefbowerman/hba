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
    this.thumbnailsLoaded = false;
    this.slideshowImagesLoaded = false;

    this.desktopZoomController = new DesktopZoomController(this.$el);
    this.touchZoomController   = new TouchZoomController(this.$el);

    this[isTouch() ? 'touchZoomController' : 'desktopZoomController'].enable();

    this.$thumbnailSlides.on(`${isTouch() ? 'touchstart' : 'click'}`, this.onThumbnailSlideClick.bind(this));
  }

  destroy() {
    this.swiper && this.swiper.destroy();
  }

  loadImages($images) {
    if ($images && $images.length) {
      $images.each((i, img) => {
        const $img = $(img);
        $img.attr('src', $img.data('src'));
        $img.attr('data-src', null);
      });
    }
  }

  loadSlideshowImages() {
    if (this.slideshowImagesLoaded) return;
    this.loadImages(this.$slideshow.find('img'));
    this.slideshowImagesLoaded = true;
  }

  loadThumbnails() {
    if (this.thumbnailsLoaded) return;
    this.loadImages(this.$thumbnailSlides.find('img'));
    this.thumbnailsLoaded = true;
  }  

  onReveal() {
    this.loadSlideshowImages();
    this.loadThumbnails();

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

    if (this.desktopZoomController.enabled) {
      this.desktopZoomController.initHoverZoom($(sw.slides[sw.activeIndex]));
    }
  }

  onSlideChangeTransitionEnd() {
    const sw = this.swiper;

    this.$thumbnailSlides.removeClass(classes.thumbnailSlideActive);
    this.$thumbnailSlides.eq(sw.activeIndex).addClass(classes.thumbnailSlideActive);

    if (this.desktopZoomController.enabled) {
      this.desktopZoomController.destroyHoverZoom($(sw.slides[sw.previousIndex]));
      this.desktopZoomController.initHoverZoom($(sw.slides[sw.activeIndex]));      
    }
  }

  onThumbnailSlideClick(e) {
    this.swiper && this.swiper.slideTo($(e.currentTarget).index());
  }
}

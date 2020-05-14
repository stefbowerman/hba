import $ from 'jquery';
import Swiper from 'swiper';

const selectors = {
  productGallery: '[data-product-gallery]',
  productGallerySlideshow: '[data-product-gallery-slideshow]',
  productGalleryThumbnailsSlide: '[data-product-gallery-thumbnails-slide]',
  initialSlide: '[data-initial-slide]'
};

const classes = {
  hide: 'hide',
  zoomReady: 'is-zoomable',
  zoomedIn: 'is-zoomed',
  thumbnailSlideActive: 'is-active'
};

export default class ProductDetailGallery {
  /**
   * Product Detail Gallery Constructor
   * Handles the interaction between a single gallery and set of thumbnails
   * See: snippets/product-detail-galleries.liquid
   *
   * @param {HTMLElement | jQuery} el - gallery element containing elements matching the slideshow and thumbnails selectors
   */  
  constructor(el) {
    this.$el = $(el);
    this.$slideshow  = this.$el.find(selectors.productGallerySlideshow);
    this.$thumbnailSlides = this.$el.find(selectors.productGalleryThumbnailsSlide);
    this.optionValue = this.$el.data('option-value');

    // Look for element with the initialSlide selector.
    const initialSlide = this.$slideshow.find(selectors.initialSlide).length ? this.$slideshow.find(selectors.initialSlide).index() : 0;

    this.swiper = new Swiper(this.$slideshow.get(0), {
      init: false,
      loop: true,
      initialSlide: initialSlide,
      speed: 0,
      on: {
        init: this.onSlideShowInit.bind(this),
        slideChangeTransitionEnd: this.onSlideChangeTransitionEnd.bind(this)
      }
    });

    this.swiper.init();

    this.$thumbnailSlides.on('click', e => this.swiper.slideToLoop($(e.currentTarget).index()));
  }

  initHoverZoom($zoomTarget) {
    this.destroyHoverZoom($zoomTarget);

    $zoomTarget.zoom({
      url: $zoomTarget.find('a').attr('href'),
      on: 'click',
      touch: false,
      escToClose: true,
      magnify: 1.2,
      duration: 300,
      callback: () => {
        $zoomTarget.addClass(classes.zoomReady);
      },
      onZoomIn: () => {
        $zoomTarget.addClass(classes.zoomedIn);
      },
      onZoomOut: () => {
        $zoomTarget.removeClass(classes.zoomedIn);
      }
    });
  }

  destroyHoverZoom($zoomTarget) {
    $zoomTarget.trigger('zoom.destroy');
  }

  onSlideShowInit() {
    const sw = this.swiper;
    this.initHoverZoom($(sw.slides[sw.activeIndex]));
  }

  onSlideChangeTransitionEnd() {
    const sw = this.swiper;
    this.destroyHoverZoom($(sw.slides[sw.previousIndex]));
    this.initHoverZoom($(sw.slides[sw.activeIndex]));
    this.$thumbnailSlides.removeClass(classes.thumbnailSlideActive);
    this.$thumbnailSlides.eq(sw.activeIndex-1).addClass(classes.thumbnailSlideActive);
  }
}

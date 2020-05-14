import $ from 'jquery';
import Swiper from 'swiper';

const selectors = {
  productGallerySlideshow: '[data-product-gallery-slideshow]',
  productGalleryThumbnailsSlide: '[data-product-gallery-thumbnails-slide]',
  initialSlide: '[data-initial-slide]'
};

const classes = {
  zoomReady: 'is-zoomable',
  zoomedIn: 'is-zoomed',
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
    this.$slideshow  = this.$el.find(selectors.productGallerySlideshow);
    this.$thumbnailSlides = this.$el.find(selectors.productGalleryThumbnailsSlide);

    const initialSlide = $(selectors.initialSlide, this.$slideshow).index();
    
    this.swiper = new Swiper(this.$slideshow.get(0), {
      init: false,
      loop: true,
      initialSlide: (initialSlide === -1 ? 0 : initialSlide), // If the initial slide doesn't exist, jQuery will return -1
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

  destroyHoverZoom($el) {
    $el.trigger('zoom.destroy');
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

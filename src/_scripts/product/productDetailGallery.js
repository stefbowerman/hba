import $ from 'jquery';
import Typed from 'typed.js';
import Swiper, { Pagination } from 'swiper';
import TouchZoomController from './zoomController/touch';

Swiper.use([Pagination]);

const selectors = {
  slideshow: '[data-slideshow]',
  slide: '[data-slide]',
  pagination: '[data-pagination]',
  paginationProgress: '[data-pagination-progress]',
  zoomTrigger: '[data-zoom-trigger]'
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
    this.$slideshow = $(selectors.slideshow, this.$el);
    this.$slides = $(selectors.slide, this.$slideshow);
    this.$pagination = $(selectors.pagination, this.$slideshow);
    this.$paginationProgress = $(selectors.paginationProgress, this.$slideshow);
    this.$zoomTrigger = $(selectors.zoomTrigger, this.$slideshow);

    this.touchZoomController = new TouchZoomController(this.$el);
    this.touchZoomController.enable();

    this.currentSlideIndex = null;
    this.totalSlideCount = this.$slides.length;

    this.$zoomTrigger.on('click', this.onZoomTriggerClick.bind(this));

    this.swiper = new Swiper(this.$slideshow.get(0), {
      init: false,
      loop: (this.totalSlideCount > 1),
      speed: 700,
      effect: 'slide',
      simulateTouch: false,
      watchOverflow: true,
      pagination: {
        el: document.createElement('span'),
        type: 'custom',
        renderCustom: (swiper, current, total) => {
          this.onPaginationRender(current, total); // Use renderCustom for the 'current' calculation only
          return '';
        }
      }
    });

    this.swiper.init();

    this.loadImages(this.$el.find('img')); // This needs to happen *after* slideshow initialization because it dupes slides
  }

  getActiveSlide() {
    const $slides = $(this.swiper.slides);

    if ($slides.length === 1) {
      return $slides.first();
    }

    return $slides.filter(`[data-swiper-slide-index="${this.currentSlideIndex}"]`).first();
  }

  loadImages($images) {
    if ($images && $images.length) {
      $images.each((i, img) => {
        const $img = $(img);

        $img.on('load loaded', () => {
          $img.addClass('is-loaded');
          $img.attr('data-src', null);
          $img.attr('data-srcset', null);
        });

        $img.attr('srcset', $img.data('srcset'));
        $img.attr('src', $img.data('src'));
      });
    }
  }

  updatePagination() {
    if (this.$pagination.length) {
      this.$paginationProgress.text(`${this.currentSlideIndex + 1} — ${this.totalSlideCount}`);
    }
  }

  onZoomTriggerClick(e) {
    e.preventDefault();

    const $slide = this.getActiveSlide();
    const src = $slide.find('a').attr('href');

    this.touchZoomController.zoomIn(src);
  }

  onPaginationRender(current, total) {
    const currentI = current - 1;

    if (this.currentSlideIndex === currentI) return;

    this.currentSlideIndex = currentI;
    this.updatePagination();
  }
}

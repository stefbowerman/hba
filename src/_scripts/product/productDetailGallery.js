import $ from 'jquery';
import { isTouch } from '../core/utils';
import DesktopZoomController from './zoomController/desktop';
import TouchZoomController from './zoomController/touch';

const selectors = {
  productGallerySlideshow: '[data-product-gallery-slideshow]',
  productGallerySlideshowSlides: '[data-product-gallery-slideshow-slide]',
  productGalleryThumbnailsSlide: '[data-product-gallery-thumbnails-slide]',
  initialSlide: '[data-initial-slide]'
};

const classes = {
  slideshowSlideActive: 'is-active',
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
    this.$productGallerySlideshowSlides = this.$el.find(selectors.productGallerySlideshowSlides);
    this.$thumbnailSlides = this.$el.find(selectors.productGalleryThumbnailsSlide);

    this.slideIndex = 0;
    this.thumbnailsLoaded = false;
    this.slideshowImagesLoaded = false;

    this.desktopZoomController = new DesktopZoomController(this.$el);
    this.touchZoomController   = new TouchZoomController(this.$el);

    this[isTouch() ? 'touchZoomController' : 'desktopZoomController'].enable();

    this.$thumbnailSlides.on(`${isTouch() ? 'touchstart' : 'click'}`, this.onThumbnailSlideClick.bind(this));

    // Make sure everything is good for the initial slide
    this.getSlide(this.slideIndex).addClass(classes.slideshowSlideActive);
    this.$thumbnailSlides.eq(this.slideIndex).addClass(classes.thumbnailSlideActive);

    if (this.desktopZoomController.enabled) {
      this.desktopZoomController.initHoverZoom(this.getSlide(this.slideIndex));
    }    
  }

  destroy() {
    this.desktopZoomController.destroyHoverZoom(this.getSlide(this.slideIndex));
  }

  getSlide(i) {
    return this.$productGallerySlideshowSlides.eq(i);
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

  slideTo(i) {
    if (this.slideIndex === i) return;

    const previousIndex = this.slideIndex;

    this.$productGallerySlideshowSlides.removeClass(classes.slideshowSlideActive);
    this.getSlide(i).addClass(classes.slideshowSlideActive);
    this.$thumbnailSlides.removeClass(classes.thumbnailSlideActive);
    this.$thumbnailSlides.eq(i).addClass(classes.thumbnailSlideActive);

    if (this.desktopZoomController.enabled) {
      this.desktopZoomController.initHoverZoom(this.getSlide(i));
    }

    this.slideIndex = i;

    this.onSlideToComplete(previousIndex, this.slideIndex);
  }

  onBeforeReveal() {
    this.loadSlideshowImages();
    this.loadThumbnails();
  }

  onReveal() {
    //
  }

  onSlideToComplete(previousIndex, currentIndex) {
    this.$thumbnailSlides.removeClass(classes.thumbnailSlideActive);
    this.$thumbnailSlides.eq(currentIndex).addClass(classes.thumbnailSlideActive);

    if (this.desktopZoomController.enabled) {
      this.desktopZoomController.destroyHoverZoom(this.getSlide(previousIndex));
      this.desktopZoomController.initHoverZoom(this.getSlide(currentIndex));
    }
  }

  onThumbnailSlideClick(e) {
    this.slideTo($(e.currentTarget).index());
  }
}

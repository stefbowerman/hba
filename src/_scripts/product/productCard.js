import $ from 'jquery';
import { isTouch } from '../core/utils';

const selectors = {
  el: '[data-product-card]',
  gallery: '[data-product-card-gallery]',
  mainLazyImg: '[data-product-card-main-lazy]'
};

const classes = {
  loaded: 'is-loaded'
};

export default class ProductCard {
  /**
   * Product Card constructor
   *
   * @param {HTMLElement | $} el - The card element
   */
  constructor(el, options) {
    this.name = 'productCard';

    const defaults = {
      onClick:      () => {},
      onMouseenter: () => {},
      onMouseleave: () => {},
      onTouchStart: () => {},
      onTouchend:   () => {}
    };

    this.$el = $(el);
    this.$gallery = $(selectors.gallery, this.$el);
    this.$mainLazyImg = $(selectors.mainLazyImg, this.$el);

    if (this.$el === undefined || !this.$el.is(selectors.el)) {
      console.warn(`[${this.name}] - Element matching ${selectors.el} required to initialize.`);
      return;
    }

    this.settings = $.extend({}, defaults, options);

    this.id            = this.$el.data('id');
    this.productType   = this.$el.data('product-type');
    this.sale          = this.$el.data('sale');
    this.isPreview     = !!this.$el.data('preview');
    this.isTouch       = isTouch();

    /* eslint-disable */

    // Events
    this.$el.on({
      click:      e => this.settings.onClick(e, this),
      mouseenter: e => { !this.isTouch && this.settings.onMouseenter(e, this); },
      mouseleave: e => { !this.isTouch && this.settings.onMouseleave(e, this); },
      touchstart: e => {  this.isTouch && this.settings.onTouchstart(e, this); },
      touchend:   e => {  this.isTouch && this.settings.onTouchend(e, this); },
    });

    /* eslint-enable */

    // Unveil plugin to lazy load main product card images
    this.$mainLazyImg
      .on('load', () => {
        this.onUnveiled();
      })
      .unveil(200);
  }

  unveil() {
    this.$mainLazyImg.trigger('unveil');
  }

  onUnveiled() {
    this.$el.addClass(classes.loaded);
  }
}

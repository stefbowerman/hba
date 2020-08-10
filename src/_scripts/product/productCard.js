import $ from 'jquery';
import Typed from 'typed.js';

const selectors = {
  el: '[data-product-card]',
  gallery: '[data-product-card-gallery]',
  mainLazyImg: '[data-product-card-main-lazy]',
  sku: '[data-sku]'
};

const classes = {
  mainLoaded: 'is-loaded',
  visible: 'is-visible'
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
      onMouseleave: () => {}
    };

    this.$el = $(el);
    this.$mainLazyImg = $(selectors.mainLazyImg, this.$el);
    this.$sku = $(selectors.sku, this.$el);

    if (this.$el === undefined || !this.$el.is(selectors.el)) {
      console.warn(`[${this.name}] - Element matching ${selectors.el} required to initialize.`);
      return;
    }

    this.settings = $.extend({}, defaults, options);
    this.skuTyped = null;
    this.skuTimeout = null;

    // @TODO - create these props from this.$el.get(0).dataSet?
    this.id            = this.$el.data('id');
    this.url           = this.$el.data('url');
    this.handle        = this.$el.data('handle');
    this.productType   = this.$el.data('product-type');
    this.sale          = this.$el.data('sale');
    this.documentTitle = this.$el.data('document-title');

    // Events
    this.$el.on({
      click:      e => this.settings.onClick(e, this),
      mouseenter: e => this.settings.onMouseenter(e, this),
      mouseleave: e => this.settings.onMouseleave(e, this)
    });

    // Unveil plugin to lazy load main product card images
    this.$mainLazyImg.unveil(200, function() {
      const $img = $(this);
      $img.on('load', () => {
        $img.parents(selectors.gallery).addClass(classes.mainLoaded);
      });
    });
  }

  destroy() {
    this.skuTyped && this.skuTyped.destroy();
    clearTimeout(this.skuTimeout);
  }

  show() {
    const sku = this.$sku.text();
    this.$sku.text('');

    this.$el.addClass(classes.visible);

    if (this.$sku.length) {
      this.skuTimeout = setTimeout(() => {
        this.skuTyped = new Typed(this.$sku.get(0), {
          strings: [sku],
          typeSpeed: 30,
          showCursor: false
        });
      }, 300);
    }    
  }

  hide() {
    this.$el.removeClass(classes.visible);
    this.skuTyped && this.skuTyped.destroy();
  }
}

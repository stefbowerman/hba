import $ from 'jquery';

const selectors = {
  el: '[data-product-card]',
  gallery: '[data-product-card-gallery]',
  mainLazyImg: '[data-product-card-main-lazy]'
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

    if (this.$el === undefined || !this.$el.is(selectors.el)) {
      console.warn(`[${this.name}] - Element matching ${selectors.el} required to initialize.`);
      return;
    }

    this.settings = $.extend({}, defaults, options);

    // @TODO - create these props from this.$el.get(0).dataSet?
    this.id            = this.$el.data('id');
    this.productType   = this.$el.data('product-type');
    this.sale          = this.$el.data('sale');
    this.isPreview     = !!this.$el.data('preview');

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
    //
  }

  unveil() {
    this.$mainLazyImg.trigger('unveil');
  }

  show() {
    this.$el.addClass(classes.visible);  
  }

  hide() {
    this.$el.removeClass(classes.visible);
  }
}

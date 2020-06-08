import $ from 'jquery';

const selectors = {
  el: '[data-product-card]',
  gallery: '[data-product-card-gallery]',
  mainLazyImg: '[data-product-card-main-lazy]',
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
    this.namespace = `.${this.name}`;

    const defaults = {
      onClick: () => {},
      onMouseenter: () => {},
      onMouseleave: () => {}
    };

    this.$el = $(el);

    if (this.$el === undefined || !this.$el.is(selectors.el)) {
      console.warn(`[${this.name}] - Element matching ${selectors.el} required to initialize.`);
      return;
    }

    this.settings = $.extend({}, defaults, options);
    this.id = this.$el.data('id');
    this.handle = this.$el.data('handle');
    this.url = this.$el.data('url');
    this.productType = this.$el.data('product-type');
    this.sale = this.$el.data('sale');

    this.$mainLazyImg = $(selectors.mainLazyImg, this.$el);

    // Unveil plugin to lazy load main product card images
    this.$mainLazyImg.unveil(200, function() {
      const $img = $(this);
      $img.on('load', () => {
        $img.parents(selectors.gallery).addClass(classes.mainLoaded);
      });
    });

    // Events
    this.$el.on({
      click: e => this.settings.onClick(e, this),
      mouseenter: e => this.settings.onMouseenter(e, this),
      mouseleave: e => this.settings.onMouseleave(e, this)
    });
  }

  show() {
    this.$el.addClass(classes.visible);
  }
}

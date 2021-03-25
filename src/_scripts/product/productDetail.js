import $ from 'jquery';
import ProductDetailForm from './productDetailForm';
import ProductDetailGallery from './productDetailGallery';

const selectors = {
  productDetailForm: '[data-product-detail-form]',
  productGallery: '[data-product-gallery]'
};

export default class ProductDetail {
  /**
   * ProductDetail constructor
   *
   *
   * @param {jQuery | HTMLElement} el - Main element, see snippets/product-detail.liquid
   * @param {Boolean} enableHistoryState - enables URL history updates on variant change.  See productDetailForm.js
   */
  constructor(el, enableHistoryState = true) {
    this.settings = {};
    this.name = 'productDetail';

    this.$el = $(el);

    if (!this.$el || this.$el === undefined) {
      console.warn(`[${this.name}] - $el required to initialize`);
      return;
    }

    this.$pg  = $(selectors.productGallery, this.$el);
    this.$pdf = $(selectors.productDetailForm, this.$el);
    
    this.gallery = new ProductDetailGallery(this.$pg);
    this.form    = new ProductDetailForm({
      $container: this.$pdf,
      enableHistoryState: enableHistoryState
    });
  }

  destroy() {
    this.form.destroy();
  }
}

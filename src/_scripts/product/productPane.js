import $ from 'jquery';
import ProductDetail from './productDetail';

const selectors = {
  productDetail: '[data-product-detail]'
};

const classes = {
  productDetailActive: 'is-active'
};

export default class ProductPane {
  constructor(container) {
    this.$container = $(container);
    this.$productDetails = $(selectors.productDetail, this.$container);
    this.productDetails = $.map(this.$productDetails, el => new ProductDetail(el, false));
    // this.$selectedProductDetail = this.$productDetails.filter(`.${classes.productDetailActive}`);
  }

  activate(cardId) {
    this.productDetails.forEach((pd) => {
      // Needs to be a hide / show method on the product detail so it can do some clean up
      pd.$el.toggleClass(classes.productDetailActive, cardId === pd.id);
    });
  }
}

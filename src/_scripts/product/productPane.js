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
    this.productDetails = $.map($(selectors.productDetail, this.$container), el => new ProductDetail(el, false));
    // this.selectedProductDetail = $(selectors.productDetail, this.$container).filter(`.${classes.productDetailActive}`);
  }

  activate(cardId) {
    this.productDetails.forEach((pd) => {
      // Needs to be a hide / show method on the product detail so it can do some clean up
      pd.$el.toggleClass(classes.productDetailActive, cardId === pd.id);
    });
  }
}

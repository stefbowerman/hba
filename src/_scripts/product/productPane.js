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
    this.activeProductDetail = this.productDetails.find(pd => pd.$el.hasClass(classes.productDetailActive));
  }

  activate(cardId) {
    this.productDetails.forEach((pd) => {
      // Needs to be a hide / show method on the product detail so it can do some clean up
      if (cardId === pd.id) {
        pd.$el.addClass(classes.productDetailActive);
        this.activeProductDetail = pd;
      }
      else {
        pd.$el.removeClass(classes.productDetailActive);        
      }
    });
  }

  deactivate() {
    this.activeProductDetail && this.activeProductDetail.$el.removeClass(classes.productDetailActive);
  }
}

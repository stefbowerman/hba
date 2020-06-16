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

  // @TODO - Cleanup this method...
  activate(cardId) {
    if (this.activeProductDetail && this.activeProductDetail.id === cardId) return;

    if (this.activeProductDetail) {
      this.activeProductDetail.$el.fadeOut(180, () => this.activeProductDetail.$el.removeClass(classes.productDetailActive));
    }

    this.productDetails.forEach((pd) => {
      // Needs to be a hide / show method on the product detail so it can do some clean up
      if (cardId === pd.id) {
        setTimeout(() => {
          pd.$el.fadeIn(180, () => {
            pd.$el.addClass(classes.productDetailActive);
            pd.onReveal();

            this.activeProductDetail = pd;
          })
        }, this.activeProductDetail ? 180 : 0);
      }
    });
  }

  deactivate() {
    this.activeProductDetail && this.activeProductDetail.$el.removeClass(classes.productDetailActive);
  }
}

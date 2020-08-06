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
    this.activeProductDetail = null;

    // Look through them and see if one is selected
    $.each(this.productDetails, (i, pd) => {
      if (pd.$el.data('selected')) {
        this.activate(pd.id);
      }
    });
  }

  isActive(cardId) {
    return this.activeProductDetail && this.activeProductDetail.id === cardId;
  }

  // @TODO - Cleanup this method...
  activate(cardId) {
    const d = $.Deferred();

    if (this.isActive(cardId)) {
      return d.resolve();
    }

    if (this.activeProductDetail) {
      this.activeProductDetail.$el.fadeOut(180, () => {
        this.activeProductDetail.$el.removeClass(classes.productDetailActive);
        this.activeProductDetail.onHidden();
      });
    }

    this.productDetails.forEach((pd) => {
      // Needs to be a hide / show method on the product detail so it can do some clean up
      if (cardId === pd.id) {
        setTimeout(() => {
          pd.$el.fadeIn(180, () => {
            pd.$el.addClass(classes.productDetailActive);
            pd.onReveal();

            this.activeProductDetail = pd;
            d.resolve();
          });
        }, this.activeProductDetail ? 180 : 0);
      }
    });

    return d;
  }

  deactivate() {
    this.activeProductDetail && this.activeProductDetail.$el.removeClass(classes.productDetailActive);
  }
}

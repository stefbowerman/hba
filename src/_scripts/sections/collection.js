import $ from 'jquery';
import BaseSection from './base';
import ProductDetail from '../product/productDetail';
import ProductCard from '../product/productCard';

const selectors = {
  productCard:   '[data-product-card]',
  productPane:   '[data-product-pane]',
  productDetail: '[data-product-detail]'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    this.$productPane = $(selectors.productPane, this.$container);

    this.productDetails = $.map($(selectors.productDetail, this.$container), (el, i) => new ProductDetail(el, false));
    this.productCards = $.map($(selectors.productCard, this.$container), el => new ProductCard(el, {
      onClick: this.onProductCardClick.bind(this)
    }));

    this.productCards.forEach((card, i) => setTimeout(() => card.show(), (150 * i)));
  }

  onProductCardClick(e, card) {
    e.preventDefault();

    this.productDetails.forEach((pd) => {
      // Needs to be a hide / show method on the product detail so it can do some clean up
      pd.$el.toggleClass('is-active', card.id === pd.id);
    });

    if (window.HBA) {
      window.HBA.appController
        .pauseRouter()
        .navigate(card.url)
        .resumeRouter();
    }
  }
}

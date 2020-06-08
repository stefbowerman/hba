import $ from 'jquery';
import ProductCard from './productCard';

const selectors = {
  productCard: '[data-product-card]',
};

export default class ProductCardGrid {
  /**
   * ProductDetail constructor
   *
   *
   * @param {jQuery | HTMLElement} container
   * @param {Object} options
   */
  constructor(container, options) {
    this.$container = $(container);

    const defaults = {
      onProductCardClick: (e, card) => {},
      onProductCardMouseenter: () => {},
      onProductCardMouseleave: () => {},
    };

    this.settings = $.extend({}, defaults, options);
    this.revealed = false;

    this.productCards = $.map($(selectors.productCard, this.$container), el => new ProductCard(el, {
      onClick: this.settings.onProductCardClick,
      onMouseenter: this.settings.onProductCardMouseenter,
      onMouseleave: this.settings.onProductCardMouseleave
    }));
  }

  reveal() {
    if (this.revealed) return;

    this.productCards.forEach((card, i) => setTimeout(() => card.show(), (150 * i)));

    this.revealed = true;
  }

  filterBy(url) {
    console.log(url);
  }
}

import $ from 'jquery';
import { camelize } from '../core/utils';
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
    this.timeouts = [];

    this.productCards = $.map($(selectors.productCard, this.$container), el => new ProductCard(el, {
      onClick: this.settings.onProductCardClick,
      onMouseenter: this.settings.onProductCardMouseenter,
      onMouseleave: this.settings.onProductCardMouseleave
    }));
  }

  destroy() {
    $.each(this.productCards, (k, card) =>  card.destroy());
    $.each(this.timeouts, (i, timeout) => clearTimeout(timeout));
  }

  reveal() {
    if (this.revealed) return;

    this.productCards.forEach(card => card.show());
    this.revealed = true;
  }

  // Filter is instance of collection filter
  filterBy(filter = null) {
    if (filter) {
      const filterType = camelize(filter.type);
      this.productCards.forEach((card) => {
        card[filterType] === filter.value ? card.filterIn() : card.filterOut();
      });
    }
    else {
      this.productCards.forEach(card => card.clearFilter());
    }
  }
}

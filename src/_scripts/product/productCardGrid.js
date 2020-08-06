import $ from 'jquery';
import {
  camelize,
  random
} from '../core/utils';
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

    this.productCards.forEach((card, i) => {
      const min = (i+1) * 120;
      const max = (i+1) * 200;
      this.timeouts.push(setTimeout(() => card.show(), random(min, max)));
    });

    this.revealed = true;
  }

  // Filter is instance of collection filter
  filterBy(filter = null) {
    if (filter) {
      const filterType = camelize(filter.type);

      this.productCards.forEach((card) => {
        // Product card has properties 'productType', 'sale'..
        if (card[filterType] === filter.value) {
          card.show();
        }
        else {
          card.hide();
        }
      });
    }
    else {
      this.productCards.forEach(card => card.show());
    }
  }
}

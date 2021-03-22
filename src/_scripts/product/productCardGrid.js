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
   * @param {jQuery | HTMLElement} element
   * @param {Object} options
   */
  constructor(el, options) {
    this.$el = $(el);

    const defaults = {
      onProductCardClick: (e, card) => {},
      onProductCardMouseenter: () => {},
      onProductCardMouseleave: () => {},
    };

    this.settings = $.extend({}, defaults, options);
    this.revealed = false;
    this.timeouts = [];

    this.productCards = $.map($(selectors.productCard, this.$el), _el => new ProductCard(_el, {
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
    const filterType = camelize(filter.type);
    
    if (filter) {
      this.productCards.forEach((card) => {
        if (card[filterType] === filter.value) {
          card.unveil();
          card.$el.parent().show();
        }
        else {
          card.$el.parent().hide();
        }
      });
    }
    else {
      this.productCards.forEach((card) => {
        card.unveil();
        card.$el.parent().show();
      });
    }
  }

  setColumnCount(count) {
    if (!(count === 2 || count === 4)) return;

    this.$el.attr('data-columns', count);
  }
}

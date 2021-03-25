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

    this.productCards = $.map($(selectors.productCard, this.$el), _el => new ProductCard(_el, {
      onClick: this.settings.onProductCardClick,
      onMouseenter: this.settings.onProductCardMouseenter,
      onMouseleave: this.settings.onProductCardMouseleave
    }));

    this.$el.css('visibility', 'none'); // wait for reveal
  }

  reveal() {
    if (this.revealed) return;

    this.$el.css('visibility', '');
    this.revealed = true;
  }

  // Filter is instance of collection filter
  filterBy(filter = null) {
    if (filter) {
      const filterType = camelize(filter.type);

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

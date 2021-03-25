import $ from 'jquery';
import BaseSection from './base';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCard: '[data-product-card]',
  productCardGrid: '[data-product-card-grid]',
  details: '[data-details]'
};

const classes = {
  detailsHighlighted: 'highlighted'
};

export default class LookbookSection extends BaseSection {
  constructor(container) {
    super(container, 'lookbook');

    this.$details = $(selectors.details, this.$container);

    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardMouseenter: this.onProductCardMouseenter.bind(this),
      onProductCardMouseleave: this.onProductCardMouseleave.bind(this),
      onProductCardTouchstart: this.onProductCardTouchstart.bind(this),
      onProductCardTouchend:   this.onProductCardTouchend.bind(this)
    });

    this.productCardGrid.reveal();
  }

  highlightCard(card) {
    this.$details
      .filter((i, el) => $(el).data('id') === card.id)
      .addClass(classes.detailsHighlighted);
  }

  unhighlightCards() {
    this.$details
      .filter(`.${classes.detailsHighlighted}`)
      .removeClass(classes.detailsHighlighted);    
  }

  onProductCardMouseenter(e, card) {
    this.highlightCard(card);
  }

  onProductCardMouseleave(e, card) {
    this.unhighlightCards();
  }

  onProductCardTouchstart(e, card) {
    this.highlightCard(card);
  }

  onProductCardTouchend(e, card) {
    this.unhighlightCards();
  }
}

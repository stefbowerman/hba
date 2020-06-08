import $ from 'jquery';
import BaseSection from './base';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCard: '[data-product-card]',
  productCardGrid: '[data-product-card-grid]',
  details: '[data-details]'
};

export default class LookbookSection extends BaseSection {
  constructor(container) {
    super(container, 'lookbook');

    // @TODO - Do this better, create card + detail pairs in the contructor ??
    this.$details = $(selectors.details, this.$container);

    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardMouseenter: this.onProductCardMouseenter.bind(this),
      onProductCardMouseleave: this.onProductCardMouseleave.bind(this),
    });

    this.productCardGrid.reveal();
  }

  onProductCardMouseenter(e, card) {
    this.$details.filter((i, el) => $(el).data('id') === card.id).addClass('highlight');
  }

  onProductCardMouseleave(e, card) {
    this.$details
      .filter('.highlight')
      .removeClass('highlight');
  }
}

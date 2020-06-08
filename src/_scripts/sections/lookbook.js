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

    this.$details = $(selectors.details, this.$container);

    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container));

    // @TODO - Do this better, create card + detail pairs in the contructor
    // @TODO - Add these mouseevents as options for the productcardgrid
    //         If we do that then we can pass the card directly and not have to query with data('id')
    // add mouseenter/leave events to each pair and store the currently highlighted one
    this.$container.on('mouseenter', selectors.productCard, this.onProductCardMouseenter.bind(this));
    this.$container.on('mouseleave', selectors.productCard, this.onProductCardMouseleave.bind(this));

    this.productCardGrid.reveal();
  }

  onProductCardMouseenter(e) {
    const id = $(e.currentTarget).data('id');

    this.$details.filter((i, el) => {
      return $(el).data('id') === id;
    }).addClass('highlight');
  }

  onProductCardMouseleave(e) {
    this.$details
      .filter('.highlight')
      .removeClass('highlight');
  }
}

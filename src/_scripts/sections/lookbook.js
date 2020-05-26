import $ from 'jquery';
import BaseSection from './base';
import ProductCard from '../product/productCard';

const selectors = {
  productCard: '[data-product-card]',
  details: '[data-details]'
};

export default class LookbookSection extends BaseSection {
  constructor(container) {
    super(container, 'lookbook');

    this.$details = $(selectors.details, this.$container);

    this.productCards = $.map($(selectors.productCard, this.$container), el => new ProductCard(el));

    // @TODO - Do this better, create card + detail pairs in the contructor
    // add mouseenter/leave events to each pair and store the currently highlighted one
    this.$container.on('mouseenter', selectors.productCard, this.onProductCardMouseenter.bind(this));
    this.$container.on('mouseleave', selectors.productCard, this.onProductCardMouseleave.bind(this));

    // Reveal
    this.productCards.forEach((card, i) => setTimeout(() => card.show(), (150 * i)));    
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

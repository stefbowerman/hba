import $ from 'jquery';
import BaseSection from './base';
import ProductCard from '../view/product/productCard';

const selectors = {
  productCard: '[data-product-card]',
  details: '[data-details]'
};

export default class LookbookSection extends BaseSection {
  constructor(container) {
    super(container, 'lookbook');

    this.productCards = $.map($(selectors.productCard, this.$container), (el, i) => {
      $(el)
        .hide()
        .delay(150 * i)
        .fadeIn(50);

      return new ProductCard(el);
    });

    // @TODO - Do this better, create card + detail pairs in the contructor
    // add mouseenter/leave events to each pair and store the currently highlighted one
    this.$container.on('mouseenter', selectors.productCard, this.onProductCardMouseenter.bind(this));
    this.$container.on('mouseleave', selectors.productCard, this.onProductCardMouseleave.bind(this));
  }

  onProductCardMouseenter(e) {
    const id = $(e.currentTarget).data('id');

    $(selectors.details, this.$container).filter((i, el) => {
      return $(el).data('id') === id;
    }).addClass('highlight');
  }

  onProductCardMouseleave(e) {
    $(selectors.details, this.$container)
      .filter('.highlight')
      .removeClass('highlight');
  }
}

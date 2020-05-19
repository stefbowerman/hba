import $ from 'jquery';
import BaseSection from './base';
import ProductCard from '../view/product/productCard';

const selectors = {
  // collectionJson: '[data-collection-json]',
  productCard: '[data-product-card]',
  productPane: '[data-product-pane]'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    this.$productPane = $(selectors.productPane, this.$container);

    // Stop parsing if we don't have the collection json script tag
    // if (!$(selectors.collectionJson, this.$container).html()) {
    //   console.warn(`[${this.name}] - Element matching ${selectors.collectionJson} required.`);
    //   return;
    // }

    // this.collectionData = JSON.parse($(selectors.collectionJson, this.$container).html());
    this.productCards = $.map($(selectors.productCard, this.$container), (el, i) => {
      $(el).hide();
      $(el).delay(150 * i).fadeIn(50);
      return new ProductCard(el);
    });

    this.$container.on('click', selectors.productCard, this.onProductCardClick.bind(this));
  }

  onProductCardClick(e) {
    e.preventDefault();
    const $card = $(e.currentTarget).clone();
    this.$productPane.html($card);
  }
}

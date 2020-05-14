import $ from 'jquery';
import BaseSection from './base';
import ProductCard from '../view/product/productCard';

const selectors = {
  // collectionJson: '[data-collection-json]',
  productCard: '[data-product-card]'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    // Stop parsing if we don't have the collection json script tag
    // if (!$(selectors.collectionJson, this.$container).html()) {
    //   console.warn(`[${this.name}] - Element matching ${selectors.collectionJson} required.`);
    //   return;
    // }

    // this.collectionData = JSON.parse($(selectors.collectionJson, this.$container).html());
    this.productCards   = $.map($(selectors.productCard, this.$container), el => new ProductCard(el));
  }
}

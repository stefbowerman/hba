import $ from 'jquery';
import BaseSection from './base';
import ProductPane from '../product/productPane';

const selectors = {
  productPane: '[data-product-pane]'
};

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.productPane = new ProductPane($(selectors.productPane, this.$container));
  }
}

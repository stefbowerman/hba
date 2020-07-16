import $ from 'jquery';
import BaseSection from './base';
import ProductDetail from '../product/productDetail';

const selectors = {
  productDetail: '[data-product-detail]'
};

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.$productDetails = $(selectors.productDetail, this.$container);
    this.productDetails = $.map(this.$productDetails, el => new ProductDetail(el, false));
  }
}

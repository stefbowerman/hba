import $ from 'jquery';
import BaseSection from './base';
import ProductDetail from '../product/productDetail';

const selectors = {
  productDetail: '[data-product-detail]'
};

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.productDetail = new ProductDetail($(selectors.productDetail, this.$container));
  }

  onUnload() {
    this.productDetail.destroy();
  }
}

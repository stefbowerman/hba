import BaseView from './base';
import ProductSection from '../sections/product';

export default class ProductView extends BaseView {
  constructor($el, type) {
    super($el, type);

    this.sectionManager.register('product', ProductSection);
  }
}

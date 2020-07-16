import BaseView from './base';
import ProductSection from '../sections/product';

export default class ProductView extends BaseView {
  constructor($el, type) {
    super($el, type);

    this.productSection = new ProductSection($el.find('[data-section-type="product"]'));

    this.sections.push(this.productSection);
  }

  display() {
    this.productSection.display();
  }
}

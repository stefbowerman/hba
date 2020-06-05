import BaseView from './base';
import CartSection from '../sections/cart';

export default class CartView extends BaseView {
  constructor($el, type, router) {
    super($el, type, router);

    this.cartSection = new CartSection($el.find('[data-section-type="cart"]'));

    this.sections.push(this.cartSection);
  }
}

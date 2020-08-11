import BaseView from './base';
import CollectionSection from '../sections/collection';

export default class ProductView extends BaseView {
  constructor($el, type) {
    super($el, type);

    this.collectionSection = new CollectionSection($el.find('[data-section-type="collection"]'));

    this.sections.push(this.collectionSection);
  }
}

import BaseView from './base';
import CollectionSection from '../sections/collection';

export default class CollectionView extends BaseView {
  constructor($el) {
    super($el);

    this.collectionSection = new CollectionSection($el.find('[data-section-type="collection"]'));

    this.sections.push(this.collectionSection);
  }
}

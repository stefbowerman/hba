import BaseView from './base';
import CollectionSection from '../sections/collection';
import LookbookSection from '../sections/lookbook';

export default class CollectionView extends BaseView {
  constructor($el) {
    super($el);

    // Could be one or the other?
    this.collectionSection = new CollectionSection($el.find('[data-section-type="collection"]'));
    this.lookbookSection   = new LookbookSection($el.find('[data-section-type="lookbook"]'));

    this.sections.push(this.collectionSection);
    this.sections.push(this.lookbookSection);
  }
}

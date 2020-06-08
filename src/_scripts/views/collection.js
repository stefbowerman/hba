import BaseView from './base';
import CollectionSection from '../sections/collection';
import LookbookSection from '../sections/lookbook';

export default class CollectionView extends BaseView {
  constructor($el, type, router) {
    super($el, type, router);

    // Could be one or the other?
    const $collectionSection = $el.find('[data-section-type="collection"]');
    const $lookbookSection   = $el.find('[data-section-type="lookbook"]');

    if ($collectionSection.length) {
      this.sections.push(new CollectionSection($collectionSection));
    }
    if ($lookbookSection.length) {
      this.sections.push(new LookbookSection($lookbookSection));
    }
  }
}

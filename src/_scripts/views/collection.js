import BaseView from './base';
import CollectionSection from '../sections/collection';
import LookbookSection from '../sections/lookbook';

export default class CollectionView extends BaseView {
  constructor($el, type) {
    super($el, type);

    this.sectionManager.register('collection', CollectionSection);
    this.sectionManager.register('lookbook', LookbookSection);
  }
}

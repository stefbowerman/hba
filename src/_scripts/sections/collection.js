import BaseSection from './base';
import Collection from '../collection/collection';

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    this.collection = new Collection(this.$container);
  }
}

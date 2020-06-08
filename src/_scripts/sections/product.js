import BaseSection from './base';
import Collection from '../collection/collection';

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.collection = new Collection(this.$container);
  }
}

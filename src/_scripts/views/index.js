import $ from 'jquery';
import BaseView from './base';

export default class IndexView extends BaseView {
  constructor($el, type) {
    super($el, type);

    $('[data-section-id]').each((i, el) => {
      this._createSectionInstance($(el));
    });
  }
}

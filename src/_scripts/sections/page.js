import $ from 'jquery';
import BaseSection from './base';

export default class PageSection extends BaseSection {
  constructor(container) {
    super(container, 'page');

    this.timeouts = [];

    const $rte = $('.rte', this.$container).first();
    const $children = $rte.children();

    $children.hide();

    setTimeout(() => {
      this.timeouts = $.map($children, (child, i) => {
        return setTimeout(() => {
          $(child).show();
        }, (250 * i));
      });
    }, 1000);
  }

  onUnload() {
    this.timeouts.forEach(tO => clearTimeout(tO));
  }
}

import $ from 'jquery';
import Typed from 'typed.js';
import BaseSection from './base';

export default class PageSection extends BaseSection {
  constructor(container) {
    super(container, 'page');

    this.$rte = $('.rte', this.$container).first();

    this.$rte.hide();

    // @TODO - This is done poorly, just getting a basic implementation down
    const $typedSpot = $(document.createElement('div')).css('max-width', '40em').addClass('rte');
    this.$rte.after($typedSpot);

    const stringsElement = this.$rte.get(0);

    this.typed = new Typed($typedSpot.get(0), {
      stringsElement: stringsElement,
      typeSpeed: 5,
      showCursor: false
    });
  }

  onUnload() {
    this.typed.destroy();
  }
}

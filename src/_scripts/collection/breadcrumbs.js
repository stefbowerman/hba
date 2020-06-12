import $ from 'jquery';
import Typed from 'typed.js';

const selectors = {
  crumb: '[data-crumb]'
};

export default class Breadcrumbs {
  constructor(container) {
    this.$container = $(container);
    this.$crumbs = $(selectors.crumb, this.$container);

    this.typed = null;

    this.crumbMap = {
      // collections: $crumb,
      // collection-product: $crumb
    };

    this.$crumbs.each((i, el) => {
      const $el = $(el);
      this.crumbMap[$el.data('crumb')] = $el;
    });    
  }

  setCrumb(part, text, url) {
    if (!this.crumbMap.hasOwnProperty(part)) return;

    const $crumb = this.crumbMap[part];
    
    $crumb.attr('href', url).text('');
    
    if (this.typed) {
      this.typed.destroy();
    }

    // Type out the text
    this.typed = new Typed($crumb.get(0), {
      strings: [text],
      typeSpeed: 20,
      showCursor: false,
      startDelay: 100
    });
  }  
}
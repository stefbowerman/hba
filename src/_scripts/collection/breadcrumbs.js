import $ from 'jquery';
import Typed from 'typed.js';

const selectors = {
  crumb: '[data-crumb]'
};

const classes = {
  crumbHidden: 'is-hidden'
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
    const $link = $crumb.find('a');

    if (text && url) {
      if ($link.text() === text && $link.attr('href') === url) {
        return;
      }

      $link
        .attr('href', url)
        .text('');
      
      if (this.typed) {
        this.typed.destroy();
      }

      $crumb.removeClass(classes.crumbHidden);

      // Type out the text
      this.typed = new Typed($link.get(0), {
        strings: [text],
        typeSpeed: 20,
        showCursor: false,
        startDelay: 100
      });
    }
    else {
      // Hide it
      $crumb.addClass(classes.crumbHidden);
      $link.text('');
    }
  }  
}
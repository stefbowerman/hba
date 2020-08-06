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

    this.crumbMap = {
      // collections: {
      //   $el: $crumb,
      //   typer: null
      // }
    };

    $(selectors.crumb, this.$container).each((i, el) => {
      const $el = $(el);
      this.crumbMap[$el.data('crumb')] = {
        $el: $el,
        typer: null
      };
    });    
  }

  setCrumb(part, text, url) {
    if (!this.crumbMap.hasOwnProperty(part)) return;

    const $crumb = this.crumbMap[part].$el;
    const typer  = this.crumbMap[part].typer;
    const $link = $crumb.find('a');

    if (text && url) {
      if ($link.text() === text && $link.attr('href') === url) {
        return;
      }

      $link
        .attr('href', url)
        .text('');
      
      if (typer) {
        typer.destroy();
      }

      $crumb.removeClass(classes.crumbHidden);

      // Type out the text
      this.crumbMap[part].typer = new Typed($link.get(0), {
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
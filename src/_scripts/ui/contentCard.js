import $ from 'jquery';
import { isTouch } from '../core/utils';

export default class ContentCard {
  constructor(el) {
    this.$el = $(el);
    this.$btn = this.$el.find('.btn');

    if (isTouch()) {
      this.$el.on({
        touchstart: () => this.setHovered(true),
        touchend: () => this.setHovered(false)
      });
    }
    else {
      this.$el.on({
        mouseenter: () => this.setHovered(true),
        mouseleave: () => this.setHovered(false)
      });
    }
  }

  setHovered(hovered = true) {
    this.$el.toggleClass('is-hovered', hovered);
    this.$btn.toggleClass('is-hovered', hovered);
  }

  activate() {
    this.$el.addClass('is-active');
  }

  showImage() {
    this.$el.addClass('show-image');
  }

  showCopy() {
    this.$el.addClass('show-copy');
  }
}

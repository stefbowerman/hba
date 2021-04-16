import $ from 'jquery';
import AmbientVideo from '../ui/ambientVideo';

const selectors = {
  ambientVideo: '[data-ambient-video]'
};

export default class BaseSection {
  constructor(container, name) {
    this.$container = container instanceof $ ? container : $(container);
    this.id = this.$container.data('section-id');
    this.type = this.$container.data('section-type');
    this.name = name;
    this.namespace = `.${this.name}`;

    this.events = {
      SCROLL: `scroll${this.namespace}`,
      CLICK: `click${this.namespace}`,
      RESIZE: `resize${this.namespace}`,
      MOUSEENTER: `mouseenter${this.namespace}`,
      MOUSELEAVE: `mouseleave${this.namespace}`
    };

    $(selectors.ambientVideo, this.$container).each((i, el) => {
      new AmbientVideo(el);
    });
  }

  onUnload(e) {

  }

  onSelect(e) {

  }

  onDeselect(e) {

  }

  onReorder(e) {

  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }
}

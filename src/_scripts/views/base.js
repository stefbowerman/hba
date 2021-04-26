import SectionManager from '../core/sectionManager';

export default class BaseView {
  constructor($el, type = 'base') {
    this.$el = $el;
    this.type = type;
    this.sectionManager = new SectionManager(this.$el);
  }

  destroy() {
    this.sectionManager.destroy();
  }
}

import $ from 'jquery';
import BaseSection from '../sections/base';

const $document = $(document);

const SectionConstructorDictionary = {};

export default class BaseView {
  constructor($el, router) {
    this.$el = $el;
    this.router = router;
    this.sections = [];

    $document.on('shopify:section:load',   this.onSectionLoad.bind(this));
    $document.on('shopify:section:unload', this.onSectionUnload.bind(this));
    
    // console.log('BaseView - contructing view');    
  }

  _createSectionInstance($container) {
    // const id = $container.attr('data-section-id');
    const type = $container.attr('data-section-type');

    const Constructor = SectionConstructorDictionary[type];

    // Need to make sure we're working with actual sections here..
    if (typeof Constructor === 'undefined' || !(Constructor.prototype instanceof BaseSection)) {
      return;
    }

    // console.log('creating new section instance for type - ' + type );

    this.sections.push(new Constructor($container));
  }

  onSectionLoad(e) {
    // console.log('[BaseView] - calling section LOAD');

    this._createSectionInstance($('[data-section-id]', e.target));
  }

  onSectionUnload(e) {
    const remainingSections = [];
    this.sections.forEach((section) => {
      if (section.id === e.detail.sectionId) {
        section.onUnload();
      }
      else {
        remainingSections.push(section);
      }
    });

    this.sections = remainingSections;
  }

  destroy() {
    // console.log('[BaseView] - calling DESTROY');
    if (this.sections.length) {
      this.sections.forEach((section) => {
        section.onUnload && section.onUnload();
      });
    }
  }

  // transitionIn() {
  //   // console.log('transition in!');
  // }

  // transitionOut(callback) {
  //   callback();
  // }
}

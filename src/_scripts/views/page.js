import BaseView from './base';
import PageSection from '../sections/page';

export default class PageView extends BaseView {
  constructor($el, type) {
    super($el, type);
    
    this.sectionManager.register('page', PageSection);
  }
}

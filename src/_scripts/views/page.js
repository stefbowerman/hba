import BaseView from './base';
import PageSection from '../sections/page';

export default class PageView extends BaseView {
  constructor($el, type) {
    super($el, type);

    this.sections.push(new PageSection($el.find('[data-section-type="page"]')));
  }
}

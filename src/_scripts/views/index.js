// import $ from 'jquery';
import BaseView from './base';
import Phase3Section from '../sections/phase3';

export default class IndexView extends BaseView {
  constructor($el, type) {
    super($el, type);

    this.phase3Section = new Phase3Section($el.find('[data-section-type="phase-3"]'));

    this.sections.push(this.phase3Section);
  }

  display() {
    this.phase3Section.display();
  }
}

import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  header: '[data-header]'
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.theme = null;

    this.$header = $(selectors.header, this.$container);
  }

  get themeClass() {
    return this.theme ? `theme-${this.theme}` : '';
  }

  setTheme(theme) {
    if (theme === this.theme) return;

    this.$header.removeClass(this.themeClass);
    this.theme = theme;
    this.$header.addClass(this.themeClass);
  }
}

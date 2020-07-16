import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  logo: '[data-logo]'
};

const classes = {
  logoStrobe: 'is-strobing'
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.$logo = $(selectors.logo, this.$container);

    this.strobeLogo();
  }

  strobeLogo() {
    this.$logo.toggleClass(classes.logoStrobe);

    const min = 8;
    const max = 20;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);
    setTimeout(this.strobeLogo.bind(this), rand * 100);
  }
}

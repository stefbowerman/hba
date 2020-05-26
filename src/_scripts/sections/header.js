import $ from 'jquery';
import { isTouch } from '../core/utils';
import BaseSection from './base';
import Overlay from '../ui/overlay';

const selectors = {
  logo: '[data-logo]',
  menuOverlay: '[data-menu-overlay]',
  navLink: '.header-nav__link',
  subnavToggle: '[data-subnav-toggle]',
  subnav: '[data-subnav]'
};

const classes = {
  headerFixed: 'is-fixed',
  logoStrobe: 'is-strobing',
  navLinkActive: 'is-active'
};

const $body = $(document.body);

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.$logo        = $(selectors.logo, this.$container);
    this.$menuOverlay = $(selectors.menuOverlay, this.$container);
    this.menuOverlay  = new Overlay(this.$menuOverlay);

    this.$logo.on('click', this.onLogoClick.bind(this));
    this.$container.on('click', selectors.subnavToggle, this.onSubnavToggleClick.bind(this));

    if (isTouch()) {
      this.$container.on('touchstart', selectors.navLink, this.onNavLinkTouchstart.bind(this));
      this.$container.on('touchend',   selectors.navLink, this.onNavLinkTouchend.bind(this));
    }
    else {
      this.$container.on('mouseenter', selectors.navLink, this.onNavLinkMouseenter.bind(this));
      this.$container.on('mouseleave', selectors.navLink, this.onNavLinkMouseleave.bind(this));
    }

    this.strobeLogo();

    // Eventually move this out to the main theme file
    if ($body.hasClass('template-index')) {
      setTimeout(() => this.menuOverlay.show(), 1500);
    }
  }

  strobeLogo() {
    this.$logo.toggleClass(classes.logoStrobe);

    const min = 8;
    const max = 20;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);
    setTimeout(this.strobeLogo.bind(this), rand * 100);
  }

  onLogoClick(e) {
    e.preventDefault();
    this.menuOverlay.toggle();
  }

  onNavLinkMouseenter(e) {
    $(e.currentTarget).addClass(classes.navLinkActive);
  }

  onNavLinkMouseleave(e) {
    $(e.currentTarget).removeClass(classes.navLinkActive);
  }

  onNavLinkTouchstart(e) {
    $(e.currentTarget).addClass(classes.navLinkActive);
  }

  onNavLinkTouchend(e) {
    $(e.currentTarget).removeClass(classes.navLinkActive);
  }

  onSubnavToggleClick(e) {
    e.preventDefault();
    const id = $(e.currentTarget).data('id');

    $(selectors.subnav, this.$container).each((i, el) => {
      const $subnav = $(el);
      
      if ($subnav.data('id') === id) {
        $subnav.toggleClass('is-visible');
      }
      else {
        $subnav.removeClass('is-visible');
      }
    });
  }
}

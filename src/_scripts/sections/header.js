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
  logoStrobe: 'is-strobing',
  navLinkActive: 'is-active',
  navLinkFaded: 'faded-out'
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.$logo        = $(selectors.logo, this.$container);
    this.$menuOverlay = $(selectors.menuOverlay, this.$container);
    this.$navLinks    = $(selectors.navLink, this.$container);
    this.$subnavs     = $(selectors.subnav, this.$container);

    this.menuOverlay  = new Overlay(this.$menuOverlay);

    this.$logo.on('click', this.onLogoClick.bind(this));
    this.$navLinks.on('click', this.onNavLinkClick.bind(this));
    this.$container.on('click', selectors.subnavToggle, this.onSubnavToggleClick.bind(this));

    if (isTouch()) {
      this.$container.on('touchstart', selectors.navLink, this.onNavLinkTouchstart.bind(this));
      this.$container.on('touchend',   selectors.navLink, this.onNavLinkTouchend.bind(this));
    }
    else {
      this.$container.on('mouseenter', selectors.navLink, this.onNavLinkMouseenter.bind(this));
      this.$container.on('mouseleave', selectors.navLink, this.onNavLinkMouseleave.bind(this));
    }

    // @TODO - Make these events static props? Overlay.events.HIDDEN ?
    this.$menuOverlay.on(this.menuOverlay.events.HIDDEN, this.onMenuOverlayHidden.bind(this));

    this.strobeLogo();
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

  onNavLinkClick(e) {
    const $clicked = $(e.currentTarget);
    const href = $clicked.attr('href');

    if ($clicked.is(selectors.subnavToggle) || href === '#') return;

    e.preventDefault();

    this.$navLinks.not($clicked).addClass(classes.navLinkFaded);

    setTimeout(() => {
      window.HBA.appController.navigate(href);
    }, 700);
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
    // @TODO - Maybe just use $(e.currentTarget).next() to get the subnav we need?
    const id = $(e.currentTarget).data('id');

    this.$subnavs.each((i, el) => {
      const $subnav = $(el);
      $subnav.toggleClass('is-visible', $subnav.data('id') === id);
    });
  }

  // Reset the menu
  onMenuOverlayHidden(e) {
    this.$subnavs.removeClass('is-visible');
    this.$navLinks.removeClass(classes.navLinkFaded);
  }
}

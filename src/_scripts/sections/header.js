import $ from 'jquery';
import BaseSection from './base';
import DropdownManager from '../managers/dropdown';

const selectors = {
  header: '[data-header]',
  logo: '[data-logo]',
  dropdownTrigger: '[data-dropdown-trigger][data-block]'
};

const classes = {
  headerFixed: 'is-fixed',
  logoStrobe: 'is-strobing'
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.$el   = $(selectors.header, this.$container);
    this.$logo = $(selectors.logo, this.$container);

    this.$container.on(this.events.MOUSELEAVE, this.onMouseLeave.bind(this));

    // Register each dropdown trigger
    $(selectors.dropdownTrigger, this.$container).each((i, trigger) => {
      DropdownManager.register($(trigger));
    });

    this.strobeLogo();
  }

  strobeLogo() {
    this.$logo.toggleClass(classes.logoStrobe);

    const min = 8;
    const max = 20;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);
    setTimeout(this.strobeLogo.bind(this), rand*100);
  }

  onMouseLeave() {
    DropdownManager.closeAllDropdowns();
  }

  onBlockSelect(e) {
    const dropdown = DropdownManager.getDropdownByBlockId(e.detail.blockId);

    // Bypass dropdown manager since we're inside the theme editor
    if (dropdown) {
      dropdown.forceOpen();
    }
  }

  onBlockDeselect(e) {
    const dropdown = DropdownManager.getDropdownByBlockId(e.detail.blockId);

    // Bypass dropdown manager since we're inside the theme editor
    if (dropdown) {
      dropdown.forceClose();
    }
  }
}

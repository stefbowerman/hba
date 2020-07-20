import $ from 'jquery';
import BaseSection from './base';
import CartAPI from '../core/cartAPI';
import AJAXFormManager from '../managers/ajaxForm';
import AJAXCartUI from '../ui/ajaxCart';

const $window = $(window);

/**
 * Ajax Cart Section Script
 * ------------------------------------------------------------------------------
 * All logic is handled cia CartAPI or AJAXCartUI
 * This file is strictly for handling section settings and theme editor interactions
 *
 */
export default class AJAXCartSection extends BaseSection {
  constructor(container) {
    super(container, 'ajaxCart');

    this.openOnReady = false; // if true, the ajaxcart will open once it finishes it's initial render

    // Create a new instance of the cart UI.
    // Pass in any variables used by the Handlebars template that aren't part of the cart object
    this.ajaxCartUI = new AJAXCartUI();

    // Store callbacks so we can remove them later
    this.callbacks = {
      changeSuccess: e => this.ajaxCartUI.onChangeSuccess(e.cart),
      changeFail: e => this.ajaxCartUI.onChangeFail(e.description)
    };

    $window.on(AJAXFormManager.events.ADD_SUCCESS, this.callbacks.changeSuccess);
    $window.on(AJAXFormManager.events.ADD_FAIL, this.callbacks.changeFail);

    // Make sure we get the latest cart data when this initializes
    CartAPI.getCart().then((cart) => {
      this.ajaxCartUI.render(cart);

      if (this.openOnReady) {
        this.ajaxCartUI.open();
      }
    });
  }

  open() {
    if (this.ajaxCartUI.hasBeenRendered) {
      this.ajaxCartUI.open();
    }
    else {
      this.openOnReady = true;
    }
  }

  close() {
    this.ajaxCartUI.close();
  }

  onSelect() {
    this.open();
  }

  onDeselect() {
    this.close();
  }

  onUnload() {
    this.ajaxCartUI && this.ajaxCartUI.destroy(); // Need to destroy to clean up body / window event listeners
    $window.off(AJAXFormManager.events.ADD_SUCCESS, this.callbacks.changeSuccess);
    $window.off(AJAXFormManager.events.ADD_FAIL, this.callbacks.changeFail);
  }
}

import $ from 'jquery';
import Handlebars from 'handlebars';
import {
  whichTransitionEnd,
  isThemeEditor
} from '../core/utils';
import CartAPI from '../core/cartAPI';

const $window = $(window);
const $body = $(document.body);

const selectors = {
  container: '[data-ajax-cart-container]',
  bodyTemplate: 'script[data-ajax-cart-body-template]',
  footerTopTemplate: 'script[data-ajax-cart-footer-top-template]',
  trigger: '[data-ajax-cart-trigger]',
  close: '[data-ajax-cart-close]',
  body: '[data-ajax-cart-body]',
  footer: '[data-ajax-cart-footer]',
  footerTop: '[data-ajax-cart-footer-top]',
  item: '[data-ajax-item][data-key][data-qty]',
  itemRemove: '[data-ajax-cart-item-remove]',
  cartCount: '[data-cart-count]'
};

const classes = {
  bodyCartOpen: 'ajax-cart-open',
  cartOpen: 'is-open',
  cartIsEmpty: 'is-empty',
  lockUI: 'lock-ui',
  triggerHasItems: 'has-items',
  triggerActive: 'is-active'
};

export default class AJAXCart {
  /**
   * AJAXCart constructor
   *
   * @param {Object} templateData - Merged with the cart object when rendering the handlebars template
   */
  constructor(templateData = {}) {
    this.name = 'ajaxCart';
    this.namespace = `.${this.name}`;

    // UPDATE_AND_OPEN is the only event that isn't emitted, we just listen for it.
    // It allows other parts of the application to trigger cart to open

    this.events = {
      CLICK: `click${this.namespace}`,
      CHANGE: `change${this.namespace}`,
      RENDER: `render${this.namespace}`,
      DESTROY: `destroy${this.namespace}`,
      UPDATE_AND_OPEN: `updateAndOpen${this.namespace}`
    };

    this.templateData = templateData;

    this.$el = $(selectors.container);
    this.$acBody = $(selectors.body, this.$el);
    this.$acFooter = $(selectors.footer, this.$el);
    this.$acFooterTop = $(selectors.footerTop, this.$el);
    this.$bodyTemplate = $(selectors.bodyTemplate);
    this.$footerTopTemplate = $(selectors.footerTopTemplate);
    this.$cartCount = $(selectors.cartCount);

    this.stateIsOpen = null; // Store visibilty state of the cart so we dont' have to query DOM for a class name
    this.hasBeenRendered = false; // Lock to prevent displaying the cart before anything has been rendered
    this.transitionEndEvent = whichTransitionEnd();
    this.rendered = false; // Keep track of whether or not the cart has rendered yet, don't open if it hasn't been

    if (!this.$bodyTemplate.length || !this.$footerTopTemplate.length) {
      console.warn(`[${this.name}] - Handlebars template required to initialize`);
      return;
    }

    // Compile this once during initialization
    this.bodyTemplate = Handlebars.compile(this.$bodyTemplate.html());
    this.footerTopTemplate = Handlebars.compile(this.$footerTopTemplate.html());

    if (isThemeEditor()) {
      this.$el.find('.additional-checkout-button').parent('.ajax-cart__footer-row').remove();
    }

    $body.on(this.events.CLICK, selectors.trigger, this.onTriggerClick.bind(this));
    $body.on(this.events.CLICK, selectors.close, this.onCloseClick.bind(this));
    $body.on(this.events.CLICK, selectors.itemRemove, this.onItemRemoveClick.bind(this));
    $window.on(this.events.RENDER, this.onRender.bind(this));
    $window.on(this.events.DESTROY, this.onDestroy.bind(this));
    $window.on(this.events.UPDATE_AND_OPEN, this.onUpdateAndOpen.bind(this));
  }

  destroy() {
    $body.off(this.events.CLICK);
    $body.off(this.events.CLICK);
    $window.off(this.events.RENDER);
    $window.off(this.events.DESTROY);
    $window.off(this.events.UPDATE_AND_OPEN);
  }

  /**
   * Ensure we are working with a valid number
   *
   * @param {int|string} qty
   * @return {int} - Integer quantity.  Defaults to 1
   */
  validateQty(qty) {
    return (parseFloat(qty) === parseInt(qty)) && !Number.isNaN(qty) ? qty : 1;
  }

  /**
   * Get data about the cart line item row
   *
   * @param {element} el - cart line item row or child element
   * @return {obj}
   */
  getItemRowAttributes(el) {
    const $el = $(el);
    const $row = $el.is(selectors.item) ? $el : $el.parents(selectors.item);

    return {
      $row: $row,
      key: $row.data('key'),
      line: $row.index() + 1,
      qty: this.validateQty($row.data('qty'))
    };
  }

  /**
   * Add a class to lock the cart UI from being interacted with
   *
   * @return this
   */
  lockUI() {
    this.$el.addClass(classes.lockUI);
    return this;
  }

  /**
   * Removes a class to unlock the cart UI
   *
   * @return this
   */
  unlockUI() {
    this.$el.removeClass(classes.lockUI);
    return this;
  }

  /**
   * Builds the HTML for the ajax cart and inserts it into the container element
   *
   * @param {object} cart - JSON representation of the cart.  See https://help.shopify.com/themes/development/getting-started/using-ajax-api#get-cart
   * @param {string} slot - specific slot to re-render, otherwise the entire cart will be re-rendered
   * @return this
   */
  render(cart, slot) {
    const templateData = $.extend(this.templateData, cart);

    $window.trigger($.Event(this.events.DESTROY));

    if (slot === 'body') {
      this.$acBody.empty().append(this.bodyTemplate(templateData));
    }
    else if (slot === 'footer') {
      this.$acFooterTop.empty().append(this.footerTopTemplate(templateData));
    }
    else {
      this.$acBody.empty().append(this.bodyTemplate(templateData));
      this.$acFooterTop.empty().append(this.footerTopTemplate(templateData));
    }

    $window.trigger($.Event(this.events.RENDER, { cart }));

    this.rendered = true;

    return this;
  }

  /**
   * Update the cart count here
   *
   * @param {Object} cart - JSON representation of the cart.
   * @return this
   */
  updateCartCount(cart) {
    this.$cartCount.html(cart.item_count);
    $(selectors.trigger).toggleClass(classes.triggerHasItems, cart.item_count > 0);

    return this;
  }

  /**
   * Called whenever the `updateAndOpen.ajaxCart` window event is triggered
   * Only method that can be triggered from other parts of the application (outside of sections/ajaxCart)
   *
   */
  onUpdateAndOpen() {
    CartAPI.getCart().then((cart) => {
      this.render(cart).open();
    });
  }

  /**
   * Callback when changing a cart quantity is successful
   *
   * @param {Object} cart - JSON representation of the cart.
   */
  onChangeSuccess(cart) {
    this.render(cart);
  }

  /**
   * STUB - Callback when changing a cart quantity fails
   *
   * @param {String} message - error message
   */
  onChangeFail(message) {
    console.warn(`[${this.name}] - onChangeFail`);
    console.warn(`[${this.name}] - ${message}`);
  }

  /**
   * Callback for when the cart HTML is rendered to the page
   * Allows us to add event handlers for events that don't bubble
   */
  onRender(e) {
    if (e.cart) {
      this.updateCartCount(e.cart);
      this.$el.toggleClass(classes.cartIsEmpty, e.cart.item_count === 0);
    }

    // Just in case
    this.unlockUI();
    this.hasBeenRendered = true;
  }

  /**
   * Callback for when the cart HTML is removed from the page
   * Allows us to do cleanup on any event handlers added in this.onRender
   */
  onDestroy(e) {

  }

  /**
   * Remove the item from the cart.  Extract this into a separate method if there becomes more ways to delete an item
   *
   * @param {event} e - Click event
   */
  onItemRemoveClick(e) {
    e.preventDefault();

    const attrs = this.getItemRowAttributes(e.target);

    this.lockUI();

    CartAPI.changeLineItemQuantityByKey(attrs.key, 0).then((cart) => {
      if (cart.item_count > 0) {
        // We only need to re-render the footer
        attrs.$row.remove();
        this.render(cart, 'footer');
      }
      else {
        this.render(cart);
      }
    })
      .fail(() => {
        console.warn('something went wrong...');
      })
      .always(() => {
        this.unlockUI();
      });
  }

  /**
   * Click the 'ajaxCart - trigger' selector
   *
   * @param {event} e - Click event
   */
  onTriggerClick(e) {
    e.preventDefault();

    // If we haven't rendered the cart yet, don't show it
    if (!this.hasBeenRendered) {
      return;
    }

    this.toggleVisibility();
  }

  /**
   * Click the 'ajaxCart - close' selector
   *
   * @param {event} e - Click event
   */
  onCloseClick(e) {
    e.preventDefault();
    this.close();
  }

  /**
   * Opens / closes the cart depending on state
   *
   */
  toggleVisibility() {
    return this.stateIsOpen ? this.close() : this.open();
  }

  /**
   * Opens the cart
   *
   */
  open() {
    if (this.stateIsOpen || !this.rendered) return;

    $body.addClass(classes.bodyCartOpen);
    this.$el.addClass(classes.cartOpen);
    $(selectors.trigger).addClass(classes.triggerActive);
    this.stateIsOpen = true;
  }

  /**
   * Closes the cart
   *
   */
  close() {
    if (!this.stateIsOpen) return;

    this.$el.removeClass(classes.cartOpen);
    $(selectors.trigger).removeClass(classes.triggerActive);
    $body.removeClass(classes.bodyCartOpen);
    this.stateIsOpen = false;
  }
}

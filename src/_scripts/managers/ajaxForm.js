import $ from 'jquery';
import { getPropByString } from '../core/utils';
import CartAPI from '../core/cartAPI';

const selectors = {
  addForm: 'form[action^="/cart/add"]',
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]'
};

const $window = $(window);
const $body = $(document.body);

class AJAXFormManager {
  constructor() {
    this.name = 'ajaxFormManager';
    this.namespace = `.${this.name}`;
    this.events = {
      ADD_SUCCESS: `addSuccess${this.namespace}`,
      ADD_FAIL: `addFail${this.namespace}`,
      ADD_START: `addStart${this.namespace}`
    };

    let requestInProgress = false;

    $body.on('submit', selectors.addForm, (e) => {
      e.preventDefault();

      if (requestInProgress) return;

      const $form = $(e.currentTarget);
      const $submitButton = $form.find(selectors.addToCart);
      const $submitButtonText = $submitButton.find(selectors.addToCartText);

      const submitButtonText = $submitButtonText.text();

      const startEvent = $.Event(this.events.ADD_START, { relatedTarget: $form, btnText: submitButtonText });
      $window.trigger(startEvent);

      // Update the submit button text and disable the button so the user knows the form is being submitted
      $submitButton.prop('disabled', true);
      $submitButtonText.html(getPropByString(window, 'theme.strings.adding') || 'Adding');

      requestInProgress = true;

      CartAPI.addItemFromForm($form)
        .then((data) => {
          const event = $.Event(this.events.ADD_SUCCESS, { cart: data, relatedTarget: $form });
          $window.trigger(event);
        })
        .fail((data) => {
          const event = $.Event(this.events.ADD_FAIL, {
            message: data.message,
            description: data.description,
            relatedTarget: $form
          });
          
          $window.trigger(event);
        })
        .always(() => {
          // Reset button state
          $submitButton.prop('disabled', false);
          $submitButtonText.html(submitButtonText);

          requestInProgress = false;
        });
    });
  }
}

export default new AJAXFormManager();

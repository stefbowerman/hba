import $ from 'jquery';
import Typed from 'typed.js';
import { isThemeEditor } from '../core/utils';
import {
  generateCookie,
  hasCookie,
  setCookie
} from '../core/user';

const selectors = {
  form: 'form',
  formContents: '[data-form-contents]',
  formMessage: '[data-form-message]' // needs data-success, data-already-subscribed, data-fail
};

const classes = {
  showMessage: 'show-message',
};

export default class NewsletterForm {
  /**
   * NewsletterForm constructor
   *
   * @param {HTMLElement} el - Element used for scoping any element selection.  Can either be a containing element or the form element itself
   * @param {Object} options
   */  
  constructor(el, options) {
    this.name = 'newsletterForm';

    const defaults = {
      setCookies: true // toggle setting of browser cookies
    };

    this.settings = $.extend({}, defaults, options);
    this.typed = null;

    this.$el = $(el);
    this.$form = this.$el.is(selectors.form) ? this.$el : this.$el.find(selectors.form);
    
    if (!this.$form.length) {
      console.warn(`[${this.name}] - Form element required to initialize`);
      return;
    }

    this.$formContents = $(selectors.formContents, this.$el);
    this.$formMessage  = $(selectors.formMessage, this.$el);

    /**
     * These are the cookies that we'll use to keep track of how much the user has interacted with the footer
     */
    this.cookies = {};

    this.cookies.emailCollected = generateCookie('emailCollected');
  }

  emailCollected() {
    return hasCookie(this.cookies.emailCollected.name);
  }

  /**
   * Temporarily shows the form message
   *
   * @param {Boolean} reset - If true, will call this.reset when finished
   */  
  showMessageWithAnimation(reset = false) {
    if (this.typed) {
      this.typed.destroy();
    }

    // At this point, the message has already been set inside the element
    // Let's empty it out into a var and then type it onto the page
    const string = this.$formMessage.html();

    this.$formMessage.html('');
    this.$formContents.addClass(classes.showMessage);

    this.typed = new Typed(this.$formMessage.get(0), {
      strings: [`${string} ^2000`, ''],
      typeSpeed: 10,
      backSpeed: 10,
      showCursor: false,
      onComplete: () => {
        reset ? this.reset() : this.$formContents.removeClass(classes.showMessage);
      }
    });
  }

  /**
   * Resets everything to it's initial state.  Only call when form content isn't visible
   */
  reset() {
    this.$form.find('input[type="email"]').val('');

    this.$formContents.removeClass(classes.showMessage);
    this.$formMessage.html('');
  }

  onSubscribeSuccess(response) {
    const isSubscribed = response && response.data && response.data.is_subscribed;
    const successMsg = this.$formMessage.data(isSubscribed ? 'already-subscribed' : 'success');

    if (!isThemeEditor() && this.settings.setCookies) {
      setCookie(this.cookies.emailCollected);
    }

    this.$formMessage.html(successMsg);

    // Don't reset the form if they're already subscribed, they might want to just enter a different email
    this.showMessageWithAnimation(!isSubscribed);
  }

  onSubmitFail(errors) {
    this.$formMessage.html(Array.isArray(errors) ? errors.join('  ') : errors);
    this.showMessageWithAnimation();
  }

  onSubscribeFail() {
    this.$formMessage.html(this.$formMessage.data('fail'));
    this.showMessageWithAnimation();
  }
}

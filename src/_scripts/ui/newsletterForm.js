import $ from 'jquery';
import Typed from 'typed.js';

const selectors = {
  form: 'form',
  formContents: '[data-form-contents]',
  formContentsTrigger: '[data-form-contents-trigger]',
  formMessage: '[data-form-message]' // needs data-success, data-already-subscribed, data-fail
};

const classes = {
  showContents: 'show-contents',
  showMessage: 'show-message'
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
    this.typed    = null;

    this.$el = $(el);
    this.$form = this.$el.is(selectors.form) ? this.$el : this.$el.find(selectors.form);
    
    if (!this.$form.length) {
      console.warn(`[${this.name}] - Form element required to initialize`);
      return;
    }

    this.$formContents = $(selectors.formContents, this.$el);
    this.$formMessage  = $(selectors.formMessage, this.$el);
    this.$formInput    = $('input[type="email"]', this.$el);

    this.$form.on('click', selectors.formContentsTrigger, (e) => {
      e.preventDefault();
      this.$form.addClass(classes.showContents);
      this.$formInput.focus();
    });
  }

  /**
   * Temporarily shows the form message
   *
   * @param {Boolean} reset - If true, will call this.reset when finished
   * @param {Boolean} error - If true, will show the message in an error state
   */  
  showMessageWithAnimation(reset = false, error = false) {
    // At this point, the message has already been set inside the element
    // Let's empty it out into a var and then type it onto the page
    const string = this.$formMessage.html();

    if (this.typed) {
      this.typed.destroy();
    }    

    this.$formMessage.html('');
    this.$formContents.addClass(classes.showMessage);

    if (error) {
      this.$formMessage.addClass('error');
    }

    this.typed = new Typed(this.$formMessage.get(0), {
      strings: [`${string} ^2000`, ''],
      typeSpeed: 10,
      backSpeed: 20,
      showCursor: false,
      onComplete: () => {
        this.$formContents.removeClass(classes.showMessage);
        this.$formMessage.removeClass('error');

        if (reset) {
          this.reset();
        }
      }
    });
  }

  /**
   * Resets everything to it's initial state.  Only call when form content isn't visible
   */
  reset() {
    this.$formInput.val('');
    this.$formMessage.html('');
  }

  onSubscribeSuccess(response) {
    const isSubscribed = response && response.data && response.data.is_subscribed;
    const successMsg = this.$formMessage.data(isSubscribed ? 'already-subscribed' : 'success');

    this.$formMessage.html(successMsg);

    // Don't reset the form if they're already subscribed, they might want to just enter a different email
    // Show the state as an error if they're subscribed
    this.showMessageWithAnimation(!isSubscribed, isSubscribed);
  }

  onSubmitFail(errors) {
    this.$formMessage.html(Array.isArray(errors) ? errors.join('  ') : errors);
    this.showMessageWithAnimation(false, true);
  }

  onSubscribeFail() {
    this.$formMessage.html(this.$formMessage.data('fail'));
    this.showMessageWithAnimation(false, true);
  }
}

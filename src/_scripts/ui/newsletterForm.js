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
   */  
  constructor(el, options = {}) {
    this.name = 'newsletterForm';

    const defaults = {
      forceSuccess: false // force the success message no matter what
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

    this.$form.on('click', selectors.formContentsTrigger, this.onFormContentsTriggerClick.bind(this));
    this.$formInput.on('keydown', this.onFormInputKeyDown.bind(this));
  }

  /**
   * Temporarily shows the form message
   *
   * @param {Boolean} reset - If true, will call this.reset when finished
   * @param {Boolean} error - If true, will show the message in an error state
   */  
  showMessageWithAnimation(message, reset = false, error = false) {
    if (this.typed) {
      this.typed.destroy();
    }    

    this.$formMessage.html('');
    this.$formContents.addClass(classes.showMessage);

    if (error) {
      this.$formMessage.addClass('error');
    }

    this.typed = new Typed(this.$formMessage.get(0), {
      strings: [`${message} ^2000`, ''],
      typeSpeed: 10,
      backSpeed: 10,
      showCursor: false,
      onComplete: () => {
        this.$formContents.removeClass(classes.showMessage);
        this.$formMessage.removeClass('error');
        this.hideFormContents();

        if (reset) {
          this.reset();
        }
      }
    });
  }

  showFormContents() {
    this.$form.addClass(classes.showContents);
    this.$formInput.focus();
  }

  hideFormContents() {
    this.$form.removeClass(classes.showContents);
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
    let msgKey = 'success';

    if (isSubscribed) {
      msgKey = 'already-subscribed';
    }
    if (this.settings.forceSuccess) {
      msgKey = 'success';
    }

    // Don't reset the form if they're already subscribed, they might want to just enter a different email
    // Show the state as an error if they're subscribed
    const reset = this.settings.forceSuccess ? true : !isSubscribed;
    const error = this.settings.forceSuccess ? false : isSubscribed;
    
    this.showMessageWithAnimation(this.$formMessage.data(msgKey), reset, error);
  }

  onSubmitStart() {
    this.showMessageWithAnimation('Submitting', false);
  }  

  onSubmitFail(errors) {
    const msg = Array.isArray(errors) ? errors.join('  ') : errors;
    this.showMessageWithAnimation(msg, false, true);
  }

  onSubscribeFail() {
    this.showMessageWithAnimation(this.$formMessage.data('fail'), false, true);
  }

  onFormContentsTriggerClick(e) {
    e.preventDefault();
    this.showFormContents();
  }

  onFormInputKeyDown(e) {
    if (e && e.which === 27) {
      this.hideFormContents();
    }
  }
}

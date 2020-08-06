import $ from 'jquery';
import BaseSection from './base';
import AJAXKlaviyoForm from '../lib/ajaxKlaviyoForm';
import NewsletterForm from '../ui/newsletterForm';

const selectors = {
  logo: '[data-logo]',
  newsletterForm: '[data-newsletter-form]'
};

const classes = {
  logoStrobe: 'is-strobing'
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.$logo = $(selectors.logo, this.$container);
    this.$form = $(selectors.newsletterForm, this.$container);

    this.newsletterForm = new NewsletterForm(this.$form);

    this.ajaxForm = new AJAXKlaviyoForm(this.$form, {
      listId: this.$form.data('klaviyo-list-id'),
      source: this.$form.data('klaviyo-source'),
      onSubmitStart: () => this.newsletterForm.onSubmitStart(),
      onSubmitFail: errors => this.newsletterForm.onSubmitFail(errors),
      onSubscribeSuccess: response => this.newsletterForm.onSubscribeSuccess(response),
      onSubscribeFail: response => this.newsletterForm.onSubscribeFail(response)
    });

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

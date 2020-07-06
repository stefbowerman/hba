import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import AJAXKlaviyoForm from '../lib/ajaxKlaviyoForm';
import NewsletterForm from '../ui/newsletterForm';

const selectors = {
  newsletterForm: '[data-newsletter-form]'
};

export default class FooterSection extends BaseSection {
  constructor(container) {
    super(container, 'footer');

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
  }
}

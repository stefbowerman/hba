import $ from 'jquery';
import { pad } from '../core/utils';
import BaseSection from './base';
import AJAXKlaviyoForm from '../lib/ajaxKlaviyoForm';
import NewsletterForm from '../ui/newsletterForm';

const selectors = {
  logo: '[data-logo]',
  newsletterForm: '[data-newsletter-form]',
  countdown: '[data-countdown]'
};

const classes = {
  logoStrobe: 'is-strobing'
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.$logo = $(selectors.logo, this.$container);
    this.$form = $(selectors.newsletterForm, this.$container);
    this.$countdown = $(selectors.countdown, this.$container);

    this.newsletterForm = new NewsletterForm(this.$form);

    this.ajaxForm = new AJAXKlaviyoForm(this.$form, {
      listId: this.$form.data('klaviyo-list-id'),
      source: this.$form.data('klaviyo-source'),
      onSubmitStart: () => this.newsletterForm.onSubmitStart(),
      onSubmitFail: errors => this.newsletterForm.onSubmitFail(errors),
      onSubscribeSuccess: response => this.newsletterForm.onSubscribeSuccess(response),
      onSubscribeFail: response => this.newsletterForm.onSubscribeFail(response)
    });    

    this.countdownInterval = null;
    this.endTime = this.$countdown.data('countdown');

    this.strobeLogo();

    if (this.$countdown.length && this.getRemainingTime(this.endTime).total > 0) {
      this.startClock();
    }
  }

  tick() {
    const t = this.getRemainingTime(this.endTime);
    const time = [t.days, t.hours, t.minutes, t.seconds].map(n => pad(n, 2, 0)).join(':');
    
    this.$countdown.text(time);

    if (t.total <= 0) {
      this.stopClock();
    }
  } 

  startClock() {
    this.tick();
    this.countDownInterval = setInterval(this.tick.bind(this), 1000);
  }

  stopClock() {
    clearInterval(this.countDownInterval);
  }

  getRemainingTime(endTime) {
    const t = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((t/1000) % 60);
    const minutes = Math.floor((t/1000/60) % 60);
    const hours = Math.floor((t/(1000*60*60)) % 24);
    const days = Math.floor(t/(1000*60*60*24));

    return {
      total: t,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
  }  

  strobeLogo() {
    this.$logo.toggleClass(classes.logoStrobe);

    const min = 8;
    const max = 20;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);
    setTimeout(this.strobeLogo.bind(this), rand * 100);
  }
}

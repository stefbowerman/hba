import $ from 'jquery';

export default class Filter {
  constructor(el, type, value, active) {
    this.$el    = $(el);
    this.type   = this.$el.data('type');
    this.value  = this.$el.data('value');
    this.url    = this.$el.attr('href');
    this.active = false;
  }

  activate() {
    this.$el.addClass('is-active');
    this.active = true;
    return this;
  }

  deactivate() {
    this.$el.removeClass('is-active');
    this.active = false;
    return this;
  }

  toggle() {
    return this.active ? this.deactivate() : this.activate();
  }

  get queryParam() {
    return [this.type, this.value].join(':');
  }
}
import $ from 'jquery';
import { isTouch } from '../core/utils';

/**
 * Quantity Adjuster Scripts
 * -----------------------------------------------------------------------------
 * Handles any events associated with the quantity adjuster component
 *
 *  [data-quantity-adjuster]
 *    [data-increment]
 *    input[type="number"]
 *    [data-decrement]
 *
 */

const selectors = {
  adjuster: '[data-quantity-adjuster]',
  increment: '[data-increment]',
  decrement: '[data-decrement]',
  input: 'input[type="number"]'
};

const dataKey = 'quantity-adjuster';

export default class QuantityAdjuster {
  /**
   * Quantity Adjuster Constructor
   *
   * @param {HTMLElement | jQuery} el - element, either matching selectors.adjuster or a child element
   */  
  constructor(el) {
    this.name = 'quantityAdjuster';
    this.namespace = `.${this.name}`;

    this.$el = $(el).is(selectors.adjuster) ? $(el) : $(el).parents(selectors.adjuster);

    if (!this.$el) {
      console.warn(`[${this.name}] - Element required to initialize`);
      return;
    }

    this.$increment = $(selectors.increment, this.$el);
    this.$decrement = $(selectors.decrement, this.$el);
    this.$input     = $(selectors.input, this.$el);

    this.min = parseInt(this.$input.attr('min')) || 0;
    this.max = parseInt(this.$input.attr('max')) || 5;    

    if (isTouch()) {
      this.$increment.on('touchstart', this.onIncrementClick.bind(this));
      this.$decrement.on('touchstart', this.onDecrementClick.bind(this));
    }
    else {
      this.$increment.on('click', this.onIncrementClick.bind(this));
      this.$decrement.on('click', this.onDecrementClick.bind(this));      
    }

    this.$input.on('change', this.onInputChange.bind(this));

    this._updateDisabledState();
  }

  _updateDisabledState() {
    const val = parseInt(this.$input.val());

    if (this.$input.is(':disabled')) {
      this.$increment.prop('disabled', true);
      this.$decrement.prop('disabled', true);
      return;
    }

    if (val === this.max && val === this.min) {
      this.$increment.prop('disabled', true);
      this.$decrement.prop('disabled', true);
    }
    else if (val >= this.max) {
      this.$increment.prop('disabled', true);
      this.$decrement.prop('disabled', false);
    }
    else if (val <= this.min) {
      this.$increment.prop('disabled', false);
      this.$decrement.prop('disabled', true);
    }
    else {
      this.$increment.prop('disabled', false);
      this.$decrement.prop('disabled', false);
    }
  }

  _changeValue(amount) {
    if (this.$input.is(':disabled') || typeof amount === 'undefined') return;

    amount = parseInt(amount);

    const val = parseInt(this.$input.val());
    const newVal = val + amount;

    // Don't change if the value is the same or invalid
    if (newVal === val || newVal > this.max || newVal < this.min) return;

    this.$input.val(newVal);
    this.$input.trigger('change');
  }

  _clampInputVal() {
    const currVal = parseInt(this.$input.val());
    const max = this.max;
    const min = this.min;

    if (currVal > max) {
      this.$input.val(max);
    }
    else if (currVal < min) {
      this.$input.val(min);
    }
  }

  getVal() {
    return parseInt(this.$input.val());
  }

  isMin() {
    return this.getVal() === this.min;
  }  

  isMax() {
    return this.getVal() === this.max;
  }

  onDisabledAttributeChange() {
    this._updateDisabledState();
  }

  onMinMaxAttributeChange() {
    this._clampInputVal();
    this._updateDisabledState();
  }

  onInputChange() {
    this._clampInputVal();
    this._updateDisabledState();
    this.$el.trigger($.Event(`change${this.namespace}`, { instance: this }));    
  }

  onIncrementClick(e) {
    e.preventDefault();
    this._changeValue(1);
  }

  onDecrementClick(e) {
    e.preventDefault();
    this._changeValue(-1);
  }

  static ensure(el) {
    let $el =  $(el);

    if (!$el.is(selectors.adjuster)) {
      $el = $el.parents(selectors.adjuster);
    }

    let data = $el.data(dataKey);

    if (!data) {
      $el.data(dataKey, (data = new QuantityAdjuster($el)));
    }

    return data;
  }

  static refresh($container) {
    $(selectors.adjuster, $container).each((i, el) => {
      QuantityAdjuster.ensure(el);
    });
  }

  static getDataKey() {
    return dataKey;
  }
}

const shopifyEvents = [
  'shopify:section:unload',
  'shopify:section:select',
  'shopify:section:deselect',
  'shopify:section:reorder',
  'shopify:block:select',
  'shopify:block:deselect'
];

$(document).on(shopifyEvents.join(' '), QuantityAdjuster.refresh);

QuantityAdjuster.refresh();

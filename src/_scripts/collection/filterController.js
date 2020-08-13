import $ from 'jquery';
import Filter from './filter';

export default class FilterController {
  constructor(options) {
    const defaults = {
      onChange: () => {}
    };

    this.settings = $.extend({}, defaults, options);
    this.filters = [];
    this.activeFilter = null;
  }

  registerFilter(filter) {
    if (filter instanceof Filter) {
      this.filters.push(filter);
    }
  }

  getFilterByValue(value) {
    this.filters.find(filter => filter.value === value);
  }

  // When a filter is clicked, this function is called
  // We need to toggle the state of the filter
  // we also need to make sure that there is only one active filter at a time
  toggleFilterByEl($el) {
    this.toggle(this.filters.find(filter => filter.$el.is($el)));
  }

  toggle(filter) {
    if (!filter) return;

    if (filter.active) {
      filter.deactivate();
      this.activeFilter = null;
    }
    else {
      this.activeFilter && this.activeFilter.deactivate();
      this.activeFilter = filter.activate();
    }

    this.settings.onChange();
  }

  /*
   * @param {string} param - of the format 'type:value'
   */
  getFilterForParam(param) {
    const s = param.split(':');
    if (s.length !== 2) {
      return null;
    }

    return this.filters.find(filter => filter.type === s[0] && filter.value === s[1]);
  }
}
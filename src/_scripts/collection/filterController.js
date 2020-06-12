import Filter from './filter';

export default class FilterController {
  constructor() {
    this.filters = [];
    this.activeFilter = null;
  }

  registerFilter(filter) {
    if (filter instanceof Filter) {
      this.filters.push(filter);
    }
  }

  getFilterByValue(value) {
    this.filters.find(filter => filter.value === value); // @TODO replace with _.find ?
  }

  // When a filter is clicked, this function is called
  // We need to toggle the state of the filter
  // we also need to make sure that there is only one active filter at a time
  toggleFilter($el) {
    const f = this.filters.find(filter => filter.$el.is($el));

    if (!f) return;

    if (f.active) {
      f.deactivate();
      this.activeFilter = null;
    }
    else {
      this.activeFilter && this.activeFilter.deactivate();
      this.activeFilter = f.activate();
    }
  }
}
import $ from 'jquery';

const selectors = {
  filter: '[data-filter]',
  breadcrumb: '[data-breadcrumb]'
};

export default class CollectionSidebar {
  /**
   * Collection sidebar constructor
   *
   * @param {HTMLElement | $} container - The container element
   */
  constructor(container) {
    this.$container = $(container);
    this.$breadcrumb = $(selectors.breadcrumb, this.$container);

    this.$container.on('click', selectors.filter, (e) => {
      e.preventDefault();
      console.log(e.currentTarget.getAttribute('href'));
    });
  }

  setBreadCrumb(url) {
    this.$breadcrumb.attr('href', url);
    this.$breadcrumb.text(url);
  }
}

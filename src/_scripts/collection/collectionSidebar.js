import $ from 'jquery';

const selectors = {
  filter: '[data-filter]',
  breadcrumbs: '[data-breadcrumbs]',
  crumb: '[data-crumb]'
};

export default class CollectionSidebar {
  /**
   * Collection sidebar constructor
   *
   * @param {HTMLElement | $} container - The container element
   */
  constructor(container, options) {
    this.$container = $(container);
    this.$breadcrumbs = $(selectors.breadcrumbs, this.$container);
    this.$crumbs = $(selectors.crumb, this.$container);

    const defaults = {
      onFilterClick: () => {}
    };

    this.settings = $.extend({}, defaults, options);

    this.$container.on('click', selectors.filter, (e) => {
      e.preventDefault();
      this.settings.onFilterClick(e.currentTarget.getAttribute('href'));
    });
  }

  setBreadCrumb(part, text, url) {
    // @TODO - This needs to be typed??
    // Are we going to have to do some crazy string matching?
    this.$crumbs.filter((i, el) => {
      return $(el).data('crumb') === part;
    })
      .text(text)
      .attr('href', url);
  }

  setSelectedFilter(url) {
    console.log('settings selected filter =' + url);
  }
}

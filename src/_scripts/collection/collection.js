import $ from 'jquery';
import Typed from 'typed.js';
import ProductPane from '../product/productPane';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCardGrid: '[data-product-card-grid]',
  productPane:     '[data-product-pane]',
  filter: '[data-filter]',
  filterContainer: '[data-filter-container]',
  filtersToggle: '[data-filters-toggle]',
  breadcrumbs: '[data-breadcrumbs]',
  crumb: '[data-crumb]'
};

export default class Collection {
  /**
   * Collection constructor
   * 
   * This handles the whole collection / product view
   *
   * @param {HTMLElement | $} container - The container element
   */
  constructor(container) {
    this.$container = $(container);

    this.breadcrumbTyped = null;

    this.$breadcrumbs = $(selectors.breadcrumbs, this.$container);
    this.$crumbs = $(selectors.crumb, this.$container);
    this.$filtersContainer = $(selectors.filterContainer, this.$container);
    this.$filtersToggle = $(selectors.filtersToggle, this.$container);

    this.productPane     = new ProductPane($(selectors.productPane, this.$container));
    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardClick: this.onProductCardClick.bind(this)
    });

    this.crumbMap = {
      // collections: $crumb,
      // collection-product: $crumb
    };

    this.$crumbs.each((i, el) => {
      const $el = $(el);
      this.crumbMap[$el.data('crumb')] = $el;
    })

    this.$container.on('click', selectors.filter, this.onFilterClick.bind(this));
    this.$filtersToggle.on('click', this.onFiltersToggleClick.bind(this));

    // this.productPane.reveal();
    this.productCardGrid.reveal();
  }

  onFilterClick(e) {
    e.preventDefault();
    const url = e.currentTarget.getAttribute('href');
    console.log('clicked on ' + url);

    this.productCardGrid.filterBy(url);
    // this.sidebar.setSelectedFilter(url);
  }

  onFiltersToggleClick(e) {
    e.preventDefault();
    this.$filtersContainer.slideToggle(150);
  }

  onProductCardClick(e, card) {
    e.preventDefault();

    // @TODO - Add router navigate as a callback to this activate function?
    this.productPane.activate(card.id);

    if (window.HBA) {
      window.HBA.appController
        .pauseRouter()
        .navigate(card.url)
        .resumeRouter();

      this.setBreadCrumb('collection-product', card.handle, card.url);
    }
  }

  setBreadCrumb(part, text, url) {
    if (!this.crumbMap.hasOwnProperty(part)) return;

    const $crumb = this.crumbMap[part];
    
    $crumb.attr('href', url).text('');
    
    if (this.breadcrumbTyped) {
      this.breadcrumbTyped.destroy();
    }

    // Type out the text
    this.breadcrumbTyped = new Typed($crumb.get(0), {
      strings: [text],
      typeSpeed: 10,
      showCursor: false
    });
  }
}

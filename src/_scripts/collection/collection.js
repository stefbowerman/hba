import $ from 'jquery';
import { getBreakpointMinWidth } from '../core/breakpoints';
import Filter from './filter';
import FilterController from './filterController';
import Breadcrumbs from './breadcrumbs';
import ProductPane from '../product/productPane';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCardGrid: '[data-product-card-grid]',
  productPane:     '[data-product-pane]',
  filter: '[data-filter]',
  filterContainer: '[data-filter-container]',
  filtersToggle: '[data-filters-toggle]',
  breadcrumbs: '[data-breadcrumbs]'
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

    this.mobileScreenWidthMax = getBreakpointMinWidth('xs') - 1;
    this.$filtersContainer = $(selectors.filterContainer, this.$container);
    this.$filtersToggle = $(selectors.filtersToggle, this.$container);
    
    this.breadcrumbs      = new Breadcrumbs($(selectors.breadcrumbs, this.$container));
    this.filterController = new FilterController();
    this.productPane      = new ProductPane($(selectors.productPane, this.$container));
    this.productCardGrid  = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardClick: this.onProductCardClick.bind(this)
    });

    $(selectors.filter, this.$container).each((i, el) => {
      this.filterController.registerFilter(new Filter(el));
    });

    this.$container.on('click', selectors.filter, this.onFilterClick.bind(this));
    this.$filtersToggle.on('click', this.onFiltersToggleClick.bind(this));

    // this.productPane.reveal();
    this.productCardGrid.reveal();
  }

  activateProduct(id, url, handle) {
    if (!id) return;

    // @TODO - Add router navigate as a callback to this activate function?
    // @TODO - Check if the card we clicked on is currently active, return if true
    this.productPane.activate(id);

    if (window.HBA) {
      window.HBA.appController
        .pauseRouter()
        .navigate(url)
        .resumeRouter();
    }

    const isMobile = window.innerWidth <= this.mobileScreenWidthMax;

    // Below this screen size, the grid is at the bottom of the page
    if (isMobile) {
      $('html, body').animate({ scrollTop: 0 }, {
        duration: 300,
        easing: 'easeOutQuint'
      });
    }

    setTimeout(() => {
      this.breadcrumbs.setCrumb('collection-product', handle, url);
    }, (isMobile ? 300 : 0));
  }

  onFilterClick(e) {
    e.preventDefault();

    this.filterController.toggleFilter($(e.currentTarget));
    this.productCardGrid.filterBy(this.filterController.activeFilter);
    this.productPane.deactivate(); // @TODO - This is dumb, we need to only deactivate if the currently activeProduct Detail doesn't pass the filter
  }

  onFiltersToggleClick(e) {
    e.preventDefault();
    this.$filtersContainer.slideToggle(150);
  }

  onProductCardClick(e, card) {
    e.preventDefault();
    this.activateProduct(card.id, card.url, card.handle);
  }
}

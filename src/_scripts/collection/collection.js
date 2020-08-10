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

const $viewport = $('html, body');

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

    this.baseUrl         = this.$container.data('base-url');
    this.docTitle        = this.$container.data('doc-title');
    this.mobileWidthMax  = getBreakpointMinWidth('sm') - 1;

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

  destroy() {
    this.productCardGrid.destroy();
  }  

  activateProduct(id, url, handle, documentTitle) {
    if (!id || this.productPane.isActive(id)) return;

    this.productPane.activate(id)
      .then(() => {
        if (window.HBA) {
          window.HBA.appController
            .pauseRouter()
            .navigate(url)
            .setDocumentTitle(documentTitle)
            .resumeRouter();
        }
      });

    const isMobile = window.innerWidth <= this.mobileWidthMax;

    // Below this screen size, the grid is at the bottom of the page
    if (isMobile) {
      $viewport.animate({ scrollTop: 0 }, {
        duration: 350,
        easing: 'easeOutQuart'
      });
    }

    setTimeout(() => {
      this.breadcrumbs.setCrumb('collection-product', handle, url);
    }, (isMobile ? 300 : 0));
  }

  onFilterClick(e) {
    e.preventDefault();

    // @TODO - Check if there's an active filter, if not then we don't need to hide the product detail that was active during filtering

    this.filterController.toggleFilter($(e.currentTarget));
    this.productCardGrid.filterBy(this.filterController.activeFilter);
    this.productPane.deactivate(); // @TODO - This is dumb, we need to only deactivate if the currently activeProduct Detail doesn't pass the filter

    const url = this.filterController.activeFilter ? this.filterController.activeFilter.url : this.baseUrl;
    
    if (window.HBA) {
      window.HBA.appController
        .pauseRouter()
        .navigate(url)
        .setDocumentTitle(this.docTitle)
        .resumeRouter();
    }    
  }

  onFiltersToggleClick(e) {
    e.preventDefault();
    this.$filtersContainer.slideToggle(150);
  }

  onProductCardClick(e, card) {
    e.preventDefault();
    this.activateProduct(card.id, card.url, card.handle, card.documentTitle);
  }
}

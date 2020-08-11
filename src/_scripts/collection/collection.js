import $ from 'jquery';
import { getBreakpointMinWidth } from '../core/breakpoints';
import {
  getQueryString,
  getUrlWithUpdatedQueryStringParameter,
  getUrlWithRemovedQueryStringParameter,
  getQueryParams
} from '../core/utils';
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
    this.queryFilterKey  = 'filter';

    this.$filtersContainer = $(selectors.filterContainer, this.$container);
    this.$filtersToggle    = $(selectors.filtersToggle, this.$container);
    
    this.breadcrumbs      = new Breadcrumbs($(selectors.breadcrumbs, this.$container));
    this.productPane      = new ProductPane($(selectors.productPane, this.$container));
    this.filterController = new FilterController({
      onChange: this.onFilterControllerChange.bind(this)
    });
    this.productCardGrid  = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardClick: this.onProductCardClick.bind(this)
    });

    $(selectors.filter, this.$container).each((i, el) => {
      this.filterController.registerFilter(new Filter(el));
    });

    this.$container.on('click', selectors.filter, this.onFilterClick.bind(this));
    this.$filtersToggle.on('click', this.onFiltersToggleClick.bind(this));

    // When we load the page, check for filter tag parameters in the URL
    const queryParams = getQueryParams();

    if (queryParams.hasOwnProperty(this.queryFilterKey) && queryParams[this.queryFilterKey].length) {
      const f = this.filterController.getFilterForParam(decodeURIComponent(queryParams[this.queryFilterKey]));

      if (f) {
        this.filterController.toggle(f);
      }
    }    

    // this.productPane.reveal();
    this.productCardGrid.reveal();
  }

  destroy() {
    this.productCardGrid.destroy();
  }  

  activateProductCard(card) {
    if (!card || this.productPane.isActive(card.id)) return;

    this.productPane.activate(card.id)
      .then(() => {
        if (window.HBA) {
          window.HBA.appController
            .pauseRouter()
            .navigate(this.urlForState)
            .setDocumentTitle(card.documentTitle)
            .resumeRouter();
        }
      });

    const isMobile = window.innerWidth <= this.mobileWidthMax;

    // Below this screen size, the grid is at the bottom of the page
    if (window.innerWidth <= this.mobileWidthMax) {
      $viewport.animate({ scrollTop: 0 }, {
        duration: 350,
        easing: 'easeOutQuart'
      });
    }

    setTimeout(() => {
      this.breadcrumbs.setCrumb('collection-product', card.handle, card.url);
    }, (isMobile ? 300 : 0));
  }

  onFilterClick(e) {
    e.preventDefault();
    this.filterController.toggleFilterByEl($(e.currentTarget));   
  }

  get urlForState() {
    let baseUrl = this.baseUrl;
    let url;

    if (this.productPane.activeProductDetail) {
      baseUrl = this.productPane.activeProductDetail.url;
    }

    baseUrl += getQueryString(); // Tack the query string along to the end

    if (this.filterController.activeFilter) {
      url = getUrlWithUpdatedQueryStringParameter(this.queryFilterKey, this.filterController.activeFilter.queryParam, baseUrl);
    }
    else {
      url = getUrlWithRemovedQueryStringParameter(this.queryFilterKey, baseUrl);
    }

    return url;
  }

  onFilterControllerChange() {
    const activeFilter = this.filterController.activeFilter;

    this.productCardGrid.filterBy(activeFilter);
    
    if (activeFilter) {
      this.productPane.deactivate(); // @TODO - This is dumb, we need to only deactivate if the currently activeProduct Detail doesn't pass the filter
    }
    else {
      // Don't do anything, there's no filter no need to deactivate the productpane
    }

    if (window.HBA) {
      window.HBA.appController
        .pauseRouter()
        .navigate(this.urlForState)
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
    
    if (card.isPreview) return;

    this.activateProductCard(card);
  }
}

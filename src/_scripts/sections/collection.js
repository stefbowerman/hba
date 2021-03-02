import $ from 'jquery';
import { getBreakpointMinWidth } from '../core/breakpoints';
import {
  getQueryString,
  getUrlWithUpdatedQueryStringParameter,
  getUrlWithRemovedQueryStringParameter,
  getQueryParams,
  getScrollY
} from '../core/utils';
import BaseSection from './base';
import Filter from '../collection/filter';
import FilterController from '../collection/filterController';
import Breadcrumbs from '../collection/breadcrumbs';
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

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

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

  onUnload() {
    this.productCardGrid.destroy();
    this.productPane.destroy();    
  }

  activateProductCard(card) {
    if (!card || this.productPane.isTransitioning) return; // istransitioning is a simple stop gap against the page state getting out of sync

    const isMobile = window.innerWidth <= this.mobileWidthMax;

    // On mobile, the grid is at the bottom of the page
    if (isMobile || getScrollY() > 500) {
      $viewport.animate({ scrollTop: 0 }, {
        duration: 350,
        easing: 'easeOutQuart'
      });
    }

    if (this.productPane.isActive(card.id)) {
      // If it's the currently selected product, just return *After* we scroll up in case we're on mobile
      return;
    }

    // If we're on mobile, it takes 350 to scroll to the top, so fadeOUT before we hit the top and then take longer to fadeIN
    // If we're not on mobile, pass null and use fade defaults
    const outDuration = isMobile ? 50 : null;
    const inDuration  = null; // isMobile ? (350+250) : null;
    this.productPane.activate(card.id, outDuration, inDuration)
      .then(() => {
        if (window.HBA) {
          window.HBA.appController
            .pauseRouter()
            .navigate(this.urlForState)
            .setDocumentTitle(card.documentTitle)
            .resumeRouter();
        }
      });    

    setTimeout(() => {
      this.breadcrumbs.setCrumb('collection-product', card.handle, card.url);   
    }, (isMobile ? 350 : 0));
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
    this.$filtersToggle.toggleClass('is-active');
  }

  onProductCardClick(e, card) {
    e.preventDefault();
    
    if (card.isPreview) return;

    this.activateProductCard(card);
  }  
}

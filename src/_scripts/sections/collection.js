import $ from 'jquery';
import {
  getQueryParams,
  getQueryString,
  getUrlWithUpdatedQueryStringParameter,
  getUrlWithRemovedQueryStringParameter
} from '../core/utils';
import BaseSection from './base';
import Filter from '../collection/filter';
import FilterController from '../collection/filterController';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCardGrid: '[data-product-card-grid]',
  filter: '[data-filter]',
  filterContainer: '[data-filter-container]',
  filtersToggle: '[data-filters-toggle]',
  gridToggle: '[data-grid-toggle]'
};

const classes = {
  gridToggleActive: 'is-active',
  filtersToggleActive: 'is-active'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    this.baseUrl         = this.$container.data('base-url');
    this.queryFilterKey  = 'filter';
    this.filtersOpen     = false;

    this.$filtersContainer = $(selectors.filterContainer, this.$container);
    this.$filtersToggle    = $(selectors.filtersToggle, this.$container);
    this.$gridToggles      = $(selectors.gridToggle, this.$container);
    
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
    this.$gridToggles.on('click', this.onGridToggleClick.bind(this));

    // When we load the page, check for filter tag parameters in the URL
    const queryParams = getQueryParams();

    if (queryParams.hasOwnProperty(this.queryFilterKey) && queryParams[this.queryFilterKey].length) {
      const f = this.filterController.getFilterForParam(decodeURIComponent(queryParams[this.queryFilterKey]));

      if (f) {
        this.filterController.toggle(f);
      }
    }

    this.$gridToggles
      .filter(`[data-column-count="${window.HBA.collectionColCount}"]`)
      .addClass(classes.gridToggleActive);
    this.productCardGrid.setColumnCount(window.HBA.collectionColCount);

    this.productCardGrid.reveal();
  }

  get urlForState() {
    const baseUrl = this.baseUrl + getQueryString();
    let url;

    if (this.filterController.activeFilter) {
      url = getUrlWithUpdatedQueryStringParameter(this.queryFilterKey, this.filterController.activeFilter.queryParam, baseUrl);
    }
    else {
      url = getUrlWithRemovedQueryStringParameter(this.queryFilterKey, baseUrl);
    }

    return url;
  }  

  onFilterClick(e) {
    e.preventDefault();
    this.filterController.toggleFilterByEl($(e.currentTarget));   
  }

  onFilterControllerChange() {
    const { activeFilter } = this.filterController;

    this.productCardGrid.$el.fadeOut({
      duration: 200,
      easing: 'easeInCubic',
      start: () => {
        this.$filtersToggle.toggleClass(classes.filtersToggleActive, !!activeFilter);
      },
      complete: () => { 
        this.productCardGrid.filterBy(activeFilter);
        
        window.HBA.appController
          .pauseRouter()
          .navigate(this.urlForState)
          .resumeRouter();

        this.productCardGrid.$el.fadeIn({
          duration: 350,
          easing: 'easeOutCubic'
        });
      }
    });
  }

  onFiltersToggleClick(e) {
    e.preventDefault();

    const slideOptions = {
      easing: 'easeOutCubic',
      duration: 250
    };

    this.$filtersContainer.stop(true, true); // In case any animations are running
    this.$filtersContainer[this.filtersOpen ? 'slideUp' : 'slideDown'](slideOptions);

    this.filtersOpen = !this.filtersOpen;
  }

  onGridToggleClick(e) {
    e.preventDefault();
    const $toggle = $(e.currentTarget);
    const columnCount = $toggle.data('column-count');

    if (columnCount === window.HBA.collectionColumnCount) return;

    window.HBA.collectionColumnCount = columnCount;

    this.productCardGrid.$el.fadeOut({
      duration: 200,
      easing: 'easeInCubic',
      start: () => {
        this.$gridToggles.removeClass(classes.gridToggleActive);
        $toggle.addClass(classes.gridToggleActive);
      },
      complete: () => { 
        this.productCardGrid.setColumnCount(columnCount);
        this.productCardGrid.$el.fadeIn({
          duration: 350,
          easing: 'easeOutCubic',
          start: () => {
            // @TODO - productcard grid needs to trigger unveil lookup everytime it fades in and out
            $(window).trigger('lookup.unveil');
          }
        });
      }
    });
  }

  onProductCardClick(e, card) {   
    if (card.isPreview) {
      e.preventDefault();
    }
  }  
}

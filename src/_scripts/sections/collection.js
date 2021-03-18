import $ from 'jquery';
import { getQueryParams } from '../core/utils';
import BaseSection from './base';
import Filter from '../collection/filter';
import FilterController from '../collection/filterController';
import Breadcrumbs from '../collection/breadcrumbs';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCardGrid: '[data-product-card-grid]',
  filter: '[data-filter]',
  filterContainer: '[data-filter-container]',
  filtersToggle: '[data-filters-toggle]',
  breadcrumbs: '[data-breadcrumbs]'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    this.queryFilterKey  = 'filter';

    this.$filtersContainer = $(selectors.filterContainer, this.$container);
    this.$filtersToggle    = $(selectors.filtersToggle, this.$container);
    
    this.breadcrumbs      = new Breadcrumbs($(selectors.breadcrumbs, this.$container));
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

    this.productCardGrid.reveal();
  }

  onUnload() {
    this.productCardGrid.destroy();
  }

  onFilterClick(e) {
    e.preventDefault();
    this.filterController.toggleFilterByEl($(e.currentTarget));   
  }

  onFilterControllerChange() {
    this.productCardGrid.filterBy(this.filterController.activeFilter);   
  }

  onFiltersToggleClick(e) {
    e.preventDefault();
    this.$filtersContainer.slideToggle(150);
    this.$filtersToggle.toggleClass('is-active');
  }

  onProductCardClick(e, card) {   
    if (card.isPreview) {
      e.preventDefault();
    }
  }  
}

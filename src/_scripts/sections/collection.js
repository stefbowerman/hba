import $ from 'jquery';
import { getQueryParams } from '../core/utils';
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

    // @TODO - Finish this... add to localstorage?
    const savedColCount = parseInt(window.HBA.collectionColumnCount) || 4;

    if (savedColCount > 0) {
      this.$gridToggles.filter(`[data-column-count="${savedColCount}"]`).addClass(classes.gridToggleActive);
      this.productCardGrid.setColumnCount(savedColCount);
      window.HBA.collectionColumnCount = savedColCount;
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

    this.$filtersToggle.toggleClass(classes.filtersToggleActive, !!this.filterController.activeFilter);
  }

  onFiltersToggleClick(e) {
    e.preventDefault();

    if (this.filtersOpen) {
      this.$filtersContainer.slideUp(150);
    }
    else {
      this.$filtersContainer.slideDown(150);
    }

    this.filtersOpen = !this.filtersOpen;
  }

  onGridToggleClick(e) {
    e.preventDefault();
    const $toggle = $(e.currentTarget);
    const columnCount = $toggle.data('column-count');

    // @TODO - Just testing this
    window.HBA.collectionColumnCount = columnCount;

    // @TODO - Better set method so this can be called programatically
    // if (this.columnCount == this.productCardGrid.columnCount ) return..

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
            $(window).trigger('lookup');
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

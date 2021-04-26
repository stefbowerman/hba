import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import {
  getQueryParams,
  getQueryString,
  getUrlWithUpdatedQueryStringParameter,
  getUrlWithRemovedQueryStringParameter,
  getScrollY
} from '../core/utils';
import BaseSection from './base';
import ControlBar from '../collection/controlBar';
import Filter from '../collection/filter';
import FilterController from '../collection/filterController';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  hero: '[data-collection-hero]',
  controlBar: '[data-collection-control-bar]',
  productCardGrid: '[data-product-card-grid]',
  filter: '[data-filter]'
};

const $window = $(window);

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    this.baseUrl = this.$container.data('base-url');
    this.heroTheme = this.$container.data('hero-theme');
    this.heroThemeClass = `theme-${this.heroTheme}`;
    this.queryFilterKey = 'filter';
    this.boundOnScroll = throttle(100, this.onScroll.bind(this));
    this.boundOnResize = throttle(250, this.onResize.bind(this));
    this.dimensions = {
      heroHeight: 0
    };

    this.$hero = $(selectors.hero, this.$container);
    this.$filters = $(selectors.filter, this.$container);

    this.controlBar = new ControlBar($(selectors.controlBar, this.$container).first(), {
      onGridToggleClick: this.onGridToggleClick.bind(this),
      onFilterClick: this.onFilterClick.bind(this)
    });

    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardClick: this.onProductCardClick.bind(this)
    });    

    this.filterController = new FilterController({
      onChange: this.onFilterControllerChange.bind(this)
    });

    this.$filters.each((i, el) => {
      this.filterController.registerFilter(new Filter(el));
    });

    $window.on({
      resize: this.boundOnResize,
      scroll: this.boundOnScroll
    });

    // When we load the page, check for filter tag parameters in the URL
    const queryParams = getQueryParams();

    if (queryParams.hasOwnProperty(this.queryFilterKey) && queryParams[this.queryFilterKey].length) {
      const f = this.filterController.getFilterForParam(decodeURIComponent(queryParams[this.queryFilterKey]));

      if (f) {
        this.filterController.toggle(f);
      }
    }

    this.onResize();
    this.onScroll();

    if (this.hasHero) {
      this.$hero.addClass(this.heroThemeClass);
    }
    
    this.productCardGrid.setColumnCount(window.HBA.collectionColCount);
    this.productCardGrid.reveal();
  }

  onUnload() {
    $window.off({
      scroll: this.boundOnScroll,
      resize: this.boundOnResize
    });
    $window.trigger($.Event('RESET_HEADER_THEME'));
  }

  get hasHero() {
    return this.$hero.length > 0;
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

  setDimensions() {
    this.dimensions.heroHeight = this.$hero.outerHeight();
  }

  onResize() {
    this.setDimensions();
  }

  onScroll() {
    if (!this.hasHero) return;

    let theme = null;

    if (getScrollY() <= this.dimensions.heroHeight) {
      theme = this.heroTheme;
    }

    $window.trigger($.Event('SET_HEADER_THEME', { theme }));
  }

  onFilterClick($filterEl) {
    this.filterController.toggleFilterByEl($filterEl);
  }

  onFilterControllerChange() {
    const { activeFilter } = this.filterController;

    this.productCardGrid.$el.fadeOut({
      duration: 200,
      easing: 'easeInCubic',
      start: () => {
        this.controlBar.setFiltersToggleActive(!!activeFilter)
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

  onGridToggleClick($toggle, columnCount) {
    if (columnCount === window.HBA.collectionColumnCount) return;

    window.HBA.collectionColumnCount = columnCount;

    this.productCardGrid.$el.fadeOut({
      duration: 200,
      easing: 'easeInCubic',
      start: () => {
        this.controlBar.setSelectedGridToggle($toggle)
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

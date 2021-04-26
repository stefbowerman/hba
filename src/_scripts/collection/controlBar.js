import $ from 'jquery';
import Typed from 'typed.js';

const selectors = {
  gridToggle: '[data-grid-toggle]',
  filter: '[data-filter]',
  filtersToggle: '[data-filters-toggle]',
  filterContainer: '[data-filter-container]',
  filterMenu: '[data-filter-menu]',
};

const classes = {
  loaded: 'is-loaded',
  gridToggleActive: 'is-active',
  filtersToggleActive: 'is-active'
};

export default class ControlBar {
  /**
   * Control Bar constructor
   *
   * @param {HTMLElement | $} el - The control bar element
   */
  constructor(el, options) {
    this.name = 'controlBar';
    this.filtersOpen = false;
    this.filtersAnimationTimeouts = [];

    const defaults = {
      onGridToggleClick: () => {},
      onFilterClick: () => {}
    };

    this.$el = $(el);
    this.$gridToggles = $(selectors.gridToggle, this.$el);
    this.$filtersContainer = $(selectors.filterContainer, this.$el);
    this.$filtersToggle = $(selectors.filtersToggle, this.$el);
    this.$filterMenus = $(selectors.filterMenu, this.$el); // Can be multiple
    this.$filters = $(selectors.filter, this.$el);

    this.settings = $.extend({}, defaults, options);

    this.$gridToggles.on('click', this.onGridToggleClick.bind(this));
    this.$filtersToggle.on('click', this.onFiltersToggleClick.bind(this));
    this.$filters.on('click', this.onFilterClick.bind(this));

    this.setSelectedGridToggle(
      this.$gridToggles.filter(`[data-column-count="${window.HBA.collectionColCount}"]`)
    );
  }

  setSelectedGridToggle($toggle) {
    this.$gridToggles.removeClass(classes.gridToggleActive);
    $toggle.addClass(classes.gridToggleActive);
  }

  setFiltersToggleActive(active) {
    this.$filtersToggle.toggleClass(classes.filtersToggleActive, active);
  }

  onFilterClick(e) {
    e.preventDefault();
    this.settings.onFilterClick($(e.currentTarget))
  }

  onFiltersToggleClick(e) {
    e.preventDefault();

    $.each(this.filtersAnimationTimeouts, (i, tO)  => clearTimeout(tO));

    const slideOptions = {
      easing: 'easeOutCubic',
      duration: this.filtersOpen ? 200 : 100
    };
    
    this.$filters.css('opacity', 0)

    this.$filtersContainer.stop(true, true); // In case any animations are running

    if (this.filtersOpen) {
      this.$filtersContainer.slideUp(slideOptions);
    }
    else {
      slideOptions.always = () => {
        this.$filters.each((i, el) => {
          const $el = $(el);
          const w = $el.width();
          const h = $el.height();
          const txt = $el.text();
          const delay = (i+1) * 60;

          $el.width(w);
          $el.height(h);
          $el.text('');

          this.filtersAnimationTimeouts.push(
            setTimeout(() => {
              $el.css('opacity', '');

              new Typed(el, {
                strings: [txt],
                contentType: null,
                typeSpeed: 15,
                showCursor: false,
                onComplete: () => {
                  $el.width('');
                  $el.height('');
                }
              });
            }, delay)
          );
        })
      }

      this.$filtersContainer.slideDown(slideOptions);
    }

    this.filtersOpen = !this.filtersOpen;
  }

  onGridToggleClick(e) {
    e.preventDefault();

    const $toggle = $(e.currentTarget);
    const columnCount = $toggle.data('column-count');

    this.settings.onGridToggleClick($toggle, columnCount);
  }
}

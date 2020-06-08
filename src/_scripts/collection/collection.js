import $ from 'jquery';
import CollectionSidebar from './collectionSidebar';
import ProductPane from '../product/productPane';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCardGrid: '[data-product-card-grid]',
  productPane:     '[data-product-pane]',
  sidebar:         '[data-sidebar]'
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

    // Maybe we ditch collection sidebar and just go straight to collectionBreadcrumbs and collectionFilters
    this.sidebar = new CollectionSidebar($(selectors.sidebar, this.$container), {
      onFilterClick: this.onFilterClick.bind(this)
    });

    this.productPane = new ProductPane($(selectors.productPane, this.$container));

    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardClick: this.onProductCardClick.bind(this)
    });

    // this.productPane.reveal();
    this.productCardGrid.reveal();
  }

  onFilterClick(url) {
    console.log('clicked on ' + url);

    this.productCardGrid.filterBy(url);
    this.sidebar.setSelectedFilter(url);
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

      this.sidebar.setBreadCrumb('collection-product', `products/${card.handle}`, card.url);
    }
  }
}

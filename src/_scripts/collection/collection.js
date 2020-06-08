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

    this.sidebar      = new CollectionSidebar($(selectors.sidebar, this.$container));
    this.productPane  = new ProductPane($(selectors.productPane, this.$container));
    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardClick: this.onProductCardClick.bind(this)
    });

    this.productCardGrid.reveal();
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

      this.sidebar.setBreadCrumb(card.url);
    }
  }
}

import $ from 'jquery';
import BaseSection from './base';
import ProductDetail from '../view/product/productDetail';
import ProductCard from '../view/product/productCard';

const selectors = {
  // collectionJson: '[data-collection-json]',
  productCard: '[data-product-card]',
  productPane: '[data-product-pane]'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    this.$productPane = $(selectors.productPane, this.$container);

    // Stop parsing if we don't have the collection json script tag
    // if (!$(selectors.collectionJson, this.$container).html()) {
    //   console.warn(`[${this.name}] - Element matching ${selectors.collectionJson} required.`);
    //   return;
    // }

    // this.collectionData = JSON.parse($(selectors.collectionJson, this.$container).html());
    this.productDetails = {};

    this.productCards = $.map($(selectors.productCard, this.$container), (el, i) => {
      const card = new ProductCard(el);

      setTimeout(() => card.show(), (150 * i));

      return card;
    });

    this.$container.on('click', selectors.productCard, this.onProductCardClick.bind(this));
  }

  onProductCardClick(e) {
    e.preventDefault();

    const handle = $(e.currentTarget).data('handle');

    // Temp - this doesn't really work
    if (this.productDetails[handle]) {
      this.$productPane.html(this.productDetails[handle].$el);
    }
    else {
      $.get(`/products/${handle}?view=detail`, (html) => {
        const $el = $(html);
        this.$productPane.html($el);
        const pd = new ProductDetail($el, false);
        this.productDetails[handle] = { $el, pd };
      });
    }
  }
}

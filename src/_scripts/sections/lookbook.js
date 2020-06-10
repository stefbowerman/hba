import $ from 'jquery';
import Typed from 'typed.js';
import BaseSection from './base';
import ProductCardGrid from '../product/productCardGrid';

const selectors = {
  productCard: '[data-product-card]',
  productCardGrid: '[data-product-card-grid]',
  details: '[data-details]'
};

const classes = {
  detailsHighlighted: 'highlighted'
};

export default class LookbookSection extends BaseSection {
  constructor(container) {
    super(container, 'lookbook');

    // @TODO - Do this better, create card + detail pairs in the contructor ??
    this.$details = $(selectors.details, this.$container);

    this.productCardGrid = new ProductCardGrid($(selectors.productCardGrid, this.$container), {
      onProductCardMouseenter: this.onProductCardMouseenter.bind(this),
      onProductCardMouseleave: this.onProductCardMouseleave.bind(this),
    });

    this.productCardGrid.reveal();

    // Type out each of the details
    // This doesn't work, typedjs breaks on nested html?
    
    // this.$details.each((i, el) => {
    //   const $el      = $(el);
    //   const $content = $el.find('[data-details-content]');
    //   const $typed   = $el.find('[data-details-typed]');

    //   new Typed($typed.get(0), {
    //     stringsElement: $content.get(0),
    //     contentType: 'html',
    //     typeSpeed: 5,
    //     showCursor: false
    //   });
    // });
  }

  onProductCardMouseenter(e, card) {
    this.$details.filter((i, el) => $(el).data('id') === card.id).addClass(classes.detailsHighlighted);
  }

  onProductCardMouseleave(e, card) {
    this.$details
      .filter(`.${classes.detailsHighlighted}`)
      .removeClass(classes.detailsHighlighted);
  }
}

import $ from 'jquery';
import ProductDetail from './productDetail';

const selectors = {
  productDetail: '[data-product-detail]'
};

const DEFAULT_FADE_OUT_TIME = 350;
const DEFAULT_FADE_IN_TIME  = 550;

export default class ProductPane {
  constructor(container) {
    this.$container = $(container);
    this.$productDetails = $(selectors.productDetail, this.$container);
    this.productDetails = $.map(this.$productDetails, el => new ProductDetail(el, false));
    this.activeProductDetail = null;
    this.isTransitioning = false;

    // Look through them and see if one is selected
    $.each(this.productDetails, (i, pd) => {
      if (pd.$el.data('selected')) {
        this.activate(pd.id);
        return false;
      }

      return true;
    });
  }

  destroy() {
    $.each(this.productDetails, (i, pd) => pd.destroy());
  }

  isActive(cardId) {
    return this.activeProductDetail && this.activeProductDetail.id === cardId;
  }

  // @TODO - Cleanup this method...
  activate(cardId, fadeOutDur, fadeInDur) {
    const fadeOutDuration = fadeOutDur || DEFAULT_FADE_OUT_TIME;
    const fadeInDuration  = fadeInDur  || DEFAULT_FADE_IN_TIME;
    const d = $.Deferred();

    if (this.isActive(cardId)) {
      return d.resolve();
    }

    const activePD = this.activeProductDetail;

    this.isTransitioning = true;

    // @TODO - Extract this
    if (activePD) {
      activePD.$el.fadeOut({
        duration: fadeOutDuration,
        easing: 'easeInCubic',
        complete: () => {
          activePD.onHidden();
        }
      });
    }

    this.productDetails.forEach((pd) => {
      // Needs to be a hide / show method on the product detail so it can do some clean up
      if (cardId === pd.id) {
        setTimeout(() => {
          pd.$el.fadeIn({
            duration: fadeInDuration,
            easing: 'easeOutCubic',
            start: () => {
              pd.onReveal();
            },
            complete: () => {
              pd.onRevealed();
              this.activeProductDetail = pd;
              d.resolve();
              this.isTransitioning = false;
            }
          });
        }, activePD ? fadeOutDuration : 0);

        pd.onBeforeReveal(); // on mobile, this will get called { duration }ms before onReveal does, giving us time to load images
      }
    });

    return d;
  }

  deactivate() {
    if (this.activeProductDetail) {
      const pd = this.activeProductDetail; // Need to store this as a var since we nullify this.activeProductDetail immediately

      pd.$el.fadeOut({
        duration: DEFAULT_FADE_OUT_TIME,
        easing: 'easeOutCubic',
        start: () => {
          this.isTransitioning = true;
        },
        complete: () => {
          pd.onHidden();
          this.isTransitioning = false;
        }
      });

      this.activeProductDetail = null;
    }
  }
}

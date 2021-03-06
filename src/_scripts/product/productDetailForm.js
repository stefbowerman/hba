import $ from 'jquery';
import Typed from 'typed.js';
import AJAXFormManager from '../managers/ajaxForm';
import AJAXKlaviyoForm from '../lib/ajaxKlaviyoForm';
import NewsletterForm from '../ui/newsletterForm';
import Variants from './variants';
import ProductDetailPrice from './productDetailPrice';

const selectors = {
  addToCart: '[data-add-to-cart]',
  addToCartForm: '[data-add-to-cart-form]',
  addToCartText: '[data-add-to-cart-text]',
  productDetailPrice: '[data-product-detail-price]',
  originalSelectorId: '[data-product-select]',
  productJson: '[data-product-json]',
  productDescription: '.product-description',
  singleOptionSelector: '[data-single-option-selector]',
  variantOptionValueList: '[data-variant-option-value-list][data-option-position]',
  variantOptionValue: '[data-variant-option-value]',
  title: '[data-title]',
  sku: '[data-sku]',
  statusSuccess: '[data-status-success]',
  statusError: '[data-status-error]',
  sizeGuide: '[data-size-guide]',
  sizeGuideShow: '[data-size-guide-show]',
  backInStock: '[data-back-in-stock]',
  newsletterForm: '[data-newsletter-form]' // for back in stock
};

const classes = {
  hide: 'hide',
  displayNone: 'd-none',
  variantOptionValueActive: 'is-active',
  btnActive: 'is-active',
  statusVisible: 'is-visible'
};

const $window = $(window);

const STATUS_TIMEOUT_DURATION = 2000;

export default class ProductDetailForm {
  /**
   * ProductDetailForm constructor
   *
   * @param { Object } config
   * @param { jQuery } config.$container - Main element, see snippets/product-detail-form.liquid
   * @param { Function } config.onVariantChange -  Called when a new variant has been selected from the form,
   * @param { Boolean } config.enableHistoryState - If set to "true", turns on URL updating when switching variant
   */
  constructor(config) {
    this.settings = {};
    this.name = 'productDetailForm';
    this.namespace = `.${this.name}`;

    this.events = {
      CLICK: `click${this.namespace}`
    };

    const defaults = {
      $container: null,
      onVariantChange: $.noop,
      enableHistoryState: true
    };

    this.settings = $.extend({}, defaults, config);

    if (!this.settings.$container || this.settings.$container.length === 0) {
      console.warn(`[${this.name}] - config.$container required to initialize`);
      return;
    }

    /* eslint-disable */
    /* temporarily disable to allow long lines for element descriptions */
    this.$container = this.settings.$container; // Scoping element for all DOM lookups
    this.$addToCartForm = $(selectors.addToCartForm, this.$container);
    this.$addToCartBtn = $(selectors.addToCart, this.$container);
    this.$addToCartBtnText = $(selectors.addToCartText, this.$container); // Text inside the add to cart button
    this.$productDetailPrice = $(selectors.productDetailPrice, this.$el)
    this.$productDescription = $(selectors.productDescription, this.$container);
    this.$singleOptionSelectors = $(selectors.singleOptionSelector, this.$container); // Dropdowns for each variant option containing all values for that option
    this.$variantOptionValueList = $(selectors.variantOptionValueList, this.$container); // Alternate UI that takes the place of a single option selector (could be swatches, dots, buttons, whatever..)
    this.$title = $(selectors.title, this.$container);
    this.$sku = $(selectors.sku, this.$container);
    this.$statusSuccess = $(selectors.statusSuccess, this.$container);
    this.$statusError = $(selectors.statusError, this.$container);
    this.$sizeGuide = $(selectors.sizeGuide, this.$container);
    this.$sizeGuideShow = $(selectors.sizeGuideShow, this.$container);
    this.$backInStock = $(selectors.backInStock, this.$container);
    this.$newsletterForm = $(selectors.newsletterForm, this.$container);
    /* eslint-enable */

    this.typers = {
      title: null,
      sku: null,
      statusSuccess: null,
      statusError: null,
      btn: null
    };

    this.productSingleObject = JSON.parse($(selectors.productJson, this.$container).html());

    this.variants = new Variants({
      $container: this.$container,
      enableHistoryState: this.settings.enableHistoryState,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    });
    this.price = new ProductDetailPrice(this.$productDetailPrice);

    if (this.$newsletterForm.length) {
      this.newsletterForm = new NewsletterForm(this.$newsletterForm, { forceSuccess: true });

      this.ajaxForm = new AJAXKlaviyoForm(this.$newsletterForm, {
        listId: this.$newsletterForm.data('klaviyo-list-id'),
        source: this.$newsletterForm.data('klaviyo-source'),
        onSubmitStart: () => this.newsletterForm.onSubmitStart(),
        onSubmitFail: errors => this.newsletterForm.onSubmitFail(errors),
        onSubscribeSuccess: response => this.newsletterForm.onSubscribeSuccess(response),
        onSubscribeFail: response => this.newsletterForm.onSubscribeFail(response)
      });
    }    

    this.$sizeGuide.find('table').addClass('table');

    this.timeouts = [];
    this.callbacks = {
      onAJAXFormAddStart: this.onAJAXFormAddStart.bind(this),
      onAJAXFormAddSuccess: this.onAJAXFormAddSuccess.bind(this),
      onAJAXFormAddFail: this.onAJAXFormAddFail.bind(this)
    };

    this.$sizeGuideShow.on('click', this.onSizeGuideShowClick.bind(this));
    this.$container.on('variantChange', this.onVariantChange.bind(this));
    this.$container.on(this.events.CLICK, selectors.variantOptionValue, this.onVariantOptionValueClick.bind(this));
    $window.on(AJAXFormManager.events.ADD_START, this.callbacks.onAJAXFormAddStart);
    $window.on(AJAXFormManager.events.ADD_SUCCESS, this.callbacks.onAJAXFormAddSuccess);
    $window.on(AJAXFormManager.events.ADD_FAIL, this.callbacks.onAJAXFormAddFail);
  }

  destroy() {
    $window.off(AJAXFormManager.events.ADD_START, this.callbacks.onAJAXFormAddStart);
    $window.off(AJAXFormManager.events.ADD_SUCCESS, this.callbacks.onAJAXFormAddSuccess);
    $window.off(AJAXFormManager.events.ADD_FAIL, this.callbacks.onAJAXFormAddFail);
    this.timeouts.forEach(tO => clearTimeout(tO));   
  }

  onVariantChange(evt) {
    const variant = evt.variant;

    this.price.update(variant);
    this.updateAddToCartState(variant);
    this.updateVariantOptionValues(variant);
    this.updateSku(variant.sku);

    this.settings.onVariantChange(variant);
  }

  /**
   * Updates the DOM state of the add to cart button
   *
   * @param {Object} variant - Shopify variant object
   */
  updateAddToCartState(variant) {
    let btnText = '';
    let btnDisabled = false;

    if (variant) {
      if (variant.available) {
        btnDisabled = false;
        btnText = theme.strings.addToCart;
      }
      else {
        btnDisabled = true;
        btnText = theme.strings.soldOut;
      }      
    }
    else {
      btnDisabled = true;
      btnText = theme.strings.unavailable;
    }

    this.$addToCartBtn.prop('disabled', btnDisabled);
    this.$addToCartBtnText.text(btnText);
  }

  /**
   * Updates the SKU DOM element
   *
   * @param {String} sku
   */
  updateSku(sku) {
    const d = $.Deferred();

    if (!sku || this.$sku.length === 0) {
      d.resolve();
    }
    else {
      this.$sku.text('');

      if (this.typers.sku) {
        this.typers.sku.destroy();
      }

      this.typers.sku = new Typed(this.$sku.get(0), {
        strings: [sku],
        contentType: null,
        typeSpeed: 10,
        showCursor: false,
        onComplete: () => d.resolve()
      }); 
    }

    return d;    
  }

  updateTitle(title) {
    const d = $.Deferred();

    if (title) {
      this.$title.text('');

      if (this.typers.title) {
        this.typers.title.destroy();
      }

      this.typers.title = new Typed(this.$title.get(0), {
        strings: [title],
        contentType: null,
        typeSpeed: 10,
        showCursor: false,
        onComplete: () => d.resolve()
      });      
    }
    else {
      d.resolve();
    }

    return d;
  }

  /**
   * Updates the DOM state of the elements matching the variantOption Value selector based on the currently selected variant
   *
   * @param {Object} variant - Shopify variant object
   */
  updateVariantOptionValues(variant) {
    if (variant) {
      // Loop through all the options and update the option value
      for (let i = 1; i <= 3; i++) {
        const variantOptionValue = variant[`option${i}`];

        if (!variantOptionValue) break; // Break if the product doesn't have an option at this index

        // Since we are finding the variantOptionValueUI based on the *actual* value, we need to scope to the correct list
        // As some products can have the same values for different variant options (waist + inseam both use "32", "34", etc..)
        const $list = this.$variantOptionValueList.filter(`[data-option-position="${i}"]`);
        const $variantOptionValueUI = $list.find('[data-variant-option-value="' + variantOptionValue + '"]');

        $variantOptionValueUI.addClass(classes.variantOptionValueActive);
        $variantOptionValueUI.siblings().removeClass(classes.variantOptionValueActive);
      }
    }
  }

  /**
   * Handle variant option value click event.
   * Update the associated select tag and update the UI for this value
   *
   * @param {event} evt
   */
  onVariantOptionValueClick(e) {
    e.preventDefault();
    const $option = $(e.currentTarget);

    if ($option.hasClass(classes.variantOptionValueActive) || $option.hasClass('is-disabled')) {
      return;
    }

    const value = $option.data('variant-option-value');
    const position = $option.parents(selectors.variantOptionValueList).data('option-position');
    const $selector = this.$singleOptionSelectors.filter(`[data-index="option${position}"]`);

    $selector.val(value);
    $selector.trigger('change');

    $option.addClass(classes.variantOptionValueActive);
    $option.siblings().removeClass(classes.variantOptionValueActive);
  }

  onReveal() {
    this.$title.addClass('d-none');
    this.$sku.addClass('d-none');
    this.$backInStock.addClass('d-none');
    this.$productDescription.addClass('d-none');
    this.$priceWrapper.addClass('d-none');
    this.$addToCartForm.addClass('d-none');

    const t = this.$title.text();
    const sku = this.$sku.text();

    this.$title.text('');
    this.$sku.text('');

    this.timeouts.push(
      setTimeout(() => {
        // Do the animation to type everything out
        this.$title.removeClass('d-none');
        this.updateTitle(t)
          .then(() => {
            this.$sku.removeClass('d-none');
            this.updateSku(sku)
              .then(() => {
                this.timeouts.push(
                  setTimeout(() => {
                    this.$productDescription.removeClass('d-none');  
                    this.timeouts.push(
                      setTimeout(() => {
                        this.$priceWrapper.removeClass('d-none');
                        this.timeouts.push(
                          setTimeout(() => {
                            this.$addToCartForm.removeClass('d-none');
                            this.$backInStock.removeClass('d-none');
                          }, 300)
                        );
                      }, 300)
                    );              
                  }, 150)
                );
              });
          });
      }, 200)
    );
  }

  onRevealed() {
    // 
  }

  onHidden() {
    this.$sizeGuideShow.removeClass('hide');
    this.$sizeGuide.addClass('hide');    
  }

  onSizeGuideShowClick(e) {
    e.preventDefault();
    this.$sizeGuideShow.addClass('hide');
    this.$sizeGuide.removeClass('hide');
  }

  onAJAXFormAddStart(e) {
    if (!this.$addToCartForm.is(e.relatedTarget)) return;

    this.$addToCartBtn.addClass(classes.btnActive);

    // Kill the status text when we start a request
    this.$statusSuccess.removeClass(classes.statusVisible);
    this.$statusError.removeClass(classes.statusVisible);

    if (this.typers.statusSuccess) {
      this.typers.statusSuccess.destroy();
    }

    if (this.typers.statusError) {
      this.typers.statusError.destroy();
    }     
  }

  /**
   * Called when the ajax form manager successfully adds a product to the ajax cart
   * Called for all forms so we need to check if the related target is equal to the form attached to the current instance
   *
   * @param {event} evt
   */
  onAJAXFormAddSuccess(e) {
    if (!this.$addToCartForm.is(e.relatedTarget)) return;

    this.$statusSuccess.addClass(classes.statusVisible);

    if (this.typers.statusSuccess) {
      this.typers.statusSuccess.destroy();
    }

    // @TODO - Stuff around making sure the statused are hidden / destroyed in case we click things fast
    this.typers.statusSuccess = new Typed(this.$statusSuccess.get(0), {
      strings: [`1 Item added to cart ^${STATUS_TIMEOUT_DURATION}`, ''],
      contentType: null,
      typeSpeed: 5,
      backSpeed: 5,
      showCursor: false,
      onComplete: (typed) => {
        this.$statusSuccess.text('').removeClass(classes.statusVisible);
        this.$addToCartBtn.removeClass(classes.btnActive);
        typed.destroy();
      }
    });
  }

  onAJAXFormAddFail(e) {
    if (!this.$addToCartForm.is(e.relatedTarget)) return;

    this.$statusError.addClass(classes.statusVisible);
    this.$addToCartBtn.removeClass(classes.btnActive);

    if (this.typers.statusError) {
      this.typers.statusError.destroy();
    }

    this.typers.statusError = new Typed(this.$statusError.get(0), {
      strings: [`Item could not be added to cart. ^${STATUS_TIMEOUT_DURATION}`, ''],
      contentType: null,
      typeSpeed: 5,
      backSpeed: 5,
      showCursor: false,
      onComplete: (typed) => {
        this.$statusError.text('').removeClass(classes.statusVisible);
        typed.destroy();
      }
    });
  }
}

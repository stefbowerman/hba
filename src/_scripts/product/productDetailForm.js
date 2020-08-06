import $ from 'jquery';
import Typed from 'typed.js';
import { formatMoney } from '../core/currency';
import AJAXFormManager from '../managers/ajaxForm';
import Variants from './variants';

const selectors = {
  addToCart: '[data-add-to-cart]',
  addToCartForm: '[data-add-to-cart-form]',
  addToCartText: '[data-add-to-cart-text]',
  comparePrice: '[data-compare-price]',
  comparePriceText: '[data-compare-text]',
  originalSelectorId: '[data-product-select]',
  priceWrapper: '[data-price-wrapper]',
  productJson: '[data-product-json]',
  productPrice: '[data-product-price]',
  singleOptionSelector: '[data-single-option-selector]',
  variantOptionValueList: '[data-variant-option-value-list][data-option-position]',
  variantOptionValue: '[data-variant-option-value]',
  title: '[data-title]',
  sku: '[data-sku]',
  statusSuccess: '[data-status-success]',
  statusError: '[data-status-error]'
};

const classes = {
  hide: 'hide',
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
      RESIZE: `resize${this.namespace}`,
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
    this.$priceWrapper = $(selectors.priceWrapper, this.$container); // Contains all price elements
    this.$productPrice = $(selectors.productPrice, this.$container);
    this.$comparePrice = $(selectors.comparePrice, this.$container);
    this.$compareEls = this.$comparePrice.add($(selectors.comparePriceText, this.$container));
    this.$singleOptionSelectors = $(selectors.singleOptionSelector, this.$container); // Dropdowns for each variant option containing all values for that option
    this.$variantOptionValueList = $(selectors.variantOptionValueList, this.$container); // Alternate UI that takes the place of a single option selector (could be swatches, dots, buttons, whatever..)
    this.$title = $(selectors.title, this.$container);
    this.$sku = $(selectors.sku, this.$container);
    this.$statusSuccess = $(selectors.statusSuccess, this.$container);
    this.$statusError = $(selectors.statusError, this.$container);
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

    this.$container.on('variantChange', this.onVariantChange.bind(this));
    this.$container.on(this.events.CLICK, selectors.variantOptionValue, this.onVariantOptionValueClick.bind(this));
    $window.on(AJAXFormManager.events.ADD_START, this.onAJAXFormAddStart.bind(this));
    $window.on(AJAXFormManager.events.ADD_SUCCESS, this.onAJAXFormAddSuccess.bind(this));
    $window.on(AJAXFormManager.events.ADD_FAIL, this.onAJAXFormAddFail.bind(this));
  }

  onVariantChange(evt) {
    const variant = evt.variant;

    this.updateProductPrices(variant);
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

    this.$priceWrapper.toggleClass(classes.hide, !!variant);
    this.$addToCartBtn.prop('disabled', btnDisabled);
    this.$addToCartBtnText.text(btnText);
  }

  /**
   * Updates the DOM with specified prices
   *
   * @param {Object} variant - Shopify variant object
   */
  updateProductPrices(variant) {
    if (variant) {
      this.$productPrice.html(formatMoney(variant.price, window.theme.moneyFormat));

      if (variant.compare_at_price > variant.price) {
        this.$comparePrice.html(formatMoney(variant.compare_at_price, theme.moneyFormat));
        this.$compareEls.removeClass(classes.hide);
      }
      else {
        this.$comparePrice.html('');
        this.$compareEls.addClass(classes.hide);
      }
    }
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
        typeSpeed: 30,
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
        typeSpeed: 20,
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

    if ($option.hasClass(classes.variantOptionValueActive)) {
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

  // Need to come up with a better system for this
  onReveal() {
    const t = this.$title.text();
    const sku = this.$sku.text();

    this.$title.text('');
    this.$sku.text('');

    // Do the animation to type everything out
    this.updateTitle(t)
      .then(() => this.updateSku(sku));
  }

  onHidden() {
    
  }

  onAJAXFormAddStart(e) {
    this.$addToCartBtn.addClass(classes.btnActive);

    // Kill the status text when we start a request
    this.$statusSuccess.removeClass(classes.statusVisible);
    if (this.typers.statusSuccess) {
      this.typers.statusSuccess.destroy();
    }

    this.$statusError.removeClass(classes.statusVisible);

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
      strings: [`${e.message || 'something went wrong'} ^${STATUS_TIMEOUT_DURATION}`, ''],
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

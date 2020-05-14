// jQuery
import $ from 'jquery';
import 'jquery-zoom';
import 'jquery-unveil';

// Bootstrap JS
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/modal';

// Core
import {
  userAgentBodyClass,
  cookiesEnabled,
  credits
} from './core/utils';
import {
  wrapTables,
  wrapIframe
} from './core/rte';
import { pageLinkFocus } from './core/a11y';
import * as Animations  from './core/animations';
import * as Breakpoints from './core/breakpoints';

// UI - Import all to enable data API
import './ui/drawer';
import './ui/overlay';
import './ui/tabs';
import './ui/quantityAdjuster';

// Sections
import SectionManager                from './sections/sectionManager';
import HeaderSection                 from './sections/header';
import FooterSection                 from './sections/footer';
import ProductSection                from './sections/product';
import CartSection                   from './sections/cart';
import AJAXCartSection               from './sections/ajaxCart';
import CollectionSection             from './sections/collection';
import BlogSection                   from './sections/blog';
import ArticleSection                from './sections/article';
import NewsletterModalSection        from './sections/newsletterModal';
import SlideshowSection              from './sections/slideshow';
import VideoSection                  from './sections/video';
import CMSPageSection                from './sections/cmsPage';
import CustomersLoginSection         from './sections/customersLogin';
import CustomersAccountSection       from './sections/customersAccount';
import CustomersAccountOrdersSection from './sections/customersAccountOrders';
import CustomersAddressesSection     from './sections/customersAddresses';
import CustomersOrderSection         from './sections/customersOrder';

// Templates
import './templates/pageStyles';
import './templates/pageComponents';

// Do this ASAP
Animations.initialize();
Breakpoints.initialize();

((Modernizr) => {
  const $document = $(document);
  const $body = $(document.body);

  const sectionManager = new SectionManager();

  sectionManager.register('header', HeaderSection);
  sectionManager.register('footer', FooterSection);
  sectionManager.register('product', ProductSection);
  sectionManager.register('cart', CartSection);
  sectionManager.register('ajax-cart', AJAXCartSection);
  sectionManager.register('collection', CollectionSection);
  sectionManager.register('blog', BlogSection);
  sectionManager.register('article', ArticleSection);
  sectionManager.register('newsletter-modal', NewsletterModalSection);
  sectionManager.register('slideshow', SlideshowSection);
  sectionManager.register('video', VideoSection);
  sectionManager.register('cms-page', CMSPageSection);
  sectionManager.register('customers-login', CustomersLoginSection);
  sectionManager.register('customers-account', CustomersAccountSection);
  sectionManager.register('customers-account-orders', CustomersAccountOrdersSection);
  sectionManager.register('customers-addresses', CustomersAddressesSection);
  sectionManager.register('customers-order', CustomersOrderSection);

  $('.in-page-link').on('click', evt => pageLinkFocus($(evt.currentTarget.hash)));

  // Common a11y fixes
  pageLinkFocus($(window.location.hash));

  // Target tables to make them scrollable
  wrapTables({
    $tables: $('.rte table'),
    tableWrapperClass: 'table-responsive'
  });

  // Target iframes to make them responsive
  const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]';

  wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'rte__video-wrapper'
  });

  // Apply UA classes to the document
  userAgentBodyClass();

  // Apply a specific class to the html element for browser support of cookies.
  if (cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }

  // Form event handling / validation
  $body.on('change keydown', '.form-control', (e) => {
    $(e.currentTarget).removeClass('is-invalid');
  });

  // START - Global handler for collapse plugin to add state class for open expandable lists
  const isOpenClass = 'is-open';

  $document.on('show.bs.collapse', '.collapse', (e) => {
    $(e.currentTarget).parents('.expandable-list').addClass(isOpenClass);
  });

  $document.on('hide.bs.collapse', '.collapse', (e) => {
    $(e.currentTarget).parents('.expandable-list').removeClass(isOpenClass);
  });

  $('.collapse.show').each(function() {
    $(this).parents('.expandable-list').addClass(isOpenClass);
  });
  // END - Global handler for collapse plugin to add state class for open expandable lists

  // Add "development mode" class for CSS hook
  $body.addClass('development-mode');

  credits();
})(Modernizr);

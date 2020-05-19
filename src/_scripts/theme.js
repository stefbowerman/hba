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
import * as Animations from './core/animations';
import * as Breakpoints from './core/breakpoints';

// Sections
import SectionManager from './sections/sectionManager';
import HeaderSection from './sections/header';
import FooterSection from './sections/footer';
import ProductSection from './sections/product';
import CartSection from './sections/cart';
import AJAXCartSection from './sections/ajaxCart';
import CollectionSection from './sections/collection';
import LookbookSection from './sections/lookbook';
import BlogSection from './sections/blog';
import ArticleSection from './sections/article';

// Do this ASAP
Animations.initialize();
Breakpoints.initialize();

((Modernizr) => {
  const $body = $(document.body);

  const sectionManager = new SectionManager();

  sectionManager.register('header', HeaderSection);
  sectionManager.register('footer', FooterSection);
  sectionManager.register('product', ProductSection);
  sectionManager.register('cart', CartSection);
  sectionManager.register('ajax-cart', AJAXCartSection);
  sectionManager.register('collection', CollectionSection);
  sectionManager.register('lookbook', LookbookSection);
  sectionManager.register('blog', BlogSection);
  sectionManager.register('article', ArticleSection);

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

  // Add "development mode" class for CSS hook
  $body.addClass('development-mode');

  credits();
})(Modernizr);

// jQuery
import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import 'imagesloaded';
import './lib/jquery-unveil.custom';

// Bootstrap JS
// import 'bootstrap/js/dist/collapse';
// import 'bootstrap/js/dist/modal';

// Core
import {
  userAgentBodyClass,
  cookiesEnabled,
  credits,
  isExternal,
  getScrollY
} from './core/utils';
import { pageLinkFocus } from './core/a11y';
import * as Animations from './core/animations';
import * as Breakpoints from './core/breakpoints';
import AppController from './core/appController';

// Views
import ProductView from './views/product';
import CollectionView from './views/collection';
import PageView from './views/page';
import IndexView from './views/index';

// Sections
import HeaderSection from './sections/header';
import FooterSection from './sections/footer';
import AJAXCartSection from './sections/ajaxCart';
import BackgroundMedia from './sections/backgroundMedia';
import HomepageBackground from './sections/homepageBackground';

/* eslint-disable */

// Array.find polyfill
Array.prototype.find = Array.prototype.find || function (r) { if (null === this) throw new TypeError("Array.prototype.find called on null or undefined"); if ("function" != typeof r) throw new TypeError("callback must be a function"); for (var n = Object(this), t = n.length >>> 0, o = arguments[1], e = 0; e < t; e++) { var f = n[e]; if (r.call(o, f, e, n)) return f } };

/* eslint-enable */

// Do this ASAP
Animations.initialize();
Breakpoints.initialize();

window.HBA = {
  appController: null,
  collectionColCount: 4 // Default column count, user can change this over the life of their visit
};

const setViewportHeightProperty = () => {
  // If mobile / tablet, set var to window height. This fixes the 100vh iOS bug/feature.
  const v = window.innerWidth <= 1024 ? `${window.innerHeight}px` : '100vh';
  document.documentElement.style.setProperty('--viewport-height', v);
};

((Modernizr) => {
  const $body = $(document.body);

  // Instantiate sections that live *outside* of content_for_layout
  const sections = {
    header: new HeaderSection($('[data-section-type="header"]')),
    footer: new FooterSection($('[data-section-type="footer"]')),
    homepageBackground: new HomepageBackground($('[data-section-type="homepage-background"]')),
    ajaxCart: new AJAXCartSection($('[data-section-type="ajax-cart"]')),
    backgroundMedia: new BackgroundMedia($('[data-section-type="background-media"]'))
  };

  // Create the app controller for routing
  const appController = new AppController({
    viewConstructors: {
      product: ProductView,
      collection: CollectionView,
      page: PageView,
      index: IndexView
    },
    onSameRoute: (url, currentView) => {

    },
    onInitialViewReady: (view) => {
      // console.log('onInitialViewReady');
    },
    onBeforeRouteStart: (deferred) => {
      // console.log('onBeforeRouteStart');
      sections.ajaxCart.close();
      deferred.resolve();
    },
    onRouteStart: (url, type) => {
      sections.footer.newsletterForm && sections.footer.newsletterForm.hideFormContents();

      if (type !== 'index') {
        sections.homepageBackground.hide();
      }
    },
    onViewChangeStart: (url, newView) => {
      // console.log('onViewChangeStart');
    },
    onViewTransitionOutDone: (url, deferred) => {
      window.scrollTo && window.scrollTo(0, 0);
      deferred.resolve();
    },
    onViewChangeComplete: (newView) => {
      // console.log('onViewChangeComplete');
    },
    onViewReady: (view) => {
      // console.log('onViewReady');

      if (view.type === 'index') {
        sections.homepageBackground.show();
      }

      if (view.type === 'cart') {
        sections.ajaxCart.open();
      }
    }
  });

  // Expose the controller for the rest of the app
  window.HBA.appController = appController;

  appController.start(); // Very important to start it *after* attatching it to window.HBA since some JS depends on it

  $('.in-page-link').on('click', evt => pageLinkFocus($(evt.currentTarget.hash)));

  // Common a11y fixes
  pageLinkFocus($(window.location.hash));

  // Apply UA classes to the document
  userAgentBodyClass();

  // Apply a specific class to the html element for browser support of cookies.
  if (cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }

  window.addEventListener('resize', throttle(100, setViewportHeightProperty));
  document.addEventListener('scroll', throttle(100, () => {
    $body.toggleClass('is-scrolled', getScrollY() > 0);

    if (window.innerWidth > 1024) return;
    setViewportHeightProperty();
  }));

  setViewportHeightProperty();

  $body.addClass('is-loaded');

  // Stop here...no AJAX navigation inside the theme editor
  // eslint-disable-next-line no-undef
  if (Shopify && Shopify.designMode) {
    return;
  }

  if (window.history && window.history.pushState) {
    $body.on('click', 'a', (e) => {
      if (e.isDefaultPrevented()) return true;

      const url = $(e.currentTarget).attr('href');

      if (isExternal(url) || url === '#' || url.indexOf('/checkout') > -1) return true;

      if (appController.isTransitioning) return false;

      e.preventDefault();
      appController.navigate(url);

      return true;
    });

    // Prevents browser from restoring scroll position when hitting the back button
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }

  credits();
})(Modernizr);

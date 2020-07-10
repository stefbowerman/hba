// jQuery
import $ from 'jquery';
import { throttle } from 'throttle-debounce';
// import 'jquery-zoom';
// import 'jquery-unveil';

// Bootstrap JS
// import 'bootstrap/js/dist/collapse';
// import 'bootstrap/js/dist/modal';

// Core
import {
  userAgentBodyClass,
  cookiesEnabled,
  credits,
  isExternal
} from './core/utils';
import { pageLinkFocus } from './core/a11y';
// import * as Animations   from './core/animations';
// import * as Breakpoints  from './core/breakpoints';
import AppController     from './core/appController';

// Views
import IndexView      from './views/index';
import PageView       from './views/page';

// Sections
import HeaderSection   from './sections/header';
import FooterSection   from './sections/footer';
// import AJAXCartSection from './sections/ajaxCart';
import VideoBackgroundSection from './sections/videoBackground';

// Do this ASAP
// Animations.initialize();
// Breakpoints.initialize();

window.HBA = {
  appController: null,
  videoBackgroundAudioPlaying: false // Allow other parts of the app to check if the video is playing or not
};

((Modernizr) => {
  const $body = $(document.body);

  // Instantiate sections that live *outside* of content_for_layout
  const sections = {
    header:   new HeaderSection($('[data-section-type="header"]')),
    footer:   new FooterSection($('[data-section-type="footer"]')),
    videobackground: new VideoBackgroundSection($('[data-section-type="video-background"]'))
  };

  // Create the app controller for routing
  const appController = new AppController({
    viewConstructors: {
      index: IndexView,
      page: PageView
    },
    onRouteStart: () => {
      sections.header.newsletterForm.hideFormContents();
      sections.footer.newsletterForm.hideFormContents();
    }
  });

  // Expose the router to the rest of the application
  window.HBA.appController = appController;

  $('.in-page-link').on('click', evt => pageLinkFocus($(evt.currentTarget.hash)));

  // Common a11y fixes
  pageLinkFocus($(window.location.hash));

  // Apply UA classes to the document
  userAgentBodyClass();

  // Apply a specific class to the html element for browser support of cookies.
  if (cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }

  const setViewportHeightProperty = () => {
    // If mobile / tablet, set var to window height. This fixes the 100vh iOS bug/feature.
    const v = window.innerWidth <= 1024 ? `${window.innerHeight}px` : '100vh';
    document.documentElement.style.setProperty('--viewport-height', v);
  };

  window.addEventListener('resize', throttle(100, setViewportHeightProperty));
  document.addEventListener('scroll', throttle(100, () => {
    if (window.innerWidth > 1024) return;

    setViewportHeightProperty();
  }));
  
  setViewportHeightProperty();  

  $body
    .addClass('is-loaded')
    .removeClass('is-loading');

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

  // Add "development mode" class for CSS hook
  // $body.addClass('development-mode');

  credits();
})(Modernizr);

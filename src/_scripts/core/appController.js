import $ from 'jquery';
import Navigo from 'navigo';
import BaseView from '../views/base';
import { hashFromString } from './utils';

const $body = $(document.body);
const TEMPLATE_REGEX = /(^|\s)template-\S+/g;
const THEME_REGEX = /(^|\s)theme-\S+/g;

export default class AppController {
  constructor(options = {}) {
    const defaults = {
      viewContainerSelector: '.view-container',
      viewContentSelector: '.view-content',
      viewConstructors: {},
      redirectTimeoutMs: 5000,
      onSameRoute: () => {},
      onBeforeRouteStart: d => d.resolve(),
      onRouteStart: (url, type) => {},
      onViewTransitionOutDone: (url, d) => d.resolve(), // eslint-disable-line brace-style
      onViewChangeStart: () => {},
      onViewChangeComplete: () => {},
      onViewReady: () => {},
      onInitialViewReady: () => {}
    };

    this.router = new Navigo(window.location.origin, false, '#!');
    this.routerIsPaused = false;
    this.isTransitioning = false;
    this.currentView = null;
    this.firstRoute = true;
    this.settings = $.extend({}, defaults, options);
    this.urlCache = {};

    this.$viewContainer = $(this.settings.viewContainerSelector);

    // Add Routes
    this.router.on('/products/:slug', (params) => {
      this.doRoute(`/products/${params.slug}`, 'product');
    });

    // Product preview - This is an important route otherwise the admin product preview functionality won't work!
    this.router.on('/products_preview', (params, query) => {
      this.doRoute(`/products_preview?${query}`, 'product');
    });

    // Collection
    this.router.on('/collections/:slug', (params, query) => {
      let url = `/collections/${params.slug}`;

      if (query) {
        url += `?${query}`;
      }

      this.doRoute(url, 'collection');
    });

    // Tagged collection
    this.router.on('/collections/:slug/:tag', (params, query) => {
      let url = `/collections/${params.slug}/${params.tag}`;

      if (query) {
        url += `?${query}`;
      }

      this.doRoute(url, 'collection');
    });

    // Product within a collection
    this.router.on('/collections/:slug/products/:handle', (params, query) => {
      this.doRoute(`/collections/${params.slug}/products/${params.handle}`, 'product');
    });

    this.router.on('/collections', () => {
      this.doRoute('/collections', 'list-collections');
    });

    this.router.on('/products', () => {
      this.doRoute('/products', 'list-collections');
    });

    this.router.on('/cart', (params) => {
      this.doRoute('/cart', 'cart');
    });

    this.router.on('/pages/:slug', (params) => {
      this.doRoute(`/pages/${params.slug}`, 'page', true);
    });

    this.router.on('/blogs/:slug', (params) => {
      this.doRoute(`/blogs/${params.slug}`, 'blog', true);
    });

    this.router.on('/', () => {
      this.doRoute('/', 'index');
    });

    this.router.on('/challenge', () => {
      this.doRoute('/challenge');
    });

    this.router.on('/search', (params, query) => {
      let url = '/search';

      if (query) {
        url += `?${query}`;
      }

      this.doRoute(url, 'search');
    });    

    this.router.notFound((params) => {
      // called when there is path specified but
      // there is no route matching
      // console.log(params);
      this.router.navigate('/'); // Just go back home
    });
  }

  start() {
    this.router.resolve();
  }

  /**
   * Fetches a new page for the passed in url and passes it to the view change method
   *
   * @param {string} url
   * @param {string} type - type of view
   * @param {boolean} - cacheable - whether or not this page can be cached on the frontend
   */
  doRoute(url, type, cacheable = false) {
    const ViewConstructor = this.settings.viewConstructors[type] || BaseView;

    if (this.firstRoute) {
      // Can't cache here, at this point the DOM has been altered via JS.
      // We can only cache fresh HTML from the server
      this.firstRoute = false;
      this.currentView = new ViewConstructor(this.$viewContainer, type);
      this.settings.onViewReady(this.currentView);
      this.settings.onInitialViewReady(this.currentView);

      return;
    }

    const urlKey = hashFromString(url);
    const ajaxDeferred = $.Deferred();
    const transitionDeferred = $.Deferred();
    const beforeRouteStartDeferred = $.Deferred();

    // If we already have the page HTML in our cache...
    if (cacheable && this.urlCache.hasOwnProperty(urlKey)) {
      ajaxDeferred.resolve(this.urlCache[urlKey]);
    }
    else {
      // Add a timeout to do a basic redirect to the url if the request takes longer than a few seconds
      const t = setTimeout(() => {
        window.location = url;
      }, this.settings.redirectTimeoutMs);

      $.get(url, (response) => {
        clearTimeout(t);
        ajaxDeferred.resolve(response);

        // Cache it for next time
        if (cacheable && !this.urlCache.hasOwnProperty(urlKey)) {
          this.urlCache[urlKey] = response;
        }
      });
    }

    this.settings.onBeforeRouteStart(beforeRouteStartDeferred);

    $.when(beforeRouteStartDeferred).done(() => {
      this.settings.onRouteStart(url, type);

      // Transition out as soon as the link is clicked?  Need to add min time before viewchage to allow the transitoin to complete?
      this.$viewContainer.one('transitionend', () => {
        // transitionDeferred.resolve();
        this.settings.onViewTransitionOutDone(url, transitionDeferred);
      });
      
      this.$viewContainer.find(this.settings.viewContentSelector).addClass('transition-out');

      // Let the current view do it's 'out' transition and then apply the loading state
      // this.currentView.beforeTransitionOut(() => {
      //   this.settings.onViewTransitionOutDone(url, transitionDeferred);
      // });

      // Once AJAX *and* css animations are done, trigger the callback
      $.when(ajaxDeferred, transitionDeferred).done((response) => {
        this.doViewChange(response, ViewConstructor, type, url);
      });
    });
  }

  doViewChange(AJAXResponse, ViewConstructor, type, url) {
    // Kill the current view
    this.currentView.destroy();

    const $responseHtml = $(document.createElement('html'));
    
    $responseHtml.get(0).innerHTML = AJAXResponse;

    const $responseHead = $responseHtml.find('head');
    const $responseBody = $responseHtml.find('body');

    // Do DOM updates
    this.setDocumentTitle($responseHead.find('title').text());

    const $oldViewContent = this.$viewContainer.find(this.settings.viewContentSelector);
    const $newViewContent = $responseBody.find(this.settings.viewContentSelector);

    $newViewContent.addClass('transition-in'); // This is what hides it from view, needed before we append to DOM

    // Here's where we append the new dom, transition out the old dom, and then do cleanup
    this.$viewContainer.append($newViewContent);

    const newView = new ViewConstructor($newViewContent, type);

    // Wait for everything to load before animating in?
    this.settings.onViewChangeStart(url, newView);

    // Update the body ID
    $body.attr('id', $responseBody.attr('id'));
    
    // Update the body class
    $body.removeClass((i, currentClasses) => {
      return currentClasses.split(' ').map(classname => (classname.match(TEMPLATE_REGEX)) || classname.match(THEME_REGEX)).join(' ');
    });

    $body.addClass(() => {
      return $responseBody.attr('class').split(' ').map(classname => (classname.match(TEMPLATE_REGEX)) || classname.match(THEME_REGEX)).join(' ');
    });

    // let now = Date.now();

    // Wait for DOM to Update
    setTimeout(() => {
      $newViewContent.addClass('transition-in-active');  
    }, 32);

    // I don't know what's going on
    // $newViewContent.one('transitionend') was firing because of child product cards transitioning in?
    setTimeout(() => {
      // window.scrollTo && window.scrollTo(0, 0);
      $newViewContent.removeClass('transition-in transition-in-active');
      $oldViewContent.remove();

      // this.settings.onViewChangeDOMUpdatesComplete($responseHead, $responseBody);

      this.currentView = newView;

      this.settings.onViewChangeComplete(this.currentView);

      // Is there a callback for this?
      this.settings.onViewReady(this.currentView);

      this.isTransitioning = false;
    }, 650);      
    // });

    // setTimeout(() => {
    //   $oldViewContent.addClass('transition-out');
    // }, 20);
  }

  navigate(url) {
    // If the router is paused, do the navigation no matter what
    // When the router is paused and unpaused, this.router.lastRouteResolved() can get stale
    if (this.routerIsPaused) {
      this.router.navigate(url);
    }
    else if (url === this.router.lastRouteResolved().url) {
      this.settings.onSameRoute(url, this.currentView);
    }
    else {
      this.router.navigate(url);
    }

    return this;
  }

  setDocumentTitle(title) {
    document.title = title;
    return this;
  }

  pauseRouter() {
    this.router.pause();
    this.routerIsPaused = true;
    return this;
  }

  resumeRouter() {
    this.router.resume();
    this.routerIsPaused = false;
    return this;
  }
}

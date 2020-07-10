import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';

const $window = $(window);

class VideoBackground {
  constructor(el) {
    this.$el = $(el);
    this.$video = $('video', this.$el);
    this.$source = $('source', this.$el);
    this.$poster = $('img', this.$el);

    this.isVisible = false;

    const dataSrc = this.$source.attr('data-src');
    if (!dataSrc) {
      this.$el.addClass('is-loaded');
    } 
  }

  show() {
    if (this.isVisible) return;

    const dataSrc = this.$source.attr('data-src');

    if (dataSrc) {
      this.$source.get(0).src = dataSrc;
      this.$source.attr('data-src', null).removeAttr('data-src');
      
      this.$video.one('loadeddata loadedmetadata play', () => {
        this.$el.addClass('is-loaded');
        this.play();
      });

      this.$video.get(0).load();
    }
    else {
      this.play();
    }

    this.$el.addClass('is-active');
    this.isVisible = true;
  }

  hide() {
    if (!this.isVisible) return;

    this.$video.get(0).pause();
    this.$el.removeClass('is-active');
    this.isVisible = false;
  }

  play() {
    const playPromise = this.$video.get(0).play();
    
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        // Autoplay isn't supported
        // Load the poster image and show that instead
        if (this.$poster.attr('data-src')) {
          this.$poster.attr('src', this.$poster.data('src'));
          this.$poster.attr('data-src', '').removeAttr('data-src');
        }

        this.$el.addClass('show-poster');
      });
    }  
  }
}

export default class VideoBackgroundSection extends BaseSection {
  constructor(container) {
    super(container, 'video-background');

    this.landscapeBackground = new VideoBackground($('[data-video-landscape]', this.$container));
    this.portraitBackground = new VideoBackground($('[data-video-portrait]', this.$container));

    this.currentWindowOrientation = null; // we initialize this by calling onResize inside the constructor this.getWindowOrientation();
    this.throttledResize = throttle(100, this.onResize.bind(this));
    
    // Events
    $window.on('resize', this.throttledResize);

    this.onResize();
  }

  getWindowOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  onResize() {
    const o = this.getWindowOrientation();

    if (o !== this.currentWindowOrientation) {
      if (o === 'landscape') {
        this.landscapeBackground.show();
        this.portraitBackground.hide();
      }
      else {
        this.landscapeBackground.hide();
        this.portraitBackground.show();
      }
    }

    this.currentWindowOrientation = o;
  }

  onUnload() {
    $window.off('resize', this.throttledResize); 
  }
}

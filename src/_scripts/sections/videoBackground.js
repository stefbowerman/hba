import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import { isTouch } from '../core/utils';
import BaseSection from './base';
import CountdownTimer from '../ui/countdownTimer';

const $window = $(window);
const $body = $(document.body);

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

const selectors = {
  countdown: '[data-countdown]'
};

export default class VideoBackgroundSection extends BaseSection {
  constructor(container) {
    super(container, 'video-background');

    this.landscapeBackground = new VideoBackground($('[data-video-landscape]', this.$container));
    this.portraitBackground = new VideoBackground($('[data-video-portrait]', this.$container));    

    this.$audio = $('audio', this.$audio);
    this.audio  = this.$audio.get(0);

    this.currentWindowOrientation = null; // we initialize this by calling onResize inside the constructor this.getWindowOrientation();
    this.audioPlaying = false;
    this.throttledResize = throttle(100, this.onResize.bind(this));

    // Events
    $window.on('resize', this.throttledResize);
    this.$audio.on('play', this.onAudioPlay.bind(this)); // Happens on page load when the audio starts playing for the first time
    this.$audio.on('pause stalled', this.onAudioPause.bind(this));

    if (isTouch()) {
      $body.on('touchstart', '[data-toggle-background-audio]', this.onToggleBackgroundAudioClick.bind(this));
      $body.on('click', '[data-toggle-background-audio]', e => e.preventDefault());
    }
    else {
      $body.on('click', '[data-toggle-background-audio]', this.onToggleBackgroundAudioClick.bind(this));
    }

    this.$countdown = $(selectors.countdown, this.$container);
    this.countdownTimer = new CountdownTimer(this.$countdown);

    setTimeout(() => this.startMedia(), 1500);
    this.onResize();
  }

  getWindowOrientation() {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }  

  startMedia() {
    const p2 = this.audio.play();

    if (p2) {
      p2.catch(e => console.log(e)); // eslint-disable-line no-console
    }    
  }

  onAudioPlay() {
    this.audioPlaying = true;

    const e = $.Event('audioPlay.videoBackground');
    $window.trigger(e);
  }

  onAudioPause() {
    this.audioPlaying = false;

    const e = $.Event('audioPause.videoBackground');
    $window.trigger(e);
  }

  onToggleBackgroundAudioClick(e) {
    e.preventDefault();

    const $toggle = $(e.currentTarget);
    const toggleOn = !!$toggle.data('toggle-background-audio'); // data attribute should be bool
    toggleOn ? this.audio.play() : this.audio.pause();
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

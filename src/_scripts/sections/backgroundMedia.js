import $ from 'jquery';
import { isTouch } from '../core/utils';
import BaseSection from './base';

const $body = $(document.body);

class VideoBackground {
  constructor(el) {
    this.$el = $(el);
    this.$video = $('video', this.$el);
    this.$source = $('source', this.$el);
    this.$poster = $('img', this.$el);
    this.video = this.$video.get(0);

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

      this.video.load();
    }
    else {
      this.play();
    }

    this.$el.addClass('is-active');
    this.isVisible = true;
  }

  hide() {
    if (!this.isVisible) return;

    this.video.pause();
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

export default class BackgroundMediaSection extends BaseSection {
  constructor(container) {
    super(container, 'background-media');

    this.audioPlaying = false;

    this.$videoBackgroundEl = $('.video-background', this.$container).first();
    this.$audio = $('audio', this.$audio).first();

    if (this.$videoBackgroundEl.length) {
      this.videoBackground = new VideoBackground(this.$videoBackgroundEl);
    }

    if (this.$audio.length) {
      this.audio = this.$audio.get(0);

      this.$audio.on('play', this.onAudioPlay.bind(this)); // Happens on page load when the audio starts playing for the first time
      this.$audio.on('pause stalled', this.onAudioPause.bind(this));

      if (isTouch()) {
        $body.on('touchstart', '[data-toggle-background-audio]', this.onToggleBackgroundAudioClick.bind(this));
        $body.on('click', '[data-toggle-background-audio]', e => e.preventDefault());
      }
      else {
        $body.on('click', '[data-toggle-background-audio]', this.onToggleBackgroundAudioClick.bind(this));
      }      
    } 

    this.videoBackground && this.videoBackground.show();
    setTimeout(() => this.startMedia(), 1500);
  }


  startMedia() {
    if (!this.audio) return;

    const p2 = this.audio.play();

    if (p2) {
      p2.catch(e => console.log(e)); // eslint-disable-line no-console
    }    
  }

  onAudioPlay() {
    this.audioPlaying = true;

    $('[data-toggle-background-audio="true"]').addClass('is-active');
    $('[data-toggle-background-audio="false"]').removeClass('is-active');    
  }

  onAudioPause() {
    this.audioPlaying = false;

    $('[data-toggle-background-audio="true"]').removeClass('is-active');
    $('[data-toggle-background-audio="false"]').addClass('is-active');    
  }

  onToggleBackgroundAudioClick(e) {
    if (!this.audio) return;

    e.preventDefault();

    const $toggle = $(e.currentTarget);
    const toggleOn = !!$toggle.data('toggle-background-audio'); // data attribute should be bool
    toggleOn ? this.audio.play() : this.audio.pause();
  }  
}
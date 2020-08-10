import $ from 'jquery';
import { isTouch } from '../core/utils';
import BaseSection from './base';
import VideoBackground from '../ui/videoBackground';
import VideoBackgroundQueue from '../ui/videoBackgroundQueue';

const selectors = {
  videoBackground: '[data-video-background]'
};

const $body = $(document.body);

export default class BackgroundMediaSection extends BaseSection {
  constructor(container) {
    super(container, 'background-media');

    this.audioPlaying = false;
    this.videoBackgroundQueue = new VideoBackgroundQueue();

    $(selectors.videoBackground, this.$container).each((i, el) => {
      this.videoBackgroundQueue.register(new VideoBackground(el));
    });

    this.$audio = $('audio', this.$audio).first();

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

    this.videoBackgroundQueue.start();

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
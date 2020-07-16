import $ from 'jquery';
import {
  // random,
  isTouch
} from '../core/utils';
import BaseSection from './base';

const $window = $(window);
const $body   = $(document.body);
// const layout  = $('.layout').get(0);

// const classes = {
//   bodyEffectActive: 'effect-active'
// };

// const FX_START_TIME = 19.5;
// const FX_END_TIME   = 36;

export default class VideoBackgroundSection extends BaseSection {
  constructor(container) {
    super(container, 'video-background');

    this.objectAssignSupport = typeof Object.assign === 'function';

    // this.$video = $('video', this.$container);
    this.$audio = $('audio', this.$audio);
    // this.$videoSource = $('source', this.$video);

    // this.video  = this.$video.get(0);
    this.audio  = this.$audio.get(0);

    this.audioPlaying = false;

    // FX Vars
    // this.fxInterval       = null;
    // this.fxAnimFrame      = null;
    // this.fxRunning        = false;
    // this.fxProps          = this.initialFxProps;
    // this.opacityTimeout   = null;
    // this.translateTimeout = null;
    // this.scaleTimeout     = null;
    // this.filterTimeout    = null;


    // Events
    // this.$video.on('timeupdate', this.onVideoTimeUpdate.bind(this));
    this.$audio.on('play', this.onAudioPlay.bind(this)); // Happens on page load when the audio starts playing for the first time
    this.$audio.on('pause stalled', this.onAudioPause.bind(this));

    if (isTouch()) {
      $body.on('touchstart', '[data-toggle-background-audio]', this.onToggleBackgroundAudioClick.bind(this));
      $body.on('click', '[data-toggle-background-audio]', e => e.preventDefault());
    }
    else {
      $body.on('click', '[data-toggle-background-audio]', this.onToggleBackgroundAudioClick.bind(this));
    }

    setTimeout(() => this.startMedia(), 1500);

    // Delaying the load + playback of the video
    // frees up some performance for the statement typing effect
    // setTimeout(() => {
    //   const dataSrc = this.$videoSource.attr('data-src');

    //   if (dataSrc) {
    //     this.$videoSource.get(0).src = dataSrc;
    //     this.$videoSource.attr('data-src', null).removeAttr('data-src');

    //     this.$video.one('loadeddata', () => this.startMedia());
    //     this.video.load();
    //   }
    //   else {
    //     this.startMedia();
    //   }
    // }, 1500);
  }

  // get initialFxProps() {
  //   return {
  //     opacity: 1,
  //     scaleX: 1,
  //     translateX: 0,
  //     translateY: 0,
  //     skew: 0,
  //     blur: 0,
  //     contrast: 1
  //   };
  // }

  // setFXProps(reset = false) {
  //   if (!this.objectAssignSupport) return; // @TODO - Polyfill?

  //   this.fxAnimFrame = requestAnimationFrame(() => {
  //     const opacity   = reset ? '' : this.fxProps.opacity;
  //     const filter    = reset ? '' : `blur(${this.fxProps.blur}px) contrast(${this.fxProps.contrast})`;
  //     const transform = reset ? '' : `translate(${this.fxProps.translateX}px, ${this.fxProps.translateY}px) scaleX(${this.fxProps.scaleX}) skew(${this.fxProps.skew}deg)`;

  //     const styles = {
  //       opacity: opacity,
  //       filter: filter,
  //       webkitFilter: filter,
  //       transform: transform,
  //       webkitTransform: transform
  //     };

  //     Object.assign(layout.style, styles);
  //   });
  // }

  // fxOpacityLoop() {
  //   let d = random(20, 80);
  //   let o = this.fxProps.opacity ? 0 : 1;

  //   // Sometimes, make the text show for a little longer and stop flickering
  //   if (d > 59 && d < 66) {
  //     o = 1;
  //     d = random(500, 700);
  //   }

  //   this.fxProps.opacity = o;
  //   this.opacityTimeout = setTimeout(this.fxOpacityLoop.bind(this), d);
  // }

  // fxTranslateLoop() {
  //   this.fxProps.translateX = random(-2, 10);
  //   this.fxProps.translateY = random(-1, 1);
  //   this.translateTimeout = setTimeout(this.fxTranslateLoop.bind(this), random(30, 300));
  // }

  // fxScaleLoop() {
  //   const s = random(-10, 10) * 0.001;
  //   this.fxProps.scaleX = 1 + s;
  //   this.fxProps.skew = random(0, 10) * 0.1;
  //   this.scaleTimeout = setTimeout(this.fxScaleLoop.bind(this), random(100, 1e3));
  // }

  // fxFilterLoop() {
  //   this.fxProps.blur = random(0, 15) * 0.1; // Make sure there's always a little bit of blur
  //   this.fxProps.contrast = 1 + (random(0, 10) * 0.1);
  //   this.filterTimeout = setTimeout(this.fxFilterLoop.bind(this), random(100, 300));
  // }  

  // startFX() {
  //   $body.addClass(classes.bodyEffectActive);

  //   this.fxOpacityLoop();
  //   this.fxTranslateLoop();
  //   this.fxScaleLoop();
  //   this.fxFilterLoop();

  //   this.fxInterval = setInterval(this.setFXProps.bind(this), 20);

  //   this.fxRunning = true;
  // }

  // stopFX() {
  //   clearInterval(this.fxInterval);
  //   clearTimeout(this.opacityTimeout);
  //   clearTimeout(this.translateTimeout);
  //   clearTimeout(this.scaleTimeout);
  //   clearTimeout(this.filterTimeout);

  //   window.cancelAnimationFrame(this.fxAnimFrame);

  //   // Reset fx props
  //   this.fxProps = this.initialFxProps;
  //   this.setFXProps(true);

  //   $body.removeClass(classes.bodyEffectActive);

  //   this.fxRunning = false;
  // }

  startMedia() {
    // const p1 = this.video.play();
    const p2 = this.audio.play();

    // if (p1) {
    //   p1.catch(e => console.log(e)); // eslint-disable-line no-console
    // }

    if (p2) {
      p2.catch(e => console.log(e)); // eslint-disable-line no-console
    }    
  }

  onAudioPlay() {
    // this.audio.currentTime = this.video.currentTime;
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

  // onVideoTimeUpdate() {
  //   const t = this.video.currentTime;
    
  //   if (t >= FX_START_TIME && t < FX_END_TIME && !this.fxRunning) {
  //     this.startFX();
  //   }
  //   else if (t >= FX_END_TIME && this.fxRunning) {
  //     this.stopFX();
  //   }
  // }

  // onUnload() {
  //   this.stopFX();
  // }
}

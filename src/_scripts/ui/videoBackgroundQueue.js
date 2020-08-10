import $ from 'jquery';
import VideoBackground from './videoBackground';

export default class VideoBackgroundQueue {
  constructor(options) {
    const defaults = {
      onVideoPlay: () => {},
      onVideoPause: () => {}
    };

    this.settings = $.extend({}, defaults, options);
    this.videoBackgrounds = [];
    this.index = 0;
    this.started = false;
  }

  start() {
    if (this.videoBackgrounds.length === 0) {
      return;
    }

    if (this.videoBackgrounds.length === 1) {
      this.currentVideoBackground.setLoop(true);
    }
    else {
      // Attach "ended" event to trigger video loop
      for (let i = this.videoBackgrounds.length - 1; i >= 0; i--) {
        this.videoBackgrounds[i].$video.on('ended', this.onVideoBackgroundEnded.bind(this));
      }
    }

    // Attach these events to notify the parent component
    for (let i = this.videoBackgrounds.length - 1; i >= 0; i--) {
      this.videoBackgrounds[i].$video.on('play',  this.settings.onVideoPlay);
      this.videoBackgrounds[i].$video.on('pause', this.settings.onVideoPause);
    }

    this.currentVideoBackground.show();
    this.started = true;
  }

  register(vb) {
    if (!(vb instanceof VideoBackground) || this.started) {
      return;
    }

    this.videoBackgrounds.push(vb);
  }

  onVideoBackgroundEnded() {
    this.currentVideoBackground.hide();
    this.videoBackgrounds[this.nextIndex].show();
    this.index = this.nextIndex;
  }

  play() {
    this.currentVideoBackground.video.play();
  }

  pause() {
    this.currentVideoBackground.video.pause();
  }

  get currentVideoBackground() {
    return this.videoBackgrounds[this.index];
  }

  get nextIndex() {
    return this.index === (this.videoBackgrounds.length - 1) ? 0 : this.index + 1;
  }
}
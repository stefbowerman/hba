import VideoBackground from './videoBackground';

export default class VideoBackgroundQueue {
  constructor(el) {
    this.videoBackgrounds = [];
    this.index = 0;
    this.started = false;
  }

  start() {
    if (this.videoBackgrounds.length === 0) {
      return;
    }

    if (this.videoBackgrounds.length === 1) {
      this.videoBackgrounds[this.index].setLoop(true);
    }
    else {
      for (let i = this.videoBackgrounds.length - 1; i >= 0; i--) {
        this.videoBackgrounds[i].$video.on('ended', this.onVideoBackgroundEnded.bind(this));
      }
    }

    this.videoBackgrounds[this.index].show();
    this.started = true;
  }

  register(vb) {
    if (!(vb instanceof VideoBackground) || this.started) {
      return;
    }

    this.videoBackgrounds.push(vb);
  }

  onVideoBackgroundEnded() {
    this.videoBackgrounds[this.index].hide();
    this.videoBackgrounds[this.nextIndex].show();

    this.index = this.nextIndex;
  }

  get nextIndex() {
    return this.index === (this.videoBackgrounds.length - 1) ? 0 : this.index + 1;
  }
}
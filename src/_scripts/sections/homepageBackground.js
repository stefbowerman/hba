import $ from 'jquery';
import BaseSection from './base';
import VideoBackground from '../ui/videoBackground';
import VideoBackgroundQueue from '../ui/videoBackgroundQueue';

const selectors = {
  homepageBackground: '.homepage-background',
  videoBackground: '[data-video-background]'
};

const classes = {
  visible: 'is-visible'
};

export default class HomepagebackgroundSection extends BaseSection {
  constructor(container) {
    super(container, 'homepage-background');
    this.$el = $(selectors.homepageBackground, this.$container);

    this.videoBackgroundQueue = new VideoBackgroundQueue();

    $(selectors.videoBackground, this.$container).each((i, el) => {
      this.videoBackgroundQueue.register(new VideoBackground(el));
    });
  }

  show() {
    this.videoBackgroundQueue.start();
    this.videoBackgroundQueue.play(); // ?
    this.$el.addClass(classes.visible);
  }

  hide() {
    this.$el.removeClass(classes.visible);
    this.videoBackgroundQueue.pause();
  }
}
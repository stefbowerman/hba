import $ from 'jquery';

export default class AmbientVideo {
  constructor(el) {
    this.video = el;
    this.$video = $(this.video);

    this.$video.one('play', () => this.$video.addClass('is-playing'));

    // in case autoplay didn't work, try to trigger playback after a short delay
    setTimeout(this.play.bind(this), 500);
  }

  play() {
    const p = this.video.play();
    p && p.catch(function (e) { console.log(e); }); // eslint-disable-line
  }
}
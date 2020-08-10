import $ from 'jquery';

export default class VideoBackground {
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
    this.$video.get(0).currentTime = 0;
    
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

  setLoop(loop) {
    this.$video.prop('loop', loop);
  }
}
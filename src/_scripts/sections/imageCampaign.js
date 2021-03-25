import $ from 'jquery';
import Swiper, { EffectFade, Autoplay } from 'swiper';
import { isTouch, clamp } from '../core/utils';
import { getBreakpointMinWidth } from '../core/breakpoints';
import BaseSection from './base';

Swiper.use([EffectFade, Autoplay]);

const classes = {
  campaignReady: 'is-ready'
};

export default class ImageCampaignSection extends BaseSection {
  constructor(container) {
    super(container, 'imageCampaign');

    this.$campaign = $('[data-campaign]', this.$container);
    this.$slideshow = $('[data-slideshow]', this.$container);
    this.$slides = $('.swiper-slide', this.$slideshow);
    this.$prev = $('[data-prev]', this.$container);
    this.$next = $('[data-next]', this.$container);
    
    const startTime = Date.now();
    const minReadyTime = 1000;
    const mobileSettings = window.innerWidth < getBreakpointMinWidth('md');
    const effect = isTouch() && mobileSettings ? 'slide' : 'fade';
    const speed  = 700;
    const loop = this.$slides.length > 1;

    this.swiper = new Swiper(this.$slideshow.get(0), {
      loop: loop,
      speed: speed,
      effect: effect,
      simulateTouch: false,
      watchOverflow: true,
      autoplay: {
        delay: 6000
      }
    });

    this.$slideshow.on('keydown', this.onKeydown.bind(this));
    this.$prev.on('click', () => this.swiper.slidePrev());
    this.$next.on('click', () => this.swiper.slideNext());

    this.$slides.first()
      .imagesLoaded()
      .done(() => {
        const loadTime = Date.now() - startTime;
        const readyDelay = clamp(minReadyTime - loadTime, 0, 9999);         

        setTimeout(() => {
          this.$campaign.addClass(classes.campaignReady);
        }, readyDelay);
      });    
  }

  onKeydown({ which }) {
    if (which === 37) {
      this.swiper.slidePrev();
    }
    else if (which === 39) {
      this.swiper.slideNext();
    }
  }
}

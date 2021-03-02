import $ from 'jquery';
import Swiper, { Navigation, EffectFade } from 'swiper';
import { isTouch, clamp } from '../core/utils';
import { getBreakpointMinWidth } from '../core/breakpoints';
import BaseSection from './base';

Swiper.use([Navigation, EffectFade]);

export default class ImageCampaignSection extends BaseSection {
  constructor(container) {
    super(container, 'imageCampaign');

    this.$campaign = $('[data-campaign]', this.$container);
    this.$slideshow = $('[data-slideshow]', this.$container);
    this.$slides = $('.swiper-slide', this.$slideshow);
    this.$prev = $('[data-prev]', this.$container);
    this.$next = $('[data-next]', this.$container);

    this.initialInteractionTimeout = null;
    
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
      on: {
        slideChangeTransitionStart: this.clearInteractionTimeout.bind(this),
        touchStart: this.clearInteractionTimeout.bind(this),
        touchMove: this.clearInteractionTimeout.bind(this)
      }
    });

    this.$slideshow.on('keydown', this.onKeydown.bind(this));
    this.$prev.on('click', () => this.swiper.slidePrev());
    this.$next.on('click', () => this.swiper.slideNext());

    const startTime = Date.now();

    this.$slides.first()
      .imagesLoaded()
      .done(() => {
        const loadTime = Date.now() - startTime;
        let readyDelay = minReadyTime - loadTime;
        
        readyDelay = clamp(readyDelay, 0, 9999);         

        setTimeout(this.onCampaignReady.bind(this), readyDelay);
      });    
  }

  setInteractionTimeout() {
    this.initialInteractionTimeout = setTimeout(() => this.swiper.slideNext(), 7000);
  }

  clearInteractionTimeout() {
    clearTimeout(this.initialInteractionTimeout);
  }

  onCampaignReady() {
    this.setInteractionTimeout();
    this.$campaign.addClass('is-ready');   
  }

  onKeydown({ which }) {
    if (!this.swiper) return;

    if (which === 37) {
      this.swiper.slidePrev();
    }
    else if (which === 39) {
      this.swiper.slideNext();
    }
  }
}

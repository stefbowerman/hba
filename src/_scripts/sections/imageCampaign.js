import $ from 'jquery';
import Swiper, { Navigation, EffectFade } from 'swiper';
import { isTouch } from '../core/utils';
import { getBreakpointMinWidth } from '../core/breakpoints';
import BaseSection from './base';
import Overlay from '../ui/overlay';

Swiper.use([Navigation, EffectFade]);

export default class ImageCampaignSection extends BaseSection {
  constructor(container) {
    super(container, 'imageCampaign');

    this.$campaign = $('[data-campaign]', this.$container);
    this.$grid = $('[data-grid]', this.$container);
    this.$overlay = $('[data-overlay]', this.$container);
    this.$slideshow = $('[data-slideshow]', this.$container);
    this.$prev = $('[data-prev]', this.$container);
    this.$next = $('[data-next]', this.$container);
    
    const mobileSettings = window.innerWidth < getBreakpointMinWidth('md');
    const effect = isTouch() && mobileSettings ? 'slide' : 'fade';
    const speed  = effect === 'slide' ? 600 : 600;
    const loop = this.$slideshow.find('.swiper-slide').length > 1;

    this.swiper = new Swiper(this.$slideshow.get(0), {
      loop: loop,
      speed: speed,
      effect: effect,
      simulateTouch: false,
      watchOverflow: true,
      navigation: {
        nextEl: this.$next.get(0),
        prevEl: this.$prev.get(0),
      }
    });

    this.$slideshow.on('click', 'img', () => {
      this.swiper.slideNext();
    });

    this.overlay = new Overlay(this.$overlay);

    this.$grid.on('click', 'img[data-index]', this.onGridImageClick.bind(this));

    // If they click the logo while the overlay is open, hide it...
    $('[data-header-logo]').on('click', (e) => {
      if (this.overlay.isOpen()) {
        this.overlay.hide();
        e.preventDefault();
      }
    });

    this.$grid
      .imagesLoaded()
      .done(() => {
        this.$campaign.addClass('grid-ready');
      });
  }

  onGridImageClick(e) {
    const $img = $(e.currentTarget);
    const index = $img.data('index') + 1;

    this.overlay.show();
    this.swiper.slideTo(index, 0, false);
  }
}

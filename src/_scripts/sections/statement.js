import $ from 'jquery';
import { random } from '../core/utils';
import BaseSection from './base';

const selectors = {
  input: '[data-input]',
  output: '[data-output]',
  statementDate: '[data-statement-date]'
};

const $window = $(window);

export default class StatementSection extends BaseSection {
  constructor(container) {
    super(container, 'statement');

    this.timeouts = [];

    this.$input  = $(selectors.input, this.$container); // Hidden statement
    this.$output = $(selectors.output, this.$container); // Where the statment gets output
    this.$statementDate = $(selectors.statementDate, this.$container);

    const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    this.$statementDate.text(formatter.format(new Date()));

    this.$paragraphs = this.$input.find('p').clone().hide();

    this.$output.html(this.$paragraphs);

    $window.on({
      'audioPlay.videoBackground':  this.onVideoBackgroundAudioPlay.bind(this),
      'audioPause.videoBackground': this.onVideoBackgroundAudioPause.bind(this)
    });

    if (window.HBA.videoBackgroundAudioPlaying) {
      this.onVideoBackgroundAudioPlay(); // Set audio state as 'on' since the default is off.  This only happens if someone navigated off the homepage and comes back
    }

    this.timeouts.push(setTimeout(() => {
      this.$paragraphs.each((i, p) => {
        const d = (i * 250) + random(100, 350);
        this.timeouts.push(setTimeout(() => $(p).show(), d));
      });
    }, 1500));    
  }

  onVideoBackgroundAudioPlay() {
    this.$backgroundAudioToggleOn.addClass('is-active');
    this.$backgroundAudioToggleOff.removeClass('is-active');
  }

  onVideoBackgroundAudioPause() {   
    this.$backgroundAudioToggleOn.removeClass('is-active');
    this.$backgroundAudioToggleOff.addClass('is-active');    
  }

  onUnload() {
    $.each(this.timeouts, (i, timeout) => clearTimeout(timeout));
  }
}

import $ from 'jquery';
import { random } from '../core/utils';
import { getBreakpointMinWidth } from '../core/breakpoints';
import BaseSection from './base';
import ContentCard from '../ui/contentCard';

const selectors = {
  input: '[data-input]',
  output: '[data-output]',
  contentCard: '.content-card'
};

export default class Phase3Section extends BaseSection {
  constructor(container) {
    super(container, 'phase-3');

    this.timeouts = [];

    // Content cards
    this.contentCards = $.map($(selectors.contentCard, this.$container), el => new ContentCard(el));

    // Statment vars
    this.$input  = $(selectors.input, this.$container); // Hidden statement
    this.$output = $(selectors.output, this.$container); // Where the statment gets output

    this.$paragraphs = this.$input.find('p').clone().hide();

    this.$output.html(this.$paragraphs);
  }

  display() {
    let paragraphDelay = 0;

    if (this.contentCards.length) {
      // Content cards are side by side - output as "image, image, text + text"
      if (window.innerWidth > getBreakpointMinWidth('md')) {
        $.each(this.contentCards, (i, cc) => {
          this.timeouts.push(setTimeout(() => {
            cc.activate();
            cc.showImage();
          }, (i * 500)));
        });

        this.timeouts.push(setTimeout(() => {
          $.each(this.contentCards, (j, cc) => cc.showCopy());
        }, 1000));

        paragraphDelay = 1300;
      }
      // Content cards are stacked - output as "image, text, image, text"
      else {
        $.each(this.contentCards, (i, cc) => {
          const m = 2*i + 1;
          const d1 = 500 * m; //  500, 1500, 2500
          const d2 = d1 + 500; // 1000, 2000

          cc.activate();
          this.timeouts.push(setTimeout(cc.showImage.bind(cc), d1));
          this.timeouts.push(setTimeout(cc.showCopy.bind(cc), d2));
        });

        paragraphDelay = 2500;
      }
    }

    this.timeouts.push(setTimeout(() => {
      this.$paragraphs.each((i, p) => {
        const d = (i * 250) + random(100, 350);
        this.timeouts.push(setTimeout(() => $(p).show(), d));
      });
    }, paragraphDelay));
  }

  onUnload() {
    $.each(this.timeouts, (i, timeout) => clearTimeout(timeout));
  }
}

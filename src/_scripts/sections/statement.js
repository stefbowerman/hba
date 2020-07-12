import $ from 'jquery';
import Typed from 'typed.js';
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

    this.fileName = 'STATEMENT.exe';
    this.timeouts = [];

    this.$input  = $(selectors.input, this.$container); // Hidden statement
    this.$output = $(selectors.output, this.$container); // Where the statment gets output
    this.$statementDate = $(selectors.statementDate, this.$container);
    this.$backgroundAudioToggleOn = $('[data-toggle-background-audio="true"]', this.$container);
    this.$backgroundAudioToggleOff = $('[data-toggle-background-audio="false"]', this.$container);

    // Steps
    this.steps = {
      connection: {
        $el: $('[data-step="connection"]', this.$container),
        typed: null
      },
      audio: {
        $el: $('[data-step="audio"]', this.$container),
        typed: null
      },
      ip: {
        $el: $('[data-step="ip"]', this.$container),
        typed: null
      },
      search: {
        $el: $('[data-step="search"]', this.$container),
        typed: null
      },
      run: {
        $el: $('[data-step="run"]', this.$container),
        typed: null
      }
    };

    const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    this.$statementDate.text(formatter.format(new Date()));

    this.$paragraphs = this.$input.find('p').clone().hide();

    this.$output.html(this.$paragraphs);

    this.timeouts.push(setTimeout(this.startProgram.bind(this), 1500));

    $window.on({
      'audioPlay.videoBackground':  this.onVideoBackgroundAudioPlay.bind(this),
      'audioPause.videoBackground': this.onVideoBackgroundAudioPause.bind(this)
    });

    if (window.HBA.videoBackgroundAudioPlaying) {
      this.onVideoBackgroundAudioPlay(); // Set audio state as 'on' since the default is off.  This only happens if someone navigated off the homepage and comes back
    }
  }

  startProgram() {
    // Connect
    this.steps.connection.typed = new Typed(this.steps.connection.$el.get(0), {
      strings: ['Connecting... ^850 '],
      typeSpeed: 10,
      showCursor: false,
      onComplete: (self) => {
        self.destroy();
        this.steps.connection.$el.text('Connected');

        // Show Audio Controls
        const t0 = setTimeout(() => {
          this.steps.audio = new Typed(this.steps.audio.$el.get(0), {
            strings: ['Audio'],
            typeSpeed: 30,
            showCursor: false,
            onComplete: () => {
              this.timeouts.push(setTimeout(() => this.$backgroundAudioToggleOff.removeClass('hide'), 150));
              this.timeouts.push(setTimeout(() => this.$backgroundAudioToggleOn.removeClass('hide'), 250));

              // Show IP Address
              const t1 = setTimeout(() => {
                this.steps.ip.typed = new Typed(this.steps.ip.$el.get(0), {
                  strings: ['IP Address <br /> 541.541.5431.23 ^200 '], // @TODO - Generate random IP?
                  typeSpeed: 10,
                  showCursor: false,
                  onComplete: () => {
                    // Do search

                    this.steps.search.typed = new Typed(this.steps.search.$el.get(0), {
                      strings: [`Searching for file<br /> [${this.fileName}].... ^500 `],
                      typeSpeed: 10,
                      showCursor: false,
                      onComplete: () => {
                        // Run File

                        this.steps.run.typed = new Typed(this.steps.run.$el.get(0), {
                          strings: [`File Located<br /> Running [${this.fileName}]`],
                          typeSpeed: 10,
                          showCursor: false,
                          onComplete: () => {
                            // Show statement
                            this.$paragraphs.each((i, p) => {
                              const d = (i * 250) + random(100, 350);
                              this.timeouts.push(setTimeout(() => $(p).show(), d));
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }, 700);

              this.timeouts.push(t1);              
            }
          });
        }, 500);

        this.timeouts.push(t0);
      }
    });
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
    // Kill all typed instances
    $.each(this.steps, (k, step) =>  step.typed && step.typed.destroy());
    $.each(this.timeouts, (i, timeout) => clearTimeout(timeout));
  }
}

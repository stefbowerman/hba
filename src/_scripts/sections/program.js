import $ from 'jquery';
import Typed from 'typed.js';
import { getBreakpointMinWidth } from '../core/breakpoints';
// import { random } from '../core/utils';
import BaseSection from './base';

const $window = $(window);

export default class ProgramSection extends BaseSection {
  constructor(container) {
    super(container, 'program');

    this.file1 = 'SHITSHOW.exe';
    this.file2 = 'CASHAPP.exe';
    this.file3 = 'STATEMENT.exe';
    this.timeouts = [];
    this.booted = false;
    this.isDesktop = window.innerWidth > getBreakpointMinWidth('md');
    this.animationMultiplier = this.isDesktop ? 0.15 : 0.85; // Makes durations *shorter* on desktop

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
        $el: $('[data-step="search-1"]', this.$container),
        typed: null
      },
      run: {
        $el: $('[data-step="run-1"]', this.$container),
        typed: null
      }
    };

    this.desktopSteps = {
      search2: {
        $el: $('[data-step="search-2"]', this.$container),
        typed: null
      },
      run2: {
        $el: $('[data-step="run-2"]', this.$container),
        typed: null
      },
      search3: {
        $el: $('[data-step="search-3"]', this.$container),
        typed: null
      },
      run3: {
        $el: $('[data-step="run-3"]', this.$container),
        typed: null
      }
    };

    this.onVideoBackgroundAudioPlay = this.onVideoBackgroundAudioPlay.bind(this);
    this.onVideoBackgroundAudioPause = this.onVideoBackgroundAudioPause.bind(this);

    $window.on({
      'audioPlay.videoBackground':  this.onVideoBackgroundAudioPlay,
      'audioPause.videoBackground': this.onVideoBackgroundAudioPause
    });

    if (window.HBA.videoBackgroundAudioPlaying) {
      this.onVideoBackgroundAudioPlay(); // Set audio state as 'on' since the default is off.  This only happens if someone navigated off the homepage and comes back
    }
  }

  boot() {
    const d = $.Deferred();

    if (this.booted) {
      d.resolve();
      return d;
    }

    this.booted = true;

    // If desktop, durationMultiplier = 0.75 - run everything faster

    this.defaultBootSequence()
      .then(() => {
        if (this.isDesktop) {
          this.desktopBootSequence().then(() => d.resolve());
        }
        else {
          d.resolve();
        }
      });

    return d;
  }

  defaultBootSequence() {
    const d = $.Deferred();

    // Connect
    this.steps.connection.typed = new Typed(this.steps.connection.$el.get(0), {
      strings: [`Connecting... ^${850}`],
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
                      strings: [`Searching for file<br /> [${this.file1}].... ^${500 * this.animationMultiplier} `],
                      typeSpeed: 10,
                      showCursor: false,
                      onComplete: () => {
                        // Run File

                        this.steps.run.typed = new Typed(this.steps.run.$el.get(0), {
                          strings: [`File Located<br /> Running [${this.file1}]`],
                          typeSpeed: 10,
                          showCursor: false,
                          onComplete: () => {
                            d.resolve();
                          }
                        });
                      }
                    });
                  }
                });
              }, (700 * this.animationMultiplier));

              this.timeouts.push(t1);              
            }
          });
        }, (500 * this.animationMultiplier));

        this.timeouts.push(t0);
      }
    });    

    return d;
  }

  desktopBootSequence() {
    const d = $.Deferred();

    this.desktopSteps.search2.typed = new Typed(this.desktopSteps.search2.$el.get(0), {
      strings: [`Searching for file<br /> [${this.file2}].... ^${500 * this.animationMultiplier}`],
      typeSpeed: 10,
      showCursor: false,
      onComplete: () => {
        // Run File

        this.desktopSteps.run2.typed = new Typed(this.desktopSteps.run2.$el.get(0), {
          strings: [`File Located<br /> Running [${this.file2}]`],
          typeSpeed: 10,
          showCursor: false,
          onComplete: () => {
            // 
            this.desktopSteps.search3.typed = new Typed(this.desktopSteps.search3.$el.get(0), {
              strings: [`Searching for file<br /> [${this.file3}].... ^${500 * this.animationMultiplier}`],
              typeSpeed: 10,
              showCursor: false,
              onComplete: () => {
                // Run File

                this.desktopSteps.run3.typed = new Typed(this.desktopSteps.run3.$el.get(0), {
                  strings: [`File Located<br /> Running [${this.file3}]`],
                  typeSpeed: 10,
                  showCursor: false,
                  onComplete: () => {
                    d.resolve();
                  }
                });
              }
            });  
          }
        });
      }
    });    

    return d;
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
    $.each(this.desktopSteps, (k, step) =>  step.typed && step.typed.destroy());
    $.each(this.timeouts, (i, timeout) => clearTimeout(timeout));

    $window.off({
      'audioPlay.videoBackground':  this.onVideoBackgroundAudioPlay,
      'audioPause.videoBackground': this.onVideoBackgroundAudioPause
    });    
  }  
}

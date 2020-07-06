import $ from 'jquery';
import Typed from 'typed.js';
import { random } from '../core/utils';
import BaseSection from './base';

const selectors = {
  input: '[data-input]',
  output: '[data-output]',
  audioControl: '[data-audio-control]'
};

const $window = $(window);

export default class StatementSection extends BaseSection {
  constructor(container) {
    super(container, 'statement');

    this.fileName = 'STATEMENT.exe';
    this.timeouts = [];
    this.audioControlTyped = null;
    this.videoBackgroundAudioFlag = false;
    this.audioControlInitialized = false;
    this.connectionFlag = false; // Bool to keep track if the "connected" text has been output yet, we don't want to show the audio control before that happens

    this.$input  = $(selectors.input, this.$container); // Hidden statement
    this.$output = $(selectors.output, this.$container); // Where the statment gets output
    this.$paragraphs = this.$input.find('p').clone().hide();
    this.$audioControl = $(selectors.audioControl, this.$container);

    // Steps
    this.steps = {
      connection: {
        $el: $('[data-step="connection"]', this.$container),
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

    this.$output.html(this.$paragraphs);

    this.timeouts.push(setTimeout(this.startProgram.bind(this), 1500));

    $window.on({
      'audioPlay.videoBackground':  this.onVideoBackgroundAudioPlay.bind(this),
      'audioPause.videoBackground': this.onVideoBackgroundAudioPause.bind(this)
    });
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
        this.connectionFlag = true;

        // If the audio is already playing, then we can initialize the control for it
        if (window.HBA.videoBackgroundAudioPlaying) {
          this.onVideoBackgroundAudioPlay();
        }

        // Show IP Address
        const t0 = setTimeout(() => {
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
        }, 500);

        this.timeouts.push(t0);
      }
    });
  }

  onVideoBackgroundAudioPlay() {
    if (!this.connectionFlag) return;

    this.audioControlTyped && this.audioControlTyped.destroy();
    this.audioControlTyped = new Typed(this.$audioControl.get(0), {
      strings: ['Pause'],
      typeSpeed: 20,
      showCursor: false
    });    
  }

  onVideoBackgroundAudioPause() {
    if (!this.connectionFlag) return;
    
    this.audioControlTyped && this.audioControlTyped.destroy();
    this.audioControlTyped = new Typed(this.$audioControl.get(0), {
      strings: ['Play'],
      typeSpeed: 20,
      showCursor: false
    });
  }

  onUnload() {
    // Kill all typed instances
    $.each(this.steps, (k, step) =>  step.typed && step.typed.destroy());
    $.each(this.timeouts, (i, timeout) => clearTimeout(timeout));
  }
}

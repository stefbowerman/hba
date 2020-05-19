import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  program: '[data-program]'
};

export default class PasswordSection extends BaseSection {
  constructor(container) {
    super(container, 'password');

    // get IP address

    this.interval = null;
    this.chunks = [];

    this.$program = $(selectors.program, this.$container);

    setTimeout(this.startProgram.bind(this), 1e3);
  }

  startProgram() {
    this.interval = setInterval(() => {
      this.addChunk();

      if (this.chunks.length === 80) {
        this.terminateProgram();
      }
    }, 50);
  }

  terminateProgram() {
    clearInterval(this.interval);
    document.body.classList.add('system-crash');
    this.$program.html('notify me');
  }

  addChunk() {
    const rand = this.chunks.length % 3 === 0;
    const chunk = `1=-1.5075${rand ? '0E+0 ' : '70E -1  '}`.repeat(6);

    this.$program.append(chunk);
    this.chunks.push(chunk);
  }
}

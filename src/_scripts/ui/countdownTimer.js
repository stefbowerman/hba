import $ from 'jquery';
import { pad } from '../core/utils';

export default class CountdownTimer {
  constructor(el) {
    this.$el = $(el);
    
    this.interval = null;
    this.endTime = this.$el.data('countdown');

    if (this.$el.length && this.getRemainingTime(this.endTime).total > 0) {
      this.startClock();
    }
  }

  tick() {
    const t = this.getRemainingTime(this.endTime);
    const time = [t.days, t.hours, t.minutes, t.seconds].map(n => pad(n, 2, 0)).join(':');
    
    this.$el.text(time);

    if (t.total <= 0) {
      this.stopClock();
    }
  } 

  startClock() {
    this.tick();
    this.interval = setInterval(this.tick.bind(this), 1e3);
  }

  stopClock() {
    clearInterval(this.interval);
  }

  getRemainingTime(endTime) {
    const t = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor((t/1000) % 60);
    const minutes = Math.floor((t/1000/60) % 60);
    const hours = Math.floor((t/(1000*60*60)) % 24);
    const days = Math.floor(t/(1000*60*60*24));

    return {
      total: t,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
  } 
}

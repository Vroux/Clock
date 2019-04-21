import { Clock } from "./Clock";

export class ClockTime {

  clock: Clock;

  secondes = 0;
  minutes = 0;
  hours = 0;
  timeStamp = 0;
  timer = 0;

  constructor(clock : Clock) {
    this.clock = clock;
    this.timeStamp = this.getBrowserTime();
    this.syncWithBrowserClock();
    this.startTimer();
  }
    /**
   * Get the browser timestamp in seconds
   */
  getBrowserTime()
  {
    let browserTime = new Date();
    return Math.round(browserTime.getTime() / 1000);
  }
    /**
   * Sync clock with internet browser
   */
  syncWithBrowserClock() {
    let browserTime = new Date();
    this.secondes = browserTime.getSeconds();
    this.minutes = browserTime.getMinutes();
    this.hours = browserTime.getHours();
  }
    /**
   * Start internal timer
   */
  startTimer() {
    this.timer = window.setTimeout(() => {
      this.next();
    }, 400);
  }
  /**
   * Stop internal timer
   */
  stopTimer() {
    window.clearTimeout(this.timer);
  }
   /**
   * next time
   */
  next() {      
    let browserTime = this.getBrowserTime();
    if (this.timeStamp >= browserTime) {
      this.startTimer();
      return;
    }
    this.timeStamp = browserTime;
    this.secondes += 1;
    if (this.secondes > 59) {
      this.secondes = 0;
      this.minutes += 1;
    }
    if (this.minutes > 59) {
      this.minutes = 0;
      this.hours += 1;
    }
    if (this.hours > 23) {
      this.hours = 0;
    }
    this.clock.clockDom.setNumClock(this.hours, this.minutes, this.secondes);
    this.clock.clockDom.setMinuteHand(this.hours, this.minutes, this.secondes);
    this.startTimer();
  }
}
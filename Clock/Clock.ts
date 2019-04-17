import { ClockMaths } from './ClockMaths';

export class Clock extends HTMLElement {

  shadowRoot!: ShadowRoot;
  secondes = 0;
  minutes = 0;
  hours = 0;
  timeStamp = 0;
  timer = 0;

  numClockElement: HTMLElement;
  secondeHandElement: SVGPathElement;
  minuteHandElement: SVGPathElement;
  hourHandElement: SVGPathElement;
  clockElement: HTMLElement;
  nextHandElement: SVGPathElement;

  selectedElement: Element;

  /**
   * Init HTMLElement and Clock properties
   */
  constructor() {
    super();
    this.init();
    this.numClockElement = this.shadowRoot.querySelector('#num_clock') as HTMLElement;
    this.secondeHandElement = this.shadowRoot.querySelector('#seconde_hand') as SVGPathElement;
    this.minuteHandElement = this.shadowRoot.querySelector('#minute_hand') as SVGPathElement;
    this.hourHandElement = this.shadowRoot.querySelector('#hour_hand') as SVGPathElement;
    this.clockElement = this.shadowRoot.querySelector('#clock') as HTMLElement;
    this.selectedElement = this.clockElement;
    this.nextHandElement = this.shadowRoot.querySelector('#next_hand') as SVGPathElement;
    this.generateSelectionEvent();
  }

  /**
   * Init internal DOM and properties
   */
  init() {
    this.syncWithBrowserClock();
    this.generateDom();
    this.timeStamp = this.getBrowserTime();
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
      this.setNumClock();
      this.setMinuteHand();
      this.startTimer();
  }
  /**
   * Define digital clock
   */
  setNumClock() {
    if (this.numClockElement == null) {return;}
    this.numClockElement.innerHTML = `${(this.hours.toString().padStart(2, '0'))}:${this.minutes.toString().padStart(2, '0')}:${this.secondes.toString().padStart(2, '0')}`;
  }
  /**
   * Define hands positions
   */
  setMinuteHand() {
    let degSec = Math.round(this.secondes * 360 / 60);
    this.secondeHandElement.setAttribute('transform', `rotate(${degSec}, 100, 100)`);
    if (this.secondes > 0) {
      this.refreshMinutes();
      this.refreshHours();
    }
  }

  /**
   * refresh hand Hours
   */
  refreshMinutes() {
    let degMin = Math.round(this.minutes * 360 / 60);
    this.minuteHandElement.setAttribute('transform', `rotate(${degMin}, 100, 100)`);
  }

  /**
   * refresh hand Hours
   */
  refreshHours() {
    let degHour = Math.round(this.hours * 360 / 12);
    this.hourHandElement.setAttribute('transform', `rotate(${degHour}, 100, 100)`);
  }

  /**
   * Generate HTML/SVG 
   */
  generateDom() {
    let html = `
      <slot></slot>
      <style>
        .handSelected {
          stroke: gray;
        }
      </style>
      <div id="num_clock">${this.hours}:${this.minutes}:${this.secondes}</div>
      <svg width="200" height="200" viewBox="0 0 200 200" id="clock">
        <circle r="96" cx="100" cy="100" stroke="black"  stroke-width="4" fill="beige" />
        <path id="next_hand" d="M 100 100 l 0 -60" stroke="transparent" stroke-width="6" transform="rotate(0, 100, 100)" />
        <path id="seconde_hand" data-selectable="yes" d="M 100 100 l 0 -90" stroke="black" stroke-width="2" transform="rotate(0, 100, 100)" />
        <path id="minute_hand" data-selectable="yes" d="M 100 100 l 0 -90" stroke="black" stroke-width="4" transform="rotate(0, 100, 100)" />
        <path id="hour_hand" data-selectable="yes" d="M 100 100 l 0 -60" stroke="black" stroke-width="6" transform="rotate(0, 100, 100)" />
        <circle r="4" cx="100" cy="100" stroke="black"  stroke-width="4" fill="beige" />
      </svg>
    `;
    this.attachShadow({ mode: 'open' });
    let myShadow = (this.shadowRoot as ShadowRoot);
    myShadow.innerHTML = html;
  }
  /**
   * Generate click event on hands
   */
  generateSelectionEvent() {

    // Select clock element under the cursor
    this.addMouseClockLeaveEvent();
    this.clockElement.addEventListener('mousedown', event => {
      const target = event.target as SVGElement;
      if (target.id == '') {return;}
      if (target.dataset.selectable != 'yes') {return;}
      this.selectedElement = target;
      target.classList.add('handSelected');
      this.activateNexthand();
      this.addMouseMoveEvent();
    });

    this.clockElement.addEventListener('mouseup', event => {
      const target = event.target as HTMLElement;

      let {posX, posY} = this.getCursorPosition(event);

      if (this.selectedElement.id === this.hourHandElement.id) {
        this.hours = ClockMaths.hoursFromPosition(posX, posY);
        this.refreshHours();
      }
      if (this.selectedElement.id === this.minuteHandElement.id) {
        this.minutes = ClockMaths.minuteFromPosition(posX, posY);
        this.refreshMinutes();
      }
      if (this.selectedElement.id === this.secondeHandElement.id) {
        this.secondes = ClockMaths.minuteFromPosition(posX, posY);
        this.refreshMinutes();
      }
      this.unSelectHands();
      this.desactivateNexthand();
      this.removeMouseMoveEvent();
    });
  }

  getCursorPosition(event: MouseEvent) {
    var viewportOffset = this.clockElement.getBoundingClientRect();
    let posX = event.pageX - Math.round(viewportOffset.left - window.scrollX);
    let posY = event.pageY - Math.round(viewportOffset.top + window.scrollY);
    return {posX, posY};
  }

  /**
   * Remove the selection when the cursor leaves the clock
   */
  addMouseClockLeaveEvent() {
    this.clockElement.addEventListener('mouseleave', () => {
      this.unSelectHands();
      this.desactivateNexthand();
      this.removeMouseMoveEvent();
    });
  }

  addMouseMoveEvent() {
    this.clockElement.addEventListener('mousemove', event => {
      if (this.selectedElement == this.clockElement) {return;}
      let {posX, posY} = this.getCursorPosition(event);
      let deg = ClockMaths.computeAngle(posX, posY);
      this.nextHandElement.setAttribute('transform', `rotate(${deg}, 100, 100)`);
    });
  }
  removeMouseMoveEvent() {
    this.clockElement.removeEventListener('mousemove', event => {});
  }

  activateNexthand() {
    this.nextHandElement.style.stroke = 'darkblue';
    let d = this.selectedElement.getAttribute('d') || '';
    this.nextHandElement.setAttribute('d', d);
    let strokeWidth = this.selectedElement.getAttribute('stroke-width') || '';
    this.nextHandElement.setAttribute('stroke-width', strokeWidth);
  }
  desactivateNexthand() {
    this.nextHandElement.style.stroke = 'transparent';
  }
  /**
   * Unselect clockhand
   */
  unSelectHands() {
    this.selectedElement = this.clockElement;
    this.secondeHandElement.classList.remove("handSelected");
    this.minuteHandElement.classList.remove("handSelected");
    this.hourHandElement.classList.remove("handSelected");
  }
}

import { ClockMaths } from './ClockMaths';
import { ClockTime } from './ClockTime';

export class Clock extends HTMLElement {

  shadowRoot!: ShadowRoot;

  numClockElement: HTMLElement;
  secondeHandElement: SVGPathElement;
  minuteHandElement: SVGPathElement;
  hourHandElement: SVGPathElement;
  clockElement: HTMLElement;
  nextHandElement: SVGPathElement;

  selectedElement: Element;

  clockTime: ClockTime;

  /**
   * Init HTMLElement and Clock properties
   */
  constructor() {
    super();

    this.clockTime = new ClockTime(this);

    this.generateDom();
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
   * Define digital clock
   */
  setNumClock(hours = 0, minutes = 0, secondes = 0) {
    if (this.numClockElement == null) {return;}
    this.numClockElement.innerHTML = `${(hours.toString().padStart(2, '0'))}:${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`;
  }
  /**
   * Define hands positions
   */
  setMinuteHand(hours = 0, minutes = 0, secondes = 0) {
    let degSec = Math.round(secondes * 360 / 60);
    this.secondeHandElement.setAttribute('transform', `rotate(${degSec}, 100, 100)`);
    if (secondes > 0) {
      this.refreshMinutes(minutes);
      this.refreshHours(hours);
    }
  }

  /**
   * refresh hand Hours
   */
  refreshMinutes(minutes = 0) {
    let degMin = Math.round(minutes * 360 / 60);
    this.minuteHandElement.setAttribute('transform', `rotate(${degMin}, 100, 100)`);
  }

  /**
   * refresh hand Hours
   */
  refreshHours(hours = 0) {
    let degHour = Math.round(hours * 360 / 12);
    this.hourHandElement.setAttribute('transform', `rotate(${degHour}, 100, 100)`);
  }

  /**
   * Generate HTML/SVG 
   */
  generateDom(hours = 0, minutes = 0, secondes = 0) {
    let html = `
      <slot></slot>
      <style>
        .handSelected {
          stroke: gray;
        }
      </style>
      <div id="num_clock">${hours}:${minutes}:${secondes}</div>
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
        
        this.clockTime.hours = ClockMaths.hoursFromPosition(posX, posY);
        this.refreshHours(this.clockTime.hours);
      }
      if (this.selectedElement.id === this.minuteHandElement.id) {
        this.clockTime.minutes = ClockMaths.minuteFromPosition(posX, posY);
        this.refreshMinutes(this.clockTime.minutes);
      }
      if (this.selectedElement.id === this.secondeHandElement.id) {
        this.clockTime.secondes = ClockMaths.minuteFromPosition(posX, posY);
        this.refreshMinutes(this.clockTime.secondes);
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

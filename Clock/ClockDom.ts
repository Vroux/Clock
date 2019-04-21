import { Clock } from "./Clock";

export class ClockDom {
  content = '';
  clock : Clock;

  numClockElement: HTMLElement;
  secondeHandElement: SVGPathElement;
  minuteHandElement: SVGPathElement;
  hourHandElement: SVGPathElement;
  clockElement: HTMLElement;
  nextHandElement: SVGPathElement;

  selectedElement: Element;

  constructor(clock: Clock) {
    this.clock = clock;
    this.generateContent();
    this.numClockElement = this.clock.shadowRoot.querySelector('#num_clock') as HTMLElement;
    this.secondeHandElement = this.clock.shadowRoot.querySelector('#seconde_hand') as SVGPathElement;
    this.minuteHandElement = this.clock.shadowRoot.querySelector('#minute_hand') as SVGPathElement;
    this.hourHandElement = this.clock.shadowRoot.querySelector('#hour_hand') as SVGPathElement;
    this.clockElement = this.clock.shadowRoot.querySelector('#clock') as HTMLElement;
    this.selectedElement = this.clockElement;
    this.nextHandElement = this.clock.shadowRoot.querySelector('#next_hand') as SVGPathElement;
  }

  generateContent(hours = 0, minutes = 0, secondes = 0) {
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
    this.clock.attachShadow({ mode: 'open' });
    let myShadow = (this.clock.shadowRoot as ShadowRoot);
    myShadow.innerHTML = html;
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
}
import { ClockMaths } from './ClockMaths';
import { ClockTime } from './ClockTime';
import { ClockDom } from './ClockDom';

export class Clock extends HTMLElement {

  shadowRoot!: ShadowRoot;

  clockDom: ClockDom;
  clockTime: ClockTime;

  /**
   * Init HTMLElement and Clock properties
   */
  constructor() {
    super();

    this.clockTime = new ClockTime(this);
    this.clockDom = new ClockDom(this);

    this.addMouseClockLeaveEvent();
    this.addMouseDownEvent();
    this.addMouseUpEvent();
  }

  getCursorPosition(event: MouseEvent) {
    var viewportOffset = this.clockDom.clockElement.getBoundingClientRect();
    let posX = event.pageX - Math.round(viewportOffset.left - window.scrollX);
    let posY = event.pageY - Math.round(viewportOffset.top + window.scrollY);
    return {posX, posY};
  }

  addMouseDownEvent() {
    this.clockDom.clockElement.addEventListener('mousedown', event => {
      const target = event.target as SVGElement;
      if (target.id == '') {return;}
      if (target.dataset.selectable != 'yes') {return;}
      this.clockDom.selectedElement = target;
      target.classList.add('handSelected');
      this.activateNexthand();
      this.addMouseMoveEvent();
    });
  }

  addMouseUpEvent() {
    this.clockDom.clockElement.addEventListener('mouseup', event => {
      const target = event.target as HTMLElement;

      let {posX, posY} = this.getCursorPosition(event);

      if (this.clockDom.selectedElement.id === this.clockDom.hourHandElement.id) {
        
        this.clockTime.hours = ClockMaths.hoursFromPosition(posX, posY);
        this.clockDom.refreshHours(this.clockTime.hours);
      }
      if (this.clockDom.selectedElement.id === this.clockDom.minuteHandElement.id) {
        this.clockTime.minutes = ClockMaths.minuteFromPosition(posX, posY);
        this.clockDom.refreshMinutes(this.clockTime.minutes);
      }
      if (this.clockDom.selectedElement.id === this.clockDom.secondeHandElement.id) {
        this.clockTime.secondes = ClockMaths.minuteFromPosition(posX, posY);
        this.clockDom.refreshMinutes(this.clockTime.secondes);
      }
      this.unSelectHands();
      this.desactivateNexthand();
      this.removeMouseMoveEvent();
    });
  }

  /**
   * Remove the selection when the cursor leaves the clock
   */
  addMouseClockLeaveEvent() {
    this.clockDom.clockElement.addEventListener('mouseleave', () => {
      this.unSelectHands();
      this.desactivateNexthand();
      this.removeMouseMoveEvent();
    });
  }

  addMouseMoveEvent() {
    this.clockDom.clockElement.addEventListener('mousemove', event => {
      if (this.clockDom.selectedElement == this.clockDom.clockElement) {return;}
      let {posX, posY} = this.getCursorPosition(event);
      let deg = ClockMaths.computeAngle(posX, posY);
      this.clockDom.nextHandElement.setAttribute('transform', `rotate(${deg}, 100, 100)`);
    });
  }
  removeMouseMoveEvent() {
    this.clockDom.clockElement.removeEventListener('mousemove', event => {});
  }

  activateNexthand() {
    this.clockDom.nextHandElement.style.stroke = 'darkblue';
    let d = this.clockDom.selectedElement.getAttribute('d') || '';
    this.clockDom.nextHandElement.setAttribute('d', d);
    let strokeWidth = this.clockDom.selectedElement.getAttribute('stroke-width') || '';
    this.clockDom.nextHandElement.setAttribute('stroke-width', strokeWidth);
  }
  desactivateNexthand() {
    this.clockDom.nextHandElement.style.stroke = 'transparent';
  }
  /**
   * Unselect clockhand
   */
  unSelectHands() {
    this.clockDom.selectedElement = this.clockDom.clockElement;
    this.clockDom.secondeHandElement.classList.remove("handSelected");
    this.clockDom.minuteHandElement.classList.remove("handSelected");
    this.clockDom.hourHandElement.classList.remove("handSelected");
  }
}

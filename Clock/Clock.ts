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
    this.generateSelectionEvent();
  }

  /**
   * Init internal DOM and properties
   */
  init() {
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

    let htmlClockBase = `
        <circle r="96" cx="100" cy="100" stroke="black"  stroke-width="4" fill="beige" />
        <circle r="4" cx="100" cy="100" stroke="black"  stroke-width="4" fill="beige" />    
    `;
    let htmlSecondeHand = `
        <path id="seconde_hand" d="M 100 100 l 0 -90" stroke="black" stroke-width="2" transform="rotate(0, 100, 100)" />
    `;
    let htmlMinuteHand = `
        <path id="minute_hand" d="M 100 100 l 0 -90" stroke="black" stroke-width="4" transform="rotate(0, 100, 100)" />
    `;
    let htmlHourHand = `
        <path id="hour_hand" d="M 100 100 l 0 -60" stroke="black" stroke-width="6" transform="rotate(0, 100, 100)" />
    `;

    let html = `
      <slot></slot>
      <style>
        .handSelected {
          stroke: gray;
        }
      </style>
      <div id="num_clock">${this.hours}:${this.minutes}:${this.secondes}</div>
      <svg width="200" height="200" viewBox="0 0 200 200" id="clock">${htmlClockBase+htmlSecondeHand+htmlMinuteHand+htmlHourHand}</svg>
    `;
    this.attachShadow({ mode: 'open' });
    let myShadow = (this.shadowRoot as ShadowRoot);
    myShadow.innerHTML = html;
    // let slot = myShadow.querySelector('slot') as HTMLElement;
    // console.log('HTML slot: '+slot.innerHTML);
  }
  /**
   * Generate click event on hands
   */
  generateSelectionEvent() {

    // Select clock element under the cursor
    this.addMouseClockLeaveEvent();
    this.clockElement.addEventListener('mousedown', event => {
      const target = event.target as SVGElement;
      if (target.id != '') {
        this.selectedElement = target;
        target.classList.add('handSelected');
      }
      //console.log('ID: '+target.id);
    });

    this.clockElement.addEventListener('mouseup', event => {
      const target = event.target as HTMLElement;
      
      var viewportOffset = this.clockElement.getBoundingClientRect();

      let posX = event.pageX - Math.round(viewportOffset.left - window.scrollX);
      let posY = event.pageY - Math.round(viewportOffset.top + window.scrollY);
      
      if (this.selectedElement.id === this.hourHandElement.id) {
        this.hours = this.hoursFromPosition(posX, posY);
        this.refreshHours();
      }
      if (this.selectedElement.id === this.minuteHandElement.id) {
        this.minutes = this.minuteFromPosition(posX, posY);
        this.refreshMinutes();
      }
      if (this.selectedElement.id === this.secondeHandElement.id) {
        this.secondes = this.minuteFromPosition(posX, posY);
        this.refreshMinutes();
      }
      this.unSelectHands();
    });
  }

    /**
   * hours From Position
   * @param posX 
   * @param posY 
   */
  minuteFromPosition(posX = 0, posY = 0) {
    return this.minuteFromAngle(this.computeAngle(posX, posY));
  }

  /**
   * hours from angle
   * @param degrees 
   */
  minuteFromAngle(degrees = 0) {
    return Math.round(degrees*60/360);
  }

  /**
   * hours From Position
   * @param posX 
   * @param posY 
   */
  hoursFromPosition(posX = 0, posY = 0) {
    return this.hoursFromAngle(this.computeAngle(posX, posY));
  }

  /**
   * hours from angle
   * @param degrees 
   */
  hoursFromAngle(degrees = 0) {
    return Math.round(degrees*12/360);
  }

  /**
   * Calculation of an angle as a function of a point and origin (100,100)
   * 
   * @param posX : posX
   * @param posY : posY
   */
  computeAngle(posX = 0, posY = 0) {
    if ((posX >= 100) && (posY < 100)) { // upper right corner
      return this.angleFromSides(posX - 100, 100 - posY);
    }
    if ((posX >= 100) && (posY >= 100)) { // bottom right corner
      return this.angleFromSides(posY - 100, posX - 100) + 90;
    }
    if ((posX < 100) && (posY >= 100)) { // bottom left corner
      return this.angleFromSides(posX - 100, 100 - posY) + 180;
    }
    if ((posX < 100) && (posY < 100)) { // upper left corner
      return this.angleFromSides(posY - 100, posX - 100) + 270;
    }
    return 0;
  }
  /**
   * Return angle in degrees from opposideSideLength and adjacentSideLength
   * 
   * @param opposideSideLength 
   * @param adjacentSideLength 
   */
  angleFromSides(opposideSideLength = 0, adjacentSideLength = 0) {
    return Math.round(this.radiansToDegrees(Math.atan(opposideSideLength/adjacentSideLength)));
  }

  /**
   * radians to degrees
   * @param radians 
   */
  radiansToDegrees(radians = 0)
  {
  var pi = Math.PI;
  return radians * (180/pi);
  }
  /**
   * 
   */
  addMouseClockLeaveEvent() {
    // TODO : Ajouter cet element uniquement dans mousedown
    this.clockElement.addEventListener('mouseleave', () => {
      this.unSelectHands();
    });
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

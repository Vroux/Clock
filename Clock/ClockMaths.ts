export class ClockMaths {
  
  /**
   * hours From Position
   * @param posX 
   * @param posY 
   */
  static minuteFromPosition(posX = 0, posY = 0) {
    return this.minuteFromAngle(this.computeAngle(posX, posY));
  }

  /**
   * hours from angle
   * @param degrees 
   */
  static minuteFromAngle(degrees = 0) {
    return Math.round(degrees*60/360);
  }

  /**
   * hours From Position
   * @param posX 
   * @param posY 
   */
  static hoursFromPosition(posX = 0, posY = 0) {
    return this.hoursFromAngle(this.computeAngle(posX, posY));
  }

  /**
   * hours from angle
   * @param degrees 
   */
  static hoursFromAngle(degrees = 0) {
    return Math.round(degrees*12/360);
  }

  /**
   * Calculation of an angle as a function of a point and origin (100,100)
   * 
   * @param posX : posX
   * @param posY : posY
   */
  static computeAngle(posX = 0, posY = 0) {
    if ((posX >= 100) && (posY < 100)) { // upper right corner
      return this.angleFromSides(posX - 100, 100 - posY);
    }
    if ((posX >= 100) && (posY >= 100)) { // bottom right corner
      return this.angleFromSides(posY - 100, posX - 100) + 90;
    }
    if ((posX < 100) && (posY > 100)) { // bottom left corner
      return this.angleFromSides(posX - 100, 100 - posY) + 180;
    }
    if ((posX < 100) && (posY <= 100)) { // upper left corner
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
  static angleFromSides(opposideSideLength = 0, adjacentSideLength = 0) {
    return Math.round(this.radiansToDegrees(Math.atan(opposideSideLength/adjacentSideLength)));
  }

  /**
   * radians to degrees
   * @param radians 
   */
  static radiansToDegrees(radians = 0)
  {
    var pi = Math.PI;
    return radians * (180/pi);
  }
}
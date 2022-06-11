/* Transition
simple animation library.
*/
'use strict';

var defer = require("@kentaromiura/maybe-later");

class Transition {

  constructor(duration, equation, callback) {
    if (!duration) throw new Error('no duration given');
    if (!equation) throw new Error('no equation given');
    if (!callback) throw new Error('no callback given');

    this.duration = duration;
    this.equation = equation;
    this.callback = callback;
    this.elapsed = null;
    this._onComplete = () => {};
    this.step = this.step.bind(this)
    
  }

  get paused() {
    return this.cancel == null && this.elapsed != null;
  }

  get active() {
    return this.cancel != null;
  }

  get idle() {
    return this.cancel == null && this.elapsed == null;
  }

  start() {
    if (this.idle) {
      this.cancel = defer.frame(this.step);
    }
    return this;
  }

  step(time, isSingleStep = false) {
    if (this.elapsed === null) this.elapsed = 0;
    this.elapsed += time - (this.time === undefined ? time: this.time);
    
    var factor = this.elapsed / this.duration;
    if (factor > 1) factor = 1;

    if (factor !== 1) { // keep calling step
      this.time = time;
      if (!isSingleStep) this.cancel = defer.frame(this.step);
    } else { // end of the animation
      this.cancel = this.time = this.elapsed = null;
    }

    var delta = this.equation(factor);
    this.callback(delta);
    if(factor == 1) { 
      this._onComplete();
    }
  }

  stop() {
    if (this.active) {
      this.cancel();
      this.elapsed = this.cancel = this.time = null;
    }
    return this;
  }

  pause() {
    if (this.active) {
      this.cancel();
      this.cancel = this.time = null;
    }
    return this;
  }

  resume() {
    if (this.paused) {
      this.cancel = defer.frame(this.step);
    }
    return this;
  }

  onComplete(callback) {
      this._onComplete = callback;
  }
};

module.exports = Transition;
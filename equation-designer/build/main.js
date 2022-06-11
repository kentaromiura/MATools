(function (modules, global) {
    var cache = {}, require = function (id) {
            var module = cache[id];
            if (!module) {
                module = cache[id] = {};
                var exports = module.exports = {};
                modules[id].call(exports, require, module, exports, global);
            }
            return module.exports;
        };
    require('0');
}({
    '0': function (require, module, exports, global) {
        'use strict';
        var COLORS = {
            BOX: 'silver',
            BEZIER: 'silver',
            BACKGROUND: {
                COLOR: 'whitesmoke',
                TEXT: 'black'
            },
            POINTS: 'gray',
            GRID: 'rgba(80,80,80,0.1)',
            CONTROL: {
                NORMAL: 'rgba(180,210,180,1)',
                ACTIVE: 'gainsboro',
                LINES: 'rgba(180,210,180,0.8)'
            }
        };
        var ready = f => {
            window.addEventListener('DOMContentLoaded', f);
        };
        var get = function (one, two, three, four, t) {
            var v = 1 - t, b1 = t * t * t, b2 = 3 * t * t * v, b3 = 3 * t * v * v, b4 = v * v * v;
            return four * b1 + three * b2 + two * b3 + one * b4;
        };
        var clamp = function (n, min, max) {
            if (n < min)
                return min;
            if (n > max)
                return max;
            return n;
        };
        var bezier = function (vectors, epsilon) {
            if (vectors.length % 3 !== 1)
                throw new Error('invalid input');
            for (var i = 0; i < vectors.length - 1; i += 3) {
                var c0 = vectors[i], c1 = vectors[i + 1], c2 = vectors[i + 2], c3 = vectors[i + 3];
                if (i === 0)
                    c0.x = 0;
                else
                    c0.x = clamp(c0.x, 0, 1);
                if (i === vectors.length - 4)
                    c3.x = 1;
                else
                    c3.x = clamp(c3.x, c0.x, 1);
                c1.x = clamp(c1.x, c0.x, c3.x);
                c2.x = clamp(c2.x, c0.x, c3.x);
            }
            return function (x) {
                var c0, c1, c2, c3;
                for (var i = 0; i < vectors.length - 1; i += 3) {
                    c0 = vectors[i];
                    c1 = vectors[i + 1];
                    c2 = vectors[i + 2];
                    c3 = vectors[i + 3];
                    if (x >= c0.x && x <= c3.x)
                        break;
                }
                var lower = 0, upper = 1, t = x, xt;
                if (x < lower)
                    return get(c0.y, c1.y, c2.y, c3.y, lower);
                if (x > upper)
                    return get(c0.y, c1.y, c2.y, c3.y, upper);
                while (lower < upper) {
                    xt = get(c0.x, c1.x, c2.x, c3.x, t);
                    if (Math.abs(xt - x) < epsilon)
                        return get(c0.y, c1.y, c2.y, c3.y, t);
                    if (x > xt)
                        lower = t;
                    else
                        upper = t;
                    t = (upper - lower) * 0.5 + lower;
                }
                return get(c0.y, c1.y, c2.y, c3.y, t);
            };
        };
        var Transition = require('1');
        var width = 900;
        var height = 900;
        var boxLeft = 100, boxTop = 300;
        var boxWidth = 600, boxHeight = 300;
        var convertVectorsToPixels = function (vectors) {
            return vectors.map(function (v) {
                return {
                    x: boxLeft + v.x * boxWidth,
                    y: boxTop + (-v.y + 1) * boxHeight
                };
            });
        };
        var convertVectorsToPercentages = function (vectors) {
            return vectors.map(function (v) {
                return {
                    x: (v.x - boxLeft) / boxWidth,
                    y: -((v.y - boxTop) / boxHeight) + 1
                };
            });
        };
        var pixelVectors = convertVectorsToPixels([
            {
                x: 0,
                y: 0
            },
            {
                x: 0,
                y: 1
            },
            {
                x: 0.5,
                y: 1
            },
            {
                x: 0.5,
                y: 0
            },
            {
                x: 0.5,
                y: 1
            },
            {
                x: 1,
                y: 1
            },
            {
                x: 1,
                y: 0
            }
        ]);
        var lerp = function (from, to, delta) {
            return (to - from) * delta + from;
        };
        var equation;
        var simplify = function (n, places) {
            return Number(n).toFixed(places).replace(/\.?0+$/, '');
        };
        var render = function (ctx) {
            var vectors = convertVectorsToPercentages(pixelVectors);
            equation = bezier(vectors, 0.0001);
            pixelVectors = convertVectorsToPixels(vectors);
            var i, c0, c1, c2, c3;
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = COLORS.BOX;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(boxLeft, boxTop, boxWidth, boxHeight);
            ctx.closePath();
            ctx.stroke();
            ctx.strokeStyle = COLORS.BEZIER;
            c0 = pixelVectors[0];
            ctx.beginPath();
            ctx.moveTo(c0.x, c0.y);
            for (i = 1; i < pixelVectors.length - 1; i += 3) {
                c1 = pixelVectors[i];
                c2 = pixelVectors[i + 1];
                c3 = pixelVectors[i + 2];
                ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, c3.x, c3.y);
            }
            ctx.stroke();
            ctx.strokeStyle = COLORS.CONTROL.LINES;
            for (i = 0; i < pixelVectors.length - 1; i += 3) {
                c0 = pixelVectors[i];
                c1 = pixelVectors[i + 1];
                c2 = pixelVectors[i + 2];
                c3 = pixelVectors[i + 3];
                ctx.beginPath();
                ctx.moveTo(c0.x, c0.y);
                ctx.lineTo(c1.x, c1.y);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(c3.x, c3.y);
                ctx.lineTo(c2.x, c2.y);
                ctx.closePath();
                ctx.stroke();
            }
            for (i = 0; i < pixelVectors.length; i++) {
                ctx.fillStyle = activePoint === i ? COLORS.CONTROL.ACTIVE : COLORS.CONTROL.NORMAL;
                var p = pixelVectors[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            document.querySelector('#curve').textContent = 'cubicBezier([' + vectors.map(function (p) {
                return '{ x: ' + simplify(p.x, 2) + ', y: ' + simplify(p.y, 2) + '}';
            }).join(', ') + '], 0.0001)';
            var res = 40;
            var points = [];
            for (i = 0; i < res; i++) {
                var pct = i / (res - 1);
                var x = boxLeft + pct * boxWidth;
                var line = [
                    {
                        x: x,
                        y: boxTop + boxHeight
                    },
                    {
                        x: x,
                        y: boxTop
                    }
                ];
                ctx.strokeStyle = COLORS.GRID;
                ctx.beginPath();
                ctx.moveTo(line[0].x, line[0].y);
                ctx.lineTo(line[1].x, line[1].y);
                ctx.closePath();
                ctx.stroke();
                var y = boxTop + (-equation(pct) + 1) * boxHeight;
                points.push({
                    x: x,
                    y: y
                });
            }
            ctx.fillStyle = COLORS.POINTS;
            points.forEach(function (p) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            });
        };
        var activePoint;
        var contained = function (p, box) {
            return p.x >= box.left && p.x <= box.right && p.y >= box.top && p.y <= box.bottom;
        };
        var findCurvePoint = function (p) {
            var found;
            for (var i = 0; i < pixelVectors.length; i++) {
                var cp = pixelVectors[i];
                var box = {
                    left: cp.x - 10,
                    right: cp.x + 10,
                    top: cp.y - 10,
                    bottom: cp.y + 10
                };
                if (contained(p, box)) {
                    found = i;
                    break;
                }
            }
            activePoint = found;
        };
        ready(function () {
            var bgstyle = document.documentElement.style;
            bgstyle.backgroundColor = COLORS.BACKGROUND.COLOR;
            bgstyle.color = COLORS.BACKGROUND.TEXT;
            var canvas = document.querySelector('#curves');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');
            render(ctx);
            document.addEventListener('mousedown', function (event) {
                findCurvePoint({
                    x: event.pageX,
                    y: event.pageY
                });
                if (activePoint != null)
                    render(ctx);
            }, false);
            document.addEventListener('mouseup', function () {
                if (activePoint != null) {
                    activePoint = null;
                    render(ctx);
                }
            }, false);
            document.addEventListener('mousemove', function (event) {
                if (activePoint == null)
                    return;
                pixelVectors[activePoint] = {
                    x: event.pageX,
                    y: event.pageY
                };
                event.preventDefault();
                render(ctx);
            }, false);
            document.querySelector('#add').addEventListener('click', function () {
                var vectors = convertVectorsToPercentages(pixelVectors);
                var segments = (vectors.length - 1) / 3 + 1;
                var ratio = 1 - 1 / segments;
                for (var i = 0; i < vectors.length; i++) {
                    var c = vectors[i];
                    c.x *= ratio;
                }
                vectors.push({
                    x: ratio,
                    y: 1
                }, {
                    x: 1,
                    y: 1
                }, {
                    x: 1,
                    y: 0
                });
                pixelVectors = convertVectorsToPixels(vectors);
                render(ctx);
            }, false);
            var sprite = document.querySelector('#sprite');
            document.querySelector('#fade-in').addEventListener('click', function () {
                var start = 0, end = 1;
                var transition = new Transition(3000, equation, function (delta) {
                    sprite.style.opacity = lerp(start, end, delta);
                });
                transition.start();
            }, false);
            document.querySelector('#fade-out').addEventListener('click', function () {
                var start = 1, end = 0;
                var transition = new Transition(3000, equation, function (delta) {
                    sprite.style.opacity = lerp(start, end, delta);
                });
                transition.start();
            }, false);
            document.querySelector('#rise').addEventListener('click', function () {
                var start = 800, end = 100;
                sprite.style.opacity = 1;
                var transition = new Transition(3000, equation, function (delta) {
                    sprite.style.top = lerp(start, end, delta) + 'px';
                });
                transition.start();
            }, false);
            document.querySelector('#fall').addEventListener('click', function () {
                var start = 100, end = 800;
                sprite.style.opacity = 1;
                var transition = new Transition(3000, equation, function (delta) {
                    sprite.style.top = lerp(start, end, delta) + 'px';
                });
                transition.start();
            }, false);
        });
    },
    '1': function (require, module, exports, global) {
        'use strict';
        var defer = require('2');
        class Transition {
            constructor(duration, equation, callback) {
                if (!duration)
                    throw new Error('no duration given');
                if (!equation)
                    throw new Error('no equation given');
                if (!callback)
                    throw new Error('no callback given');
                this.duration = duration;
                this.equation = equation;
                this.callback = callback;
                this.elapsed = null;
                this._onComplete = () => {
                };
                this.step = this.step.bind(this);
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
                if (this.elapsed === null)
                    this.elapsed = 0;
                this.elapsed += time - (this.time === undefined ? time : this.time);
                var factor = this.elapsed / this.duration;
                if (factor > 1)
                    factor = 1;
                if (factor !== 1) {
                    this.time = time;
                    if (!isSingleStep)
                        this.cancel = defer.frame(this.step);
                } else {
                    this.cancel = this.time = this.elapsed = null;
                }
                var delta = this.equation(factor);
                this.callback(delta);
                if (factor == 1) {
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
        }
        ;
        module.exports = Transition;
    },
    '2': function (require, module, exports, global) {
        'use strict';
        const CALLBACKS = {
            timeout: Object.create(null),
            frame: Object.create(null),
            immediate: Object.create(null)
        };
        let UID = 0;
        const push = (collection, callback, deferrer) => {
            let exists = null;
            for (exists in collection)
                break;
            const id = exists || UID++;
            if (exists === null) {
                collection[id] = [callback];
                deferrer(() => {
                    const reference = collection[id];
                    delete collection[id];
                    const time = (globalThis.performance || Date).now();
                    for (const i in reference) {
                        reference[i](time);
                    }
                });
            } else {
                collection[id].push(callback);
            }
            return () => {
                delete collection[id];
            };
        };
        const defer = (callback, argument) => typeof argument === 'number' ? defer.timeout(callback, argument) : defer.immediate(callback, argument);
        if (global.setImmediate) {
            defer.immediate = callback => push(CALLBACKS.immediate, callback, global.setImmediate);
        } else {
            defer.immediate = callback => defer.timeout(callback, 0);
        }
        const requestAnimationFrame = global.requestAnimationFrame;
        defer.frame = requestAnimationFrame ? callback => push(CALLBACKS.frame, callback, requestAnimationFrame) : callback => defer.timeout(callback, 1000 / 60);
        let mark;
        defer.timeout = (callback, ms) => {
            if (!mark) {
                mark = defer.immediate(() => {
                    mark = null;
                    CALLBACKS.timeout = Object.create(null);
                });
            }
            const collection = CALLBACKS.timeout[ms] || (CALLBACKS.timeout[ms] = Object.create(null));
            return push(collection, callback, callback => {
                setTimeout(callback, ms);
            });
        };
        defer.wait = (...args) => new Promise(resolve => {
            defer(resolve, ...args);
        });
        const CANCELS = Object.create(null);
        defer.once = (name, ...args) => {
            if (CANCELS[name]) {
                CANCELS[name]();
                delete CANCELS[name];
            }
            return CANCELS[name] = defer(...args);
        };
        module.exports = defer;
    }
}, this));
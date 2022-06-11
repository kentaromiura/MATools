// Transform methods and Interpolation
// Some methods are ported from the Chromium source: transform.cc, transform_opertaion.cc, transform_operations.cc
// http://www.w3.org/TR/css-transforms-1/#interpolation-of-transforms
'use strict';

var Matrix3d = require('@kentaromiura/matrix3d/lib/Matrix3d');
var Vector3 = require('@kentaromiura/matrix3d/lib/Vector3');
var Vector4 = require('@kentaromiura/matrix3d/lib/Vector4');

var operations = require('./operations');

var slice = Array.prototype.slice;

class Transform3d {

  constructor(operations) {
    this.operations = operations || [];
  }

  append(operation) {
    this.operations.push(operation);
    return this;
  }

  isIdentity() {
    var operations = this.operations;
    for (var i = 0; i < operations.length; i++) {
      if (!operations[i].isIdentity()) return false;
    }
    return true;
  }

  // matrix

  matrix3d() {
    return this.append(new operations.Matrix(new Matrix3d(arguments)));
  }

  matrix(a, b, c, d, e, f) {
    return this.matrix3d(a, b, c, d, e, f);
  }

  // translate

  translate3d(x, y, z) {
    return this.append(new operations.Translate(new Vector3(x, y, z)));
  }

  translate(x, y) {
    if (y == null) y = 0;
    return this.translate3d(x, y, 0);
  }

  translateX(x) {
    return this.translate(x, 0);
  }

  translateY(y) {
    return this.translate(0, y);
  }

  translateZ(z) {
    return this.translate3d(0, 0, z);
  }

  // scale

  scale3d(x, y, z) {
    return this.append(new operations.Scale(new Vector3(x, y, z)));
  }

  scale(x, y) {
    if (y == null) y = x;
    return this.scale3d(x, y, 1);
  }

  scaleX(x) {
    return this.scale(x, 1);
  }

  scaleY(y) {
    return this.scale(1, y);
  }

  scaleZ(z) {
    return this.scale3d(1, 1, z);
  }

  // rotate

  rotate3d(x, y, z, angle) {
    return this.append(new operations.Rotate(new Vector4(x, y, z, angle)));
  }

  rotate(angle) {
    return this.rotate3d(0, 0, 1, angle);
  }

  rotateX(angle) {
    return this.rotate3d(1, 0, 0, angle);
  }

  rotateY(angle) {
    return this.rotate3d(0, 1, 0, angle);
  }

  rotateZ(angle) {
    return this.rotate3d(0, 0, 1, angle);
  }

  // skew

  skew(x, y) {
    if (y == null) y = 0;
    return this.append(new operations.Skew([x, y]));
  }

  skewX(x) {
    return this.skew(x, 0);
  }

  skewY(y) {
    return this.skew(0, y);
  }

  // perspective

  perspective(len) {
    return this.append(new operations.Perspective(len));
  }

  // interpolation

  interpolation(transform) {
    return new TransformInterpolation(this, transform);
  }

  // matrix conversion

  compose() {
    var matrix = new Matrix3d;
    var operations = this.operations;
    for (var i = 0; i < operations.length; i++) {
      matrix = matrix.concat(operations[i].compose());
    }
    return matrix;
  }

  // string

  toString() {
    var string = [];
    var operations = this.operations;
    for (var i = 0; i < operations.length; i++) {
      string.push(operations[i].toString());
    }
    return string.join(' ');
  }

}

class TransformInterpolation {

  constructor(from, to) {
    var operations1 = slice.call(from.operations);
    var operations2 = slice.call(to.operations);

    var length1 = operations1.length, length2 = operations2.length;
    var operation1, operation2, i, interpolateTransform = true;

    if (!length1 || from.isIdentity()) {
      operations1 = [];
      for (i = 0; i < length2; i++) operations1.push(new operations[operations2[i].type]);
      length1 = operations1.length;
    } else if (!length2 || to.isIdentity()) {
      operations2 = [];
      for (i = 0; i < length1; i++) operations2.push(new operations[operations1[i].type]);
      length2 = operations2.length;
    } else if (length1 === length2) {

      for (i = 0; i < length1; i++) {
        operation1 = operations1[i];
        operation2 = operations2[i];
        var type1 = operation1.type;
        var type2 = operation2.type;

        if (type1 !== type2) {
          if (operation1.isIdentity()) {
            operations1.splice(i, 1, new operations[type2]);
          } else if (operation2.isIdentity()) {
            operations1.splice(i, 1, new operations[type1]);
          } else {
            interpolateTransform = false;
            break;
          }
        }
      }

    } else {
      interpolateTransform = false;
    }

    if (interpolateTransform) {
      this.from = operations1;
      this.to = operations2;
      this.length = length1;
    } else {
      this.from = [new operations.Matrix(from.compose())];
      this.to = [new operations.Matrix(to.compose())];
      this.length = 1;
    }

  }

  step(delta) {
    if (delta === 0) return new Transform3d(this.from);
    if (delta === 1) return new Transform3d(this.to);

    var interpolated = new Transform3d;

    for (var i = 0; i < this.length; i++) {
      var from = this.from[i];
      var to = this.to[i];
      var operation = from.equals(to) ? from : from.interpolate(to, delta);
      interpolated.append(operation);
    }

    return interpolated;
  }

};

Transform3d.Interpolation = TransformInterpolation;

module.exports = Transform3d;
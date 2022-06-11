var transform3d = require('@kentaromiura/transform3d'),
    transform = require('./transform');

    var properties = [
      'rotate',
      'rotateX',
      'rotateY',
      'rotateZ',
      'perspective',
      'skew',
      'skewX',
      'skewY',
      'translateX',
      'translateY',
      'translateZ',
      'scale',
      'scaleX',
      'scaleY',
      'scaleZ'];

module.exports = function applyTransforms(){
  var
      i,
      max,
      property,
      transformation = new transform3d;

  for(i = 0, max = properties.length; i < max; i++){
    property = properties[i]
    if(this.hasAttribute(property))
      transformation[property](this.getAttribute(property) -0);
  }

  transform(this, transformation.compose());
}

module.exports.properties = properties;
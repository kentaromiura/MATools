module.exports = (function(){
    for(var props = ['transform', 'webkitTransform', 'OTransform', 'msTransform', 'MozTransform'], i=0, max=props.length; i<max; i++){
      var prop = props[i]
      if(prop in document.documentElement.style){
        return function(element, transformation){
            var slot = element.shadowRoot.children[1];
            slot.style.display = 'inline-block'
            slot.style[prop] = transformation
        }
      }
    }
  })();
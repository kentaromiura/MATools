const applyTransform = require('./applyTransforms');
class Transform3d extends HTMLElement {
    constructor(){
        super();
        const shadow = this.attachShadow({mode: 'open'});
        const style = document.createElement('style');
        shadow.appendChild(style);
        shadow.appendChild(document.createElement('slot'));
        shadow.querySelector('style').textContent = `
            transform-3d{display:block;}
        `;
    }

    connectedCallback() {
        applyTransform.call(this);
    }

    attributeChangedCallback(){
        applyTransform.call(this);
    }

    static get observedAttributes() {
        return applyTransform.properties;
    }
}

customElements.define('transform-3d', Transform3d);
module.exports = Transform3d;
    
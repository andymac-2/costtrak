'use strict'

/** @type {function(string, Object=, Element=)} */
Draw.elem = function (elemType, attributes, parentElem) {
    var elem = document.createElement(elemType);
    if (attributes) {
        for (var prop in attributes) {
	    elem.setAttribute(prop, attributes[prop]);
        }
    }
    if (parentElem) {
        parentElem.appendChild(elem);
    }
    return elem;
};

Draw.elemNS = function (NS, elemType, attributes, parentElem) {
    var elem = document.createElementNS(NS, elemType);
    if (attributes) {
        for (var prop in attributes) {
	    elem.setAttribute(prop, attributes[prop]);
        }
    }
    if (parentElem) {
        parentElem.appendChild(elem);
    }
    return elem;
};

Draw.svgElem = Draw.elemNS.bind(null, "http://www.w3.org/2000/svg");
Draw.htmlElem = Draw.elemNS.bind(null, "http://www.w3.org/1999/xhtml");

Draw.dateBubble = function (position, text, parent) {
    var dateBubble = Draw.svgElem("g", {
        "class": "dateBubble",
        "transform": "translate(" + position.x + ", " + position.y + ")"
    }, parent);
    
    Draw.svgElem ("ellipse", {
        "cx": "0", "cy": "0", "rx": "15", "ry": "15"
    }, dateBubble);
    
    var foreign = Draw.svgElem ("text", {
        "x": 0, "y": 4,
        "text-anchor": "middle"
    }, dateBubble).textContent = text;
};

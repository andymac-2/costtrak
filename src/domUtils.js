'use strict'

var Draw = {};

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

Draw.dateBubble = function (position, text, menuEntries, parent) {
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

    Draw.menu (menuEntries, dateBubble);
};

Draw.MENUSPACING = "35";
Draw.menu = function (entries, parent) {
    var g = Draw.svgElem ("g", {
        "class": "TMMenu hidden",
        "transform" : "translate(-15, 20)"
    }, parent);

    parent.addEventListener ("click", Draw.activate.bind(null, g));

    var y = 0;
    for (var i = 0; i < entries.length; i++) {
        var entryGroup = Draw.svgElem ("g", {
            "transform": "translate(0, " + y + ")"}, g);

        entryGroup.addEventListener ("click", entries[i].action);
        
        Draw.svgElem ("image", {
            "href": entries[i].icon,
            "height": "32",
            "width": "32"
        }, entryGroup);

        Draw.svgElem ("text", {
            "x": "38",
            "y": "20",
            "text-anchor": "start" 
        }, entryGroup).textContent = entries[i].text;

        y += Draw.MENUSPACING;
    }

    return g;
};
Draw.straightLine = function (start, end, lnClass, parent) {
    var line = Draw.svgElem("g", {
        "class": lnClass
    }, parent);

    Draw.svgElem("line", {
        "x1": end.x,
        "y1": end.y,
        "x2": start.x,
        "y2": start.y
    }, line);

    return line;
};

Draw.doubleAngledLine = function (start, end, hspace, vspace, lnClass, parent){
/* Creates an angled line like so:
             end
           /
     _____/
    /
start  
*/
    var upturn, plateuWidth;
    var y = start.y;
    var x = start.x;
    if (end.y > start.y) {
        var plateuHeight = vspace / 2 + start.y
    }
    else if (end.y < start.y) {
        plateuHeight = 0 - vspace / 2 + start.y;
    }
    else {
        plateuHeight = start.y;
    }
        
    var spacing = end.x > start.x ? hspace : 0 - hspace;
    //upturn = (Math.abs(end.y - start.y) * 2) / this.VERTICALSPACING;
    //upturn = spacing / upturn + start.x;
    upturn = spacing / 2 + start.x;
    plateuWidth = end.x - start.x - spacing;
    
    var group = Draw.svgElem ("g", {
        "class": lnClass
    }, parent);

    Draw.svgElem ("line", {
        "x1": start.x, 
        "y1": start.y, 
        "x2": upturn, 
        "y2": plateuHeight
    }, group)
    
    Draw.svgElem ("line", {
        "x1": upturn, 
        "y1": plateuHeight, 
        "x2": upturn + plateuWidth, 
        "y2": plateuHeight
    }, group);
    
    Draw.svgElem ("line", {
        "x1": upturn + plateuWidth, 
        "y1": plateuHeight, 
        "x2": end.x, 
        "y2": end.y
    }, group);
    
    return group;
};

Draw.deactivate = function (elem) {
    elem.classList.add("hidden");
    elem.classList.remove("active");
};

Draw.activate = function (elem) {
    elem.classList.remove("hidden");
    elem.classList.add("active");
};

'use strict'

var DateBubble = function (trakmap, product) {
    this.product = product;
    this.trakMap = trakmap;
};

DateBubble.prototype.draw = function (parent) {
    if (this.product) {
        var position = this.product.end;
        var text = this.product.getEndValue();
    }
    else {
        position = this.trakMap.origin;
        text = "0";
    }
    
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

    Draw.menu (Draw.ALIGNCENTER, this.trakMap.unclicker, [{
        "icon": "icons/arrow-right.svg",
        "action": () => this.createProduct()
    }], {
        "transform": "translate(0, -40)"
    }, dateBubble);

    return dateBubble;
};

// user events
DateBubble.prototype.createProduct = function () {
    var product = this.trakMap.addProduct({
        "name": "Untitled",
        "comment": "",
        "weight": 7,
        "priority": this.product ? this.product.priority : 0,
        "level": 0
    });
    
    if (this.product) {
        this.trakMap.newDependency (this.product, product);
    }

    this.trakMap.draw();
}

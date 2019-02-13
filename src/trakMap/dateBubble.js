'use strict'

var DateBubble = function (trakmap, product) {
    this.product = product;
    this.trakMap = trakmap;
};

DateBubble.prototype.draw = function (parent) {
    var position = this.getPosition()
    var text = this.getText();
    
    var dateBubble = Draw.svgElem("g", {
        "class": "dateBubble",
        "transform": "translate(" + position.x + ", " + position.y + ")"
    }, parent);
    
    Draw.svgElem ("ellipse", {
        "cx": "0", "cy": "0", "rx": "15", "ry": "15"
    }, dateBubble);
    
    Draw.svgElem ("text", {
        "x": 0, "y": 4,
        "text-anchor": "middle"
    }, dateBubble).textContent = text;

    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        Draw.menu (Draw.ALIGNCENTER, this.trakMap.unclicker, [{
            "icon": "icons/arrow-right.svg",
            "action": () => this.createProductForward()
        }], {
            "transform": "translate(0, -40)"
        }, dateBubble);
    }
    else if (this.trakMap.mode === TrakMap.LAZYMODE) {
        Draw.menu (Draw.ALIGNCENTER, this.trakMap.unclicker, [{
            "icon": "icons/arrow-left.svg",
            "action": () => this.createProductBackward()
        }], {
            "transform": "translate(0, -40)"
        }, dateBubble);
    }
 

    return dateBubble;
};

//queries
DateBubble.prototype.getPosition = function () {
    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return this.product.getEnd();
    }
    else if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return this.product.getStart();
    }
}
DateBubble.prototype.getText = function () {
    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return this.product.getEndValue();
    }
    else if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return this.product.getStartValue();
    }
}

DateBubble.prototype.createProduct = function () {
    return this.trakMap.addProduct({
        "name": Product.DEFAULTNAME,
        "comment": Product.DEFAULTCOMMENT,
        "weight": Product.DEFAULTWEIGHT,
        "priorityGroup": this.product.priorityGroup.index,
        "level": this.product.level
    });
};

// user events
DateBubble.prototype.createProductForward = function () {
    let product = this.createProduct(); 
    this.trakMap.newDependency (this.product, product);
    this.trakMap.draw();
};

DateBubble.prototype.createProductBackward = function () {
    let product = this.createProduct();  
    this.trakMap.newDependency (product, this.product);
    this.trakMap.draw();
};

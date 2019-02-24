'use strict'

/**
 * @constructor
 * @struct
 */
var DateBubble = function (trakmap, product) {
    /** @type {Product} */ this.product = product;
    /** @type {TrakMap} */ this.trakMap = trakmap;
};

DateBubble.BUBBLERADIUS = 18;
DateBubble.prototype.draw = function (parent) {
    var position = this.getPosition();
    
    var dateBubble = Draw.svgElem("g", {
        "class": "dateBubble",
        "transform": "translate(" + position.x + ", " + position.y + ")"
    }, parent);
    
    Draw.svgElem ("circle", {
        "cx": "0", "cy": "0", "r": DateBubble.BUBBLERADIUS,
        "class": "dateBubbleCircle " + this.product.resolveHealthClass()
    }, dateBubble);

    if (this.product.percent !== 0) {
        let cls = "percentArc " + this.product.getLineClass();
        Draw.arcLine (0, 0, DateBubble.BUBBLERADIUS, 
            this.product.getPercentArcAngle(), cls, dateBubble);
    }
    
    this.drawDate (dateBubble, 
        "dateBubbleText " + this.product.resolveHealthClass());

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

    Draw.menu (Draw.ALIGNCENTER, this.trakMap.unclicker, [{
        "icon": "icons/percent.svg",
        "action": () => this.product.incrementPercent()
    }, {
        "icon": "icons/health.svg",
        "action": () => this.product.toggleHealth()
    }], {
        "transform": "translate(0, 40)"
    }, dateBubble);
 
    return dateBubble;
};

/** 
 * @this {DateBubble|Milestone}
 * @param {Element} parent
 * @param {string} cls
 */
DateBubble.prototype.drawDate = function (parent, cls) {
    let date = this.getDate();
    let line1 = Util.getYear(date);
    let line2 = Util.getShortMonth(date) + Util.getDate(date);

    Draw.svgElem ("text", {
        "x": 0,
        "y": -3,
        "text-anchor": "middle",
        "class": cls
    }, parent).textContent = line1;

    Draw.svgElem ("text", {
        "x": 0,
        "y": 7,
        "text-anchor": "middle",
        "class": cls
    }, parent).textContent = line2;
};

//queries
DateBubble.prototype.getPosition = function () {
    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return this.product.getEnd();
    }
    else if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return this.product.getStart();
    }
};
DateBubble.prototype.getValue = function () {
    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return this.product.getEndValue();
    }
    else if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return this.product.getStartValue();
    }
};
/** @this {DateBubble|Milestone} */ 
DateBubble.prototype.getDate = function () {
    return Util.getDateFromDays(this.getValue());
};

DateBubble.prototype.createProduct = function () {
    return this.trakMap.addProduct({
        "name": Product.DEFAULTNAME,
        "comment": Product.DEFAULTCOMMENT,
        "weight": Product.DEFAULTWEIGHT,
        "priorityGroup": this.product.priorityGroup.index,
        "level": this.product.level,
        "health": Product.ONTRACK,
        "percent": 0
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

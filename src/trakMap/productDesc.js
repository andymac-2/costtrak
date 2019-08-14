'use strict'

/** @constructor
    @struct */
var ProductDesc = function (options, title, days, comment, priority) {

    // state
    /** @type {string} */ this.title;
    /** @type {string} */ this.comment;
    /** @type {number} */ this.days;
    /** @type {number} */ this.priorityGroup;

    // view model
    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {function(ProductDesc)} */ this.onChange = options.onChange || (() => { });
    /** @type {Object} */ this.attrs = options.attrs || {};
    this.product = options.product;

    /** @type {boolean} */ this.modified = false;

    this.restore(title, days, comment, priority);
};
ProductDesc.HEIGHT = 35;
ProductDesc.TEXTBOXHEIGHT = 45;
ProductDesc.YOFFSET = 55;
ProductDesc.XOFFSET = 5;
ProductDesc.HEIGHTWIDTHRATIO = 4;
ProductDesc.MAXTEXTLENGTH = 100;
ProductDesc.prototype.restore = function (title, days, comment, priorityGroup) {
    this.title = title;
    this.title = this.title === "" ? "Untitled" : this.title;
    this.days = days;
    this.comment = comment;
    this.comment = this.comment === "" ? "" : this.comment;
    this.priorityGroup = priorityGroup;
};

ProductDesc.prototype.draw = function (parent) {
    return Draw.activeOnClickElem(
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, parent);
};

ProductDesc.prototype.onclick = function (parent) {
    let height = ProductDesc.TEXTBOXHEIGHT;
    parent.innerHTML = "";

    let width = height * ProductDesc.HEIGHTWIDTHRATIO;

    let foreign = Draw.svgElem("foreignObject", {
        "class": "flex-container",
        "width": width,
        "height": (height),
        "x": -(width / 2),
        "y": -25
    }, parent);
    let div = Draw.htmlElem("div", {
        "class": "flex-container",
    }, foreign)

    let titleBox = Draw.htmlElem("input", {
        "class": "productName " + this.product.resolveHealthClass(),
        "value": this.title,
        "type": "text",
        "placeholder": "Product Name"
    }, div);
    titleBox.addEventListener("change", () => this.modifyTitle(titleBox));

    let weightBox = Draw.htmlElem("input", {
        "class": "productWeight",
        "value": this.days,
        "type": "number",
        "required": ""
    }, div);
    weightBox.addEventListener("change", () => this.modifyDays(weightBox));

    foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height),
        "x": -(width / 2),
        "y": 5
    }, parent);
    div = Draw.htmlElem("div", {
        "class": "flex-container",
    }, foreign)

    var commentBox = Draw.htmlElem("input", {
        "class": "productComment comment",
        "value": this.comment,
        "type": "text",
        "placeholder": "Product Comment"
    }, div);
    commentBox.addEventListener("change", () => this.modifyComment(commentBox));

    let priorityGroupBox = this.product.trakMap.drawPriorityGroupSelector(
        pg => this.modifyPriority(pg),
        { "class": "productPriorityGroup" },
        div);
};

ProductDesc.BUBBLERADIUS = 8;
ProductDesc.prototype.onunclick = function (parent) {
    if (this.modified) {
        this.onChange(this);
        this.modified = false;
    }

    parent.innerHTML = "";
    var daystring = " (" + this.days + ")";

    if (this.product.percent > 0) {
        const bubbleYOffset = -38;
        const rectWidth = 150;
        const rectHeight = 10;
        Draw.svgElem("rect", {
            "class": "dateBubbleCircle " + this.product.resolveHealthClass(),
            "x": -rectWidth / 2, "y": bubbleYOffset,
            "width": rectWidth, "height": rectHeight,
        }, parent);
        Draw.svgElem("rect", {
            "class": "percentageRect",
            "x": -rectWidth / 2, "y": bubbleYOffset,
            "width": rectWidth * this.product.percent, "height": rectHeight,
        }, parent);
    }

    var dayTitle = Draw.svgElem("text", {
        "text-anchor": "middle",
        "transform": "translate(0, -10)",
        "class": "productName " + this.product.resolveHealthClass()
    }, parent);
    dayTitle.textContent = Util.truncate(
        this.title + daystring, ProductDesc.MAXTEXTLENGTH);

    var comment = Draw.svgElem("text", {
        "class": "productComment comment",
        "text-anchor": "middle",
        "transform": "translate(0, 15)"
    }, parent);
    comment.textContent = Util.truncate(this.comment, ProductDesc.MAXTEXTLENGTH);
};

// user events
ProductDesc.prototype.modifyTitle = function (elem) {
    this.restore(elem.value, this.days, this.comment, this.priorityGroup);
    this.modified = true;
};

ProductDesc.prototype.modifyComment = function (elem) {
    this.restore(this.title, this.days, elem.value, this.priorityGroup);
    this.modified = true;
};

ProductDesc.prototype.modifyDays = function (elem) {
    this.restore(this.title, elem.value | 0, this.comment, this.priorityGroup);
    this.modified = true;
};

ProductDesc.prototype.modifyPriority = function (pg) {
    this.restore(this.title, this.days, this.comment, pg);
    this.modified = true;
};

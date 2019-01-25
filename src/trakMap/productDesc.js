'use strict'

/** @constructor
    @struct */
var ProductDesc = function (options, title, days, comment, priority) {
    
    // state
    /** @type {string} */ this.title;
    /** @type {string} */ this.comment;
    /** @type {number} */ this.days;
    /** @type {number} */ this.priority;

    // view model
    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {function(ProductDesc)} */ this.onChange = options.onChange || (() => {});
    /** @type {Object} */ this.attrs = options.attrs || {};

    /** @type {boolean} */ this.modified = false;

    this.restore(title, days, comment, priority);
};
ProductDesc.HEIGHT = 35;
ProductDesc.TEXTBOXHEIGHT = 45;
ProductDesc.YOFFSET = 55;
ProductDesc.XOFFSET = 5;
ProductDesc.HEIGHTWIDTHRATIO = 7;
ProductDesc.MAXTEXTLENGTH = 100;
ProductDesc.prototype.restore = function (title, days, comment, priority) {
    this.title = title;
    this.title = this.title === "" ? "Untitled": this.title;
    this.days = days;
    this.comment = comment;
    this.comment = this.comment === "" ? "" : this.comment;
    this.priority = priority;
};

ProductDesc.prototype.draw = function (parent) {
    return Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, parent);
};

ProductDesc.prototype.onclick = function (parent) {
    var height = ProductDesc.TEXTBOXHEIGHT;
    parent.innerHTML = "";
    
    var width = height * ProductDesc.HEIGHTWIDTHRATIO;
    
    var foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height),
        "x": -(width / 2),
        "y": -25
    }, parent);

    var titleBox = Draw.htmlElem ("input", {
        "class": "svgTextBox",
        "value": this.title,
        "type": "text",
        "placeholder": "Product Name"
    }, foreign);
    
    titleBox.addEventListener("change", () => this.modifyTitle(titleBox));

    var dateBox = Draw.htmlElem ("input", {
        "class": "numberBox",
        "value": this.days,
        "type": "number",
        "required": ""
    }, foreign);
    
    dateBox.addEventListener("change", () => this.modifyDays(dateBox));

    foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "hbeight": (height),
        "x": -(width / 2),
        "y": 5
    }, parent);

    var commentBox = Draw.htmlElem ("input", {
        "class": "svgCommentBox",
        "value": this.comment,
        "type": "text",
        "placeholder": "Product Comment"
    }, foreign);

    commentBox.addEventListener("change", () => this.modifyComment(commentBox));

    var priorityBox = Draw.htmlElem ("input", {
        "class": "numberBox",
        "value": this.priority,
        "type": "number",
        "required": ""
    }, foreign);

    priorityBox.addEventListener("change", () => this.modifyPriority(priorityBox));
};

ProductDesc.prototype.onunclick = function (parent) {
    if (this.modified) {
        this.onChange(this);
        this.modified = false;
    }

    parent.innerHTML = "";
    var daystring = " (" + this.days + ")";
    
    var dayTitle = Draw.svgElem ("text", {
        "text-anchor": "middle",
        "transform": "translate(0, -10)",
    }, parent);
    dayTitle.textContent = Util.truncate(
        this.title + daystring, ProductDesc.MAXTEXTLENGTH);

    var comment = Draw.svgElem ("text", {
        "class": "msComment",
        "text-anchor": "middle",
        "transform": "translate(0, 15)"
    }, parent);
    comment.textContent = Util.truncate(this.comment, ProductDesc.MAXTEXTLENGTH);
};

// user events
ProductDesc.prototype.modifyTitle = function (elem) {
    this.restore(elem.value, this.days, this.comment, this.priority);
    this.modified = true;
};

ProductDesc.prototype.modifyComment = function (elem) {
    this.restore(this.title, this.days, elem.value, this.priority);
    this.modified = true;
};

ProductDesc.prototype.modifyDays = function (elem) {
    this.restore(this.title, elem.value, this.comment, this.priority);
    this.modified = true;
};

ProductDesc.prototype.modifyPriority = function (elem) {
    this.restore(this.title, this.days, this.comment, elem.value);
    this.modified = true;
};

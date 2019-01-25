'use strict'

/** @constructor
    @struct */
var PriorityGroupDesc = function (options, title, comment) {
    
    // state
    /** @type {string} */ this.title;
    /** @type {string} */ this.comment;

    // view model
    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {function(PriorityGroupDesc)} */ this.onChange = options.onChange || (() => {});
    /** @type {Object} */ this.attrs = options.attrs || {};

    /** @type {boolean} */ this.modified = false;

    this.restore(title, comment);
};
PriorityGroupDesc.HEIGHT = 35;
PriorityGroupDesc.TEXTBOXHEIGHT = 45;
PriorityGroupDesc.YOFFSET = 55;
PriorityGroupDesc.XOFFSET = 0;
PriorityGroupDesc.HEIGHTWIDTHRATIO = 7;
PriorityGroupDesc.MAXTEXTLENGTH = 100;
PriorityGroupDesc.prototype.restore = function (title, comment) {
    this.title = title;
    this.title = this.title === "" ? "Untitled": this.title;
    this.comment = comment;
    this.comment = this.comment === "" ? "" : this.comment;
};

PriorityGroupDesc.prototype.draw = function (parent) {
    return Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, parent);
};

PriorityGroupDesc.prototype.onclick = function (parent) {
    var height = PriorityGroupDesc.TEXTBOXHEIGHT;
    parent.innerHTML = "";
    
    var width = height * PriorityGroupDesc.HEIGHTWIDTHRATIO;
    
    var foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height),
        "x": 0,
        "y": -25
    }, parent);

    var titleBox = Draw.htmlElem ("input", {
        "class": "svgTextBox",
        "value": this.title,
        "type": "text",
        "placeholder": "Priority Group Name"
    }, foreign);
    
    titleBox.addEventListener("change", () => this.modifyTitle(titleBox));

    foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height),
        "x": 0,
        "y": 5
    }, parent);

    var commentBox = Draw.htmlElem ("input", {
        "class": "svgCommentBox",
        "value": this.comment,
        "type": "text",
        "placeholder": "Priority Group Comment"
    }, foreign);

    commentBox.addEventListener("change", () => this.modifyComment(commentBox));
};

PriorityGroupDesc.prototype.onunclick = function (parent) {
    if (this.modified) {
        this.onChange(this);
        this.modified = false;
    }
    parent.innerHTML = "";
    
    var title = Draw.svgElem ("text", {
        "text-anchor": "start",
        "transform": "translate(0, -10)",
    }, parent);
    title.textContent = Util.truncate(
        this.title, PriorityGroupDesc.MAXTEXTLENGTH);

    var comment = Draw.svgElem ("text", {
        "class": "priorityGroupComment",
        "text-anchor": "start",
        "transform": "translate(0, 15)"
    }, parent);
    comment.textContent = Util.truncate(this.comment, PriorityGroupDesc.MAXTEXTLENGTH);
};

// user events
PriorityGroupDesc.prototype.modifyTitle = function (elem) {
    this.restore(elem.value, this.comment);
    this.modified = true;
};

PriorityGroupDesc.prototype.modifyComment = function (elem) {
    this.restore(this.title, elem.value);
    this.modified = true;
};
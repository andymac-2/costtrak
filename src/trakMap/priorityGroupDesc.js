'use strict'

/** @constructor
    @struct */
var PriorityGroupDesc = function (options, title, comment, priority) {
    
    // state
    /** @type {string} */ this.title;
    /** @type {string} */ this.comment;
    /** @type {number} */ this.priority;

    // view model
    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {function(PriorityGroupDesc)} */ this.onChange = options.onChange || (() => {});
    /** @type {Object} */ this.attrs = options.attrs || {};

    /** @type {boolean} */ this.modified = false;

    this.restore(title, comment, priority);
};
PriorityGroupDesc.HEIGHT = 35;
PriorityGroupDesc.TEXTBOXHEIGHT = 45;
PriorityGroupDesc.YOFFSET = 55;
PriorityGroupDesc.XOFFSET = 0;
PriorityGroupDesc.HEIGHTWIDTHRATIO = 7;
PriorityGroupDesc.MAXTEXTLENGTH = 100;
PriorityGroupDesc.prototype.restore = function (title, comment, priority) {
    this.title = title;
    this.title = this.title === "" ? "Untitled": this.title;
    this.comment = comment;
    this.comment = this.comment === "" ? "" : this.comment;
    this.priority = priority
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

    var priorityBox = Draw.htmlElem ("input", {
        "class": "numberBox",
        "value": this.priority,
        "type": "number",
        "required": ""
    }, foreign);

    priorityBox.addEventListener("change", () => this.modifyPriority(priorityBox));

    foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": (height),
        "x": 0,
        "y": 5
    }, parent);

    var commentBox = Draw.htmlElem ("input", {
        "class": "svgCommentBox comment",
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
        "class": "priorityGroupComment comment",
        "text-anchor": "start",
        "transform": "translate(0, 15)"
    }, parent);
    comment.textContent = Util.truncate(this.comment, PriorityGroupDesc.MAXTEXTLENGTH);
};

// user events
PriorityGroupDesc.prototype.modifyTitle = function (elem) {
    this.restore(elem.value, this.comment, this.priority);
    this.modified = true;
};

PriorityGroupDesc.prototype.modifyComment = function (elem) {
    this.restore(this.title, elem.value, this.priority);
    this.modified = true;
};

PriorityGroupDesc.prototype.modifyPriority = function (elem) {
    this.restore(this.title, this.comment, elem.value);
    this.modified = true;
};


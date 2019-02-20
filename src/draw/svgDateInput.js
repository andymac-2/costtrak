'use strict'

/** @constructor
    @struct */
Draw.svgDateInput = function (options, date) {
    /** @type {number} */ this.date;

    this.alignment = options.alignment;

    switch (this.alignment) {
    case Draw.ALIGNLEFT:
        this.anchor = "start";
        break;
    case Draw.ALIGNRIGHT:
        this.anchor = "end"
        break;
    case Draw.ALIGNCENTER:
        this.anchor = "middle"
        break;
    default:
        assert (() => false);
        break;
    }

    /** @type {Unclicker} */ this.unclicker = options.unclicker;
    /** @type {function(Event, Draw.svgDateInput)} */ this.onchange = options.onchange || (() => {});
    /** @type {Element} */ this.parent = options.parent;
    /** @type {Object<string>} */ this.attrs = options.attrs || {};
    /** @type {?number} */ this.min = options.min || null;
    /** @type {?number} */ this.max = options.max || null;

    /** @type {Element} */ this.elem;

    this.restore (date);
    this.draw();
};
Draw.svgDateInput.HEIGHT = 15;
Draw.svgDateInput.HEIGHTWIDTHRATIO = 7;
Draw.svgDateInput.TEXTTOTEXTBOXRATIO = 1.5;

Draw.svgDateInput.prototype.restore = function (date) {
    this.date = date;
};

Draw.svgDateInput.prototype.draw = function () {
    this.elem = Draw.activeOnClickElem (
        this.onunclick.bind(this), this.onclick.bind(this), this.unclicker,
        this.attrs, this.parent);
};

Draw.svgDateInput.prototype.onclick = function (parent) {
    var height = Draw.svgDateInput.HEIGHT;
    parent.innerHTML = "";

    var width = height * Draw.svgDateInput.HEIGHTWIDTHRATIO;
    let x;
    switch (this.alignment) {
    case Draw.ALIGNLEFT:
        x = 0;
        break;
    case Draw.ALIGNRIGHT:
        x = -width;
        break;
    case Draw.ALIGNCENTER:
        x = (-width) / 2
        break;
    }

    var foreign = Draw.svgElem("foreignObject", {
        "width": width,
        "height": height * Draw.svgDateInput.TEXTTOTEXTBOXRATIO,
        "x": x,
        "y": 0 - height
    }, parent);

    var attrs = {
        "class": "svgDateBox",
        "value": Util.getISODateOnly(Util.getDateFromDays(this.date)),
        "type": "date",
        "required": ""
    };
    if (this.min) {
        attrs["min"] = Util.getISODateOnly(Util.getDateFromDays(this.min));
    }
    if (this.max) {
        attrs["max"] = Util.getISODateOnly(Util.getDateFromDays(this.max));
    }
    
    var dateBox = Draw.htmlElem ("input", attrs, foreign);
    dateBox.addEventListener("blur", this.modifyDate.bind(this, dateBox));
    dateBox.addEventListener("blur", e => this.onchange(e, this));
};

Draw.svgDateInput.prototype.onunclick = (parent) => {
    parent.innerHTML = "";
};

Draw.svgDateInput.prototype.modifyDate = function (elem) {
    this.date = Util.getDaysFromInputElem (elem);
};

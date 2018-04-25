'use strict'

var TableCell = function (obj, properties) {
    this.elem = Draw.elem ("td", properties);

    this.text = "";
    
    this.restore (obj);
};
TableCell.prototype.restore = function (obj) {
    this.text = obj;
    this.draw();
};
TableCell.prototype.save = function () {
    return this.text;
};
TableCell.prototype.draw = function () {
    this.elem.textContent = this.text;
};

TableCell.prototype.update = function () {
    this.state = this.elem.textContent;
};

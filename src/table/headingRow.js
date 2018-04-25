'use strict'

var HeadingRow = function (obj) {
    this.elem = Draw.elem ("tr", {
	"class" : "fixedTableHeadingRow" 
    });

    this.widths = [];
    this.data = [];
    this.cells = [];

    this.restore (obj);
};
HeadingRow.prototype.restore = function (obj) {
    assert (() => this.data.length === this.widths.length);
    this.widths = obj.widths;
    this.data = obj.data;
    this.draw();
};
HeadingRow.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    for (var i = 0; i < this.data.length; i++) {
	var cell = new TableCell (this.data[i], {
	    "class" : "tableHeadingCell",
	    style: "min-width:" + this.widths[i] + ";"
	});
	
	this.cells.push (cell);	
	this.elem.appendChild (cell.elem);
    }
};
HeadingRow.prototype.save = function () {
    // TODO
};

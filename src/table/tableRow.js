'use strict'

var TableRow = function (obj) {
    this.elem = Draw.elem ("tr", {
	"class" : "tableRow" 
    });
    this.data = [];
    this.cells = [];

    this.restore (obj);
};
TableRow.prototype.restore = function (obj) {
    this.data = obj;
    this.draw();
};
TableRow.prototype.draw = function () {
    this.elem.innerHTML = "";
    this.cells = [];
    
    for (var i = 0; i < this.data.length; i++) {
	var cell = new TableCell (this.data[i], {
	    "class": "tableCell",
	    contenteditable: "true"
	});
	
	this.cells.push (cell);
	this.elem.appendChild (cell.elem);
    }
};
TableRow.prototype.save = function () {
    // TODO
};

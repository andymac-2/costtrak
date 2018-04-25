'use strict'

var Table = function (obj) {
    this.elem = Draw.elem ("table", {
	"class": "fixedPaneTableTable"
    });

    this.widths = [];
    this.data = [];
    this.heading = {};
    this.rows = [];
    
    this.restore (obj);
}
Table.prototype.restore = function (obj) {
    this.widths = obj.widths;
    this.data = obj.data;
    this.draw ();
};
Table.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    this.heading = new HeadingRow ({
	widths: this.widths,
	data: this.data[0]
    });

    this.elem.appendChild (this.heading.elem);

    this.rows = [];

    for (var i = 1; i < this.data.length; i++) {
	var row = new TableRow (this.data[i]);
	this.rows.push(row);
	this.elem.appendChild (row.elem);
    }
};
Table.prototype.save = function () {
    // TODO
};

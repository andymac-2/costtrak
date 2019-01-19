'use strict'

// class invariants: the index property is the index of Product within
// the products property of it's parent graph.

var Product = function (graph, index, obj) {
    // graph properties (state)
    this.outgoing = [];
    this.incoming = [];
    this.priority = 0;
    this.value = 0;
    this.visited;

    // user properties (state)
    this.comment = "";
    this.name = "";
    this.level = 0;
    this.weight = 0;
    
    // drawing properties
    this.start = {x: 0, y: 0};
    this.end = {x: 0, y: 0};
    
    this.index = 0;
    this.trakMap = graph;

    this.restore(obj);
};

// static functions
Product.compare = function (a, b) {
    return a.value - b.value;
};
Product.compareEnds = function (a, b) {
    var diff = b.getEndValue() - a.getEndValue();
    if (diff !== 0) {
        return diff;
    }
    // b and a swapped. larger end X's for the same end date are earlier.
    return a.getMinEndX() - b.getMinEndX();
};

Product.DEFAULT = {
    name: "Untitled",
    weight: 7,
    priority: 0,
    level: 0
};

// this is not a reactive or serialisable element, as it does not fit
// easily into a tree hierarchy, instead the reactive atom is the
// parent trakMap object
Product.prototype.restore = function (obj) {
    this.name = obj.name;
    this.comment = obj.comment || "";
    this.weight = obj.weight;
    this.priority = obj.priority;
    this.level = obj.level | 0;

    assert (() => this.priority >= 0);
    assert (() => this.weight > 0);
};


// drawing
Product.prototype.drawLine = function (parent) {
    var line = Draw.svgElem("g", {
        "class": "product"
    }, parent);

    var lineClass = "priorityLine priority-" + this.priority;
    Draw.svgElem("line", {
        "class": lineClass,
        "x1": this.start.x,
        "y1": this.start.y,
        "x2": this.end.x,
        "y2": this.end.y
    }, line);

    var lineCentreX = (this.start.x + this.end.x) / 2

    var description = new ProductDesc ({
        unclicker: this.trakMap.unclicker,
        onChange: (obj) => this.modifyData(obj),
        attrs: {
            "class": "productData",
            "transform": "translate(" + lineCentreX + ", " + this.start.y + ")"
        }
    }, this.name, this.weight, this.comment, this.priority);
    description.draw(line);

    Draw.menu (Draw.ALIGNCENTER, this.trakMap.unclicker, [{
        "icon": "icons/arrow-left.svg",
        "action": () => {}
    },{
        "icon": "icons/delete.svg",
        "action": () => {}
    },{
        "icon": "icons/health.svg",
        "action": () => {}
    },{
        "icon": "icons/arrow-right.svg",
        "action": () => {}
    }], {
        "transform": "translate(" + lineCentreX + ", " + (this.start.y - 45) + ")"
    }, line);

    if (this.incoming.length === 0) {
        Draw.straightLine (this.start, this.trakMap.origin, lineClass,
                           this.trakMap.connections);
    }

    return line;  
};
Product.prototype.drawBubble = function (parent) {
    Draw.dateBubble(this.end, this.getEndValue(), parent);
};


Product.prototype.save = function () {
    return {
	name: this.name,
	weight: this.weight,
	priority: this.priority,
        level: this.level
    };
};
Product.prototype.toJSON = Product.prototype.save;

// query functions
Product.prototype.getStartValue = function () {
    return this.value;
};
Product.prototype.getEndValue = function () {
    return this.value + this.weight;
};
Product.prototype.getWidth = function () {
    return TrakMap.MINPRODUCTWIDTH + (TrakMap.UNITVALUEWIDTH * this.weight);
};
Product.prototype.getMinEndX = function () {
    return this.start.x + this.getWidth();
};
Product.prototype.hasDependencies = function () {
    return this.incoming.length === 0;
};

// modification functions
Product.prototype.removeDependency = function (dep) {
    assert (() => dep instanceof Dependency);
    
    Util.removeFromArray (this.outgoing, dep);
};
Product.prototype.removeDependent = function (dep) {
    assert (() => dep instanceof Dependency);
    
    Util.removeFromArray (this.outgoing, dep);
};

Product.prototype.modifyName = function (e, input) {
    this.name = input.text;
};

// accepts a ProductDesc Object
Product.prototype.modifyData = function (productDesc) {
    this.name = productDesc.title;
    this.weight = Math.max (Math.floor(productDesc.days), 1);
    this.comment = productDesc.comment;
    this.priority = Math.max(0, productDesc.priority);

    this.trakMap.draw();
};

// testing
Product.prototype.checkInvariants = function () {
    assert (() => this.weight > 0);
    assert (() => this.priority >= 0);
    assert (() => this.level >= 0);

    var maxValue = 0;
    this.incoming.forEach(dep => {
        var testValue = dep.dependency.getEndValue();
        if (this.priority <= dep.dependency.priority) {
            maxvalue = testvalue > maxvalue ? testvalue : maxvalue;
        }
        assert (() => dep.dependent === this);
    });
    assert (() => maxvalue === this.value);

    this.outgoing.forEach(dep => {
        assert (() => dep.dependency === this);
    });

    asssert (() => this.trakMap.products[this.index] === this);    
};

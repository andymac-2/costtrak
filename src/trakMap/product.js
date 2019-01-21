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
    this.direction = Product.GOINGUP;
    this.weight = 0;
    
    // drawing properties
    this.start = {x: 0, y: 0};
    this.end = {x: 0, y: 0};
    
    this.index = index;
    this.trakMap = graph;

    this.dateBubble = new DateBubble (this.trakMap, this);

    this.restore(obj);
};
Product.GOINGUP = -1;
Product.GOINGDOWN = 1;

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

    line.addEventListener("click", () => {
        this.trakMap.select (TrakMap.SELNORMAL, this);
    });

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
        "action": () => {
            this.trakMap.select (TrakMap.SELDEPENDENT, this);
        }
    }, {
        "icon": "icons/delete.svg",
        "action": () => this.deleteThis()
    }, {
        "icon": "icons/move-up.svg",
        "action": () => this.moveUp()
    }, {
        "icon": "icons/move-down.svg",
        "action": () => this.moveDown()
    }, {
        "icon": "icons/arrow-right.svg",
        "action": () => {
            this.trakMap.select (TrakMap.SELDEPENDENCY, this);
        }
    }], {
        "transform": "translate(" + lineCentreX + ", " + (this.start.y - 45) + ")"
    }, line);

    if (!this.hasValidDependencies()) {
        Draw.straightLine (this.start, this.trakMap.origin, lineClass,
                           this.trakMap.connections);
    }

    return line;  
};
Product.prototype.drawBubble = function (parent) {
    this.dateBubble.draw(parent);
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
// a dependency is considered valid if it is higher or equal priority
Product.prototype.hasValidDependencies = function () {
    return this.incoming.some(dep => dep.dependency.priority <= this.priority);
};

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
    // we use this instead of Util.removeFromArray because this
    // function is called from this.incoming.forEach. If we use
    // Util.removeFromArray, we modify the array in place, and it
    // becomes screwy. This way, we create a new array, so we don't
    // interfere with the forEach call
    this.incoming = this.incoming.filter(elem => elem !==  dep);
};
Product.prototype.removeDependent = function (dep) {
    assert (() => dep instanceof Dependency);
    // see comment in removeDependency
    this.outgoing = this.outgoing.filter(elem => elem !== dep);
};

Product.prototype.modifyName = function (e, input) {
    this.name = input.text;
};


// user functions.
// accepts a ProductDesc Object
Product.prototype.modifyData = function (productDesc) {
    this.name = productDesc.title;
    this.weight = Math.max (Math.floor(productDesc.days), 1);
    this.comment = productDesc.comment;

    var newPriority = Math.max(0, productDesc.priority);
    if (this.priority !== newPriority) {
        this.priority = newPriority
        this.level = 0;
    }

    this.trakMap.draw();
};

Product.prototype.deleteThis = function () {
    this.trakMap.removeProduct(this);
    this.trakMap.draw();
};

Product.prototype.moveUp = function () {
    this.level += Product.GOINGUP;
    this.direction = Product.GOINGUP;
    this.trakMap.draw();
};
Product.prototype.moveDown = function () {
    this.level += Product.GOINGDOWN;
    this.direction = Product.GOINGDOWN;
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

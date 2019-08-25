'use strict'

// class invariants: the index property is the index of Product within
// the products property of it's parent graph.
/**
 * @constructor
 * @struct
 */
var Product = function (graph, index, obj) {
    // graph properties (state)
    /** @type {Array<Dependency>} */ this.outgoing = [];
    /** @type {Array<Dependency>} */ this.incoming = [];
    /** @type {PriorityGroup} */ this.priorityGroup;
    /** @type {number} */ this.value;
    /** @type {boolean} */ this.visited;

    // user properties (state)
    /** @type {string} */ this.comment = "";
    /** @type {string} */ this.name = "";
    /** @type {number} */ this.level = 0;
    /** @type {number} */ this.direction = Product.GOINGUP;
    /** @type {number} */ this.weight = 0;
    /** @type {number} */ this.percent;
    /** @type {number} */ this.health;

    // drawing properties
    /** @type {Object<string, number>} */ this.start = { x: 0, y: 0 };
    /** @type {Object<string, number>} */ this.end = { x: 0, y: 0 };

    /** @type {number} */ this.index = index;
    /** @type {TrakMap} */ this.trakMap = graph;

    /** @type {DateBubble} */ this.dateBubble = new DateBubble(this.trakMap, this);

    this.restore(obj);
};

Product.GOINGUP = -1;
Product.GOINGDOWN = 1;

Product.DEFAULTWEIGHT = 7;
Product.DEFAULTNAME = "New Product";
Product.DEFAULTCOMMENT = "";

Product.ONTRACK = 1;
Product.ATRISK = 2;
Product.LATE = 3;

Product.DEFAULTPRODUCT = {
    "name": Product.DEFAULTNAME,
    "comment": Product.DEFAULTCOMMENT,
    "weight": Product.DEFAULTWEIGHT,
    "priorityGroup": 0,
    "level": 0,
    "health": Product.ONTRACK,
    "percent": 0
};

// static functions
Product.compare = function (a, b) {
    let diff = a.value - b.value;
    if (diff !== 0) {
        return diff;
    }
    // puts milestones first
    return a.getWidth() - b.getWidth();
};
Product.compareReverse = function (a, b) {
    let diff = b.getEndValue() - a.getEndValue();
    if (diff !== 0) {
        return diff;
    }
    // puts milestones first
    return a.getWidth() - b.getWidth();
};
Product.compareEnds = function (a, b) {
    var diff = b.getEndValue() - a.getEndValue();
    if (diff !== 0) {
        return diff;
    }
    // b and a swapped. larger end X's for the same end date are earlier.
    return a.getMinEndX() - b.getMinEndX();
};

Product.prototype.restore = function (obj) {
    this.name = obj["name"].toString();
    this.comment = obj["comment"].toString() || "";
    this.level = obj["level"] || 0;
    if (typeof this.level !== "number") {
        throw new FileValidationError("Product \"" + this.name +
            "\" has an invalid level. Level must be a number");
    }

    this.weight = obj["weight"] || 7;
    if (typeof this.weight !== "number") {
        throw new FileValidationError("Product \"" + this.name +
            "\" has an invalid weight. Weight must be a number");
    }
    if (this.weight < 1) {
        throw new FileValidationError("Product \"" + this.name +
            "\" has an invalid weight. Weight must be positive");
    }

    this.health = obj["health"] || Product.ONTRACK;
    if (this.health !== Product.ATRISK && this.health !== Product.LATE) {
        this.health = Product.ONTRACK;
    }

    this.percent = obj["percent"] || 0;
    if (typeof this.percent !== "number") {
        throw new FileValidationError("Product \"" + this.name +
            "\" has an invalid progress. Progress must be a number");
    }
    this.percent = Math.max(0, this.percent);
    this.percent = Math.min(1, this.percent);

    this.priorityGroup = this.trakMap.priorityGroups[obj["priorityGroup"]];
    if (!this.priorityGroup) {
        throw new FileValidationError("Product \"" + this.name +
            "\" has an invalid product group index.");
    }
    this.priorityGroup.addProduct(this);
};
Product.prototype.save = function () {
    return {
        "name": this.name,
        "comment": this.comment,
        "level": this.level,
        "weight": this.weight,
        "health": this.health,
        "percent": this.percent,
        "priorityGroup": this.priorityGroup.index
    };
};
Product.prototype.toJSON = Product.prototype.save;


// drawing
Product.prototype.drawLine = function (parent) {
    var line = Draw.svgElem("g", {
        "class": "product"
    }, parent);

    line.addEventListener("click", () => {
        this.trakMap.select(TrakMap.SELNORMAL, this);
    });

    let start = this.getStart();
    let end = this.getEnd();

    Draw.svgElem("line", {
        "class": this.getLineClass(),
        "x1": start.x,
        "y1": start.y,
        "x2": end.x,
        "y2": end.y
    }, line);

    var lineCentreX = (start.x + end.x) / 2

    var description = new ProductDesc({
        unclicker: this.trakMap.unclicker,
        onChange: (obj) => this.modifyData(obj),
        attrs: {
            "class": "productData",
            "transform": "translate(" + lineCentreX + ", " + start.y + ")"
        },
        product: this
    }, this.name, this.weight, this.comment, this.priorityGroup);
    description.draw(line);

    Draw.menu(Draw.ALIGNCENTER, this.trakMap.unclicker, [{
        "icon": "icons/arrow-left.svg",
        "action": () => this.trakMap.select(TrakMap.SELDEPENDENT, this)
    }, {
        "icon": "icons/delete.svg",
        "action": () => this.trakMap.deleteProduct(this)
    }, {
        "icon": "icons/percent.svg",
        "action": () => this.incrementPercent()
    }, {
        "icon": "icons/health.svg",
        "action": () => this.toggleHealth()
    }, {
        "icon": "icons/move-up.svg",
        "action": () => this.moveUp()
    }, {
        "icon": "icons/move-down.svg",
        "action": () => this.moveDown()
    }, {
        "icon": "icons/arrow-right.svg",
        "action": () => this.trakMap.select(TrakMap.SELDEPENDENCY, this)
    }], {
            "transform": "translate(" + lineCentreX + ", " + (start.y - 45) + ")"
        }, line);

    return line;
};
Product.prototype.drawBubble = function (parent) {
    this.dateBubble.draw(parent);
};

// query functions
// a dependency is considered valid if it is higher or equal priority
Product.prototype.hasValidDependencies = function () {
    return this.incoming.some(
        dep => dep.dependency.getPriority() <= this.getPriority());
};
Product.prototype.hasValidDependents = function () {
    return this.outgoing.some(
        dep => dep.dependent.getPriority() <= this.getPriority());
};
Product.prototype.getPriority = function () {
    return this.priorityGroup.priority;
};
Product.prototype.getStartValue = function () {
    return this.value;
};
Product.prototype.getEndValue = function () {
    return this.value + this.weight;
};
Product.prototype.getStart = function () {
    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return {
            x: this.start.x + TrakMap.HSPACE,
            y: this.start.y
        };
    }
    else if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return this.start;
    }
};
Product.prototype.getEnd = function () {
    if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return {
            x: this.end.x - TrakMap.HSPACE,
            y: this.end.y
        }
    }
    else if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return this.end;
    }
};
Product.prototype.getWidth = function () {
    return TrakMap.MINPRODUCTWIDTH +
        this.trakMap.getMinSeparation(0, this.weight);
};
Product.prototype.getMinEndX = function () {
    return this.start.x + this.getWidth();
};
Product.prototype.hasDependencies = function () {
    return this.incoming.length === 0;
};
Product.prototype.resolveHealthClass = function () {
    if (this.percent === 1) {
        return "complete"
    }
    switch (this.health) {
        case Product.ONTRACK:
            return "on-track";
        case Product.ATRISK:
            return "at-risk";
        case Product.LATE:
            return "late";
    }
    assert(() => false);
};
Product.prototype.getPercentArcAngle = function () {
    return this.percent * Math.PI * 2;
};
Product.prototype.getLineClass = function () {
    if (this.percent === 1) {
        return "priorityLine complete";
    }
    return "priorityLine priority-" + this.getPriority();
};

// modification functions
Product.prototype.resolveYCoord = function () {
    let offset = this.priorityGroup.yOffset;
    let value = this.level * TrakMap.VSPACE;
    this.start.y = this.end.y = value + offset;
};
Product.prototype.setEndX = function (x) {
    this.end.x = x;
};
Product.prototype.setStartX = function (x) {
    this.start.x = x;
};
// remove dependency and remove dependent used also by Milestone class.
/**
 * @this {Product|Milestone}
 * @param {Dependency} dep
 */
Product.prototype.removeDependency = function (dep) {
    assert(() => dep instanceof Dependency);
    Util.removeFromArray(this.incoming, dep);
};
/**
 * @this {Product|Milestone}
 * @param {Dependency} dep
 */
Product.prototype.addDependency = function (dep) {
    assert(() => dep.dependent === this)
    this.incoming.push(dep);
};
/**
 * @this {Product|Milestone}
 * @param {Dependency} dep
 */
Product.prototype.removeDependent = function (dep) {
    assert(() => dep instanceof Dependency);
    Util.removeFromArray(this.outgoing, dep);
};
/**
 * @this {Product|Milestone}
 * @param {Dependency} dep
 */
Product.prototype.addDependent = function (dep) {
    assert(() => dep.dependency === this);
    this.outgoing.push(dep);
};

Product.prototype.modifyName = function (e, input) {
    this.name = input.text;
};
/**
 * @this {Product|Milestone}
 * @param {number} dir
 */
Product.prototype.setDirection = function (dir) {
    assert(() => dir === Product.GOINGUP || dir === Product.GOINGDOWN);
    this.direction = dir;
};

Product.prototype.modifyPriorityGroup = function (pg) {
    if (pg === this.priorityGroup) {
        return;
    }

    this.priorityGroup.removeProduct(this);
    this.priorityGroup = pg;
    this.priorityGroup.addProduct(this);
};

Product.prototype.deleteThis = function () {
    assert(() => this.trakMap.products.indexOf(this) === -1);

    this.incoming.slice().forEach(
        dep => this.trakMap.deleteDependencyUnsafe(dep));
    this.outgoing.slice().forEach(
        dep => this.trakMap.deleteDependencyUnsafe(dep));

    assert(() => this.incoming.length === 0);
    assert(() => this.outgoing.length === 0);

    this.priorityGroup.removeProduct(this);
};
// user functions.
// accepts a ProductDesc Object
Product.prototype.modifyData = function (productDesc) {
    this.name = productDesc.title;
    this.weight = Math.max(Math.floor(productDesc.days), 1);
    this.comment = productDesc.comment;

    this.trakMap.makeSafeModification(
        () => this.modifyPriorityGroup(productDesc.priorityGroup));
};
/**
 * @this {Product|Milestone}
 */
Product.prototype.moveUp = function () {
    this.level += Product.GOINGUP;
    this.trakMap.setAllDirections(Product.GOINGDOWN);
    this.setDirection(Product.GOINGUP);
    this.trakMap.draw();
};
/**
 * @this {Product|Milestone}
 */
Product.prototype.moveDown = function () {
    this.level += Product.GOINGDOWN;
    this.trakMap.setAllDirections(Product.GOINGUP);
    this.setDirection(Product.GOINGDOWN);
    this.trakMap.draw();
};
Product.prototype.incrementPercent = function () {
    this.percent = this.percent + 0.25;
    if (this.percent > 1) {
        this.percent = 0;
    }
    this.trakMap.draw();
};
Product.prototype.toggleHealth = function () {
    switch (this.health) {
        case Product.ONTRACK:
            this.health = Product.ATRISK;
            break;
        case Product.ATRISK:
            this.health = Product.LATE;
            break;
        default:
            this.health = Product.ONTRACK;
            break;
    }
    this.trakMap.draw();
};
// testing
Product.prototype.checkInvariants = function () {
    assert(() => this.weight > 0);
    assert(() => this.getPriority() >= 0);

    var maxValue = 0;
    this.incoming.forEach(dep => {
        dep.checkInvariants();
        var testValue = dep.dependency.getEndValue();
        if (this.getPriority() <= dep.dependency.getPriority()) {
            maxValue = Math.max(testValue, maxValue)
        }
        assert(() => dep.dependent === this);
    });
    assert(() => maxValue === this.value);

    this.outgoing.forEach(dep => {
        assert(() => dep.dependency === this);
        dep.checkInvariants()
    });

    assert(() => this.trakMap.products[this.index] === this);
};

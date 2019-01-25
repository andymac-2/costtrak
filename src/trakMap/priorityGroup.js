'use strict'

var PriorityGroup  = function (trakMap, index, obj) {
    this.trakMap = trakMap;
    this.index = index;
    
    this.name;
    this.comment;
    this.priority;

    // calculated
    this.products = [];
    this.minLevel = Number.MAX_SAFE_INTEGER;
    this.maxLevel = Number.MIN_SAFE_INTEGER;
    this.yOffset = 0;

    this.restore (obj);
};

// serialisation
PriorityGroup.prototype.restore = function (obj) {
    assert (() => obj.priority >= 0);
    
    this.name = obj.name || "";
    this.comment = obj.comment || "";
    this.priority = obj.priority;
};
PriorityGroup.prototype.save = function () {
    return {
        "name": this.name,
        "comment": this.comment,
        "priority": this.priority
    }
};
PriorityGroup.prototype.toJSON = PriorityGroup.prototype.save;

//drawing
PriorityGroup.LEFTMARGIN = 50;
PriorityGroup.prototype.draw = function (parent) {
    let productDesc = Draw.svgElem ("g", {
        "class": "productDesc"
    }, parent)
    
    let top = this.getTop();
    let bottom = this.getBottom();
    let left = -PriorityGroup.LEFTMARGIN;
    let width = this.trakMap.rightMost + 2 * PriorityGroup.LEFTMARGIN;

    let description = new PriorityGroupDesc ({
        unclicker: this.trakMap.unclicker,
        onChange: obj => this.modifyData(obj),
        attrs: {
            "class": "productDescData",
            "transform":  "translate(" + (left + 5) + ", " + top + ")"
        }
    }, this.name, this.comment, this.priority);
    description.draw(productDesc);
    
    Draw.svgElem ("rect", {
        "width": width,
        "height": bottom - top,
        "x": left,
        "y": top,
        "class": "priorityGroupBox"
    }, productDesc);

    Draw.menu (Draw.ALIGNLEFT, this.trakMap.unclicker, [{
        "icon": "icons/delete.svg",
        "action": () => {} // TODO flesh method
    }, {
        "icon": "icons/move-up.svg",
        "action": () => this.moveUp() // TODO flashe method
    }, {
        "icon": "icons/move-down.svg",
        "action": () => this.moveDown() // TODO, flesh method
    }], {
        "transform": "translate(" + left + ", " + (top - 45) + ")"
    }, productDesc);
};

//queries
PriorityGroup.BOTTOMMARGIN = 40;
PriorityGroup.TOPMARGIN = 60;
PriorityGroup.prototype.getTop = function () {
    return this.yOffset + (this.minLevel * TrakMap.VSPACE) -
        PriorityGroup.TOPMARGIN;
};
PriorityGroup.prototype.getBottom = function () {
    return this.yOffset + (this.maxLevel * TrakMap.VSPACE) +
        PriorityGroup.BOTTOMMARGIN;
};

// modifications
PriorityGroup.prototype.removeProduct = function (product) {
    assert (() => product.priorityGroup === this);    
    Util.removeFromArray(this.products, product);
};

PriorityGroup.prototype.addProduct = function (product) {
    assert (() => product.priorityGroup === this);
    this.products.push(product);
};
PriorityGroup.prototype.resolveLevels = function () {
    assert (() => this.products.every(product => {
        return product.direction === Product.GOINGUP ||
            product.direction === Product.GOINGDOWN;
    }));

    if (this.products.length === 0) {
        this.minLevel = 0;
        this.maxLevel = 0;
        return;
    }
    
    let levels = [];
    this.minLevel = Number.MAX_SAFE_INTEGER;
    this.maxLevel = Number.MIN_SAFE_INTEGER;
    
    this.products.sort(Product.compare).forEach (product => {        
        while (levels[product.level] && levels[product.level] > product.getStartValue()) {
            product.level += product.direction;
        }
        levels[product.level] = product.getEndValue();
        this.minLevel = Math.min (product.level, this.minLevel);
        this.maxLevel = Math.max (product.level, this.maxLevel);
    });
};

//user events
PriorityGroup.prototype.modifyPriority = function (priority) {
    this.priority = priority;
    this.trakMap.draw();
};
PriorityGroup.prototype.modifyName = function (name) {
    this.name = name;
    this.trakMap.draw();
};
PriorityGroup.prototype.modifyComment = function (comment) {
    this.comment = comment;
    this.trakMap.draw();
};

// functoion could cause circular dependency;
PriorityGroup.prototype.modifyData = function (priorityGroupDesc) {
    let oldPriority = this.priority;
    
    this.name = priorityGroupDesc.title;
    this.comment = priorityGroupDesc.comment;
    this.priority = priorityGroupDesc.priority;

    try {
        this.trakMap.draw();
    }
    catch (err) {
        if (err instanceof CircularDependencyError) {
            this.priority = oldPriority;
            this.trakMap.draw();
            alert ("Error: Circular dependency");
        }
        else {
            throw err;
        }
    }
};
PriorityGroup.prototype.moveUp = function () {
    assert (() => this.trakMap.priorityGroups[this.index] === this);

    if (this.index === 0) {
        return;
    }

    assert (() => this.trakMap.priorityGroups[this.index - 1].index ===
            this.index - 1);

    Util.swapIndexedElements(this.trakMap.priorityGroups, this.index,
                             this.index - 1);
    this.trakMap.draw();
};
PriorityGroup.prototype.moveDown = function () {
    assert (() => this.trakMap.priorityGroups[this.index] === this);

    if (this.index === this.trakMap.priorityGroups.length - 1) {
        return;
    }

    assert (() => this.trakMap.priorityGroups[this.index + 1].index ===
            this.index + 1);

    Util.swapIndexedElements(this.trakMap.priorityGroups, this.index,
                             this.index + 1);
    this.trakMap.draw();
};

//tests
PriorityGroup.prototype.checkInvariants = function () {
    assert (() => trakMap.priorityGroups[this.index] = this);
};

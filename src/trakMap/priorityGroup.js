'use strict'

var PriorityGroup  = function (trakMap, index, obj) {
    this.trakMap = trakMap;
    this.index = index;
    
    this.name;
    this.comment;
    this.priority;

    // calculated
    this.products = [];
    this.minLevel = 0;
    this.maxLevel = 0;
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

//queries

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

    if (this.products.lemngth === 0) {
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

//tests
PriorityGroup.prototype.checkInvariants = function () {
    assert (() => trakMap.priorityGroups[this.index] = this);
};

'use strict'

var PriorityGroup  = function (trakMap, index, obj) {
    this.trakMap = trakMap;
    this.index = index;
    
    this.name;
    this.comment;
    this.priority;

    // calculated
    this.products = [];
    this.milestones = [];
    this.minLevel = Number.MAX_SAFE_INTEGER;
    this.maxLevel = Number.MIN_SAFE_INTEGER;
    this.yOffset = 0;

    this.restore (obj);
};

PriorityGroup.DEFAULTPRIORITYGROUP = {
    "name": "Untitled",
    "comment": "",
    "priority": 0
};
// serialisation
PriorityGroup.prototype.restore = function (obj) {
    this.name = obj["name"].toString();
    this.comment = obj["comment"].toString();
    this.priority = obj["priority"] | 0;

    if (this.priority < 0) {
        throw new FileValidationError (
            "Product group \"" + this.name + "\", has an invalid priority");
    }
};
PriorityGroup.prototype.save = function () {
    return {
        "name": this.name,
        "comment": this.comment,
        "priority": this.priority
    };
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
        "action": () => this.trakMap.deletePriorityGroup(this)
    }, {
        "icon": "icons/move-up.svg",
        "action": () => this.moveUp()
    }, {
        "icon": "icons/move-down.svg",
        "action": () => this.moveDown()
    }, {
        "icon": "icons/plus.svg",
        "action": () => this.createMilestone()
    }], {
        "transform": "translate(" + left + ", " + (top - 45) + ")"
    }, productDesc);
};

//queries
PriorityGroup.BOTTOMMARGIN = 50;
PriorityGroup.TOPMARGIN = 50;
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
PriorityGroup.prototype.addMilestone = function (milestone) {
    assert (() => milestone.priorityGroup === this);
    this.milestones.push (milestone);
};
PriorityGroup.prototype.removeMilestone = function (milestone) {
    assert (() => milestone.priorityGroup === this);
    Util.removeFromArray (this.milestones, milestone);
};
PriorityGroup.prototype.resolveLevels = function () {
    assert (() => this.products.every(product => {
        return product.direction === Product.GOINGUP ||
            product.direction === Product.GOINGDOWN;
    }));
    assert (() => this.milestones.every(milestone => {
        return milestone.direction === Product.GOINGUP ||
            milestone.direction === Product.GOINGDOWN;
    }));

    let milestonesProducts = this.products.concat(this.milestones); 

    if (milestonesProducts.length === 0) {
        this.minLevel = 0;
        this.maxLevel = 0;
        return;
    }
    
    let levels = [];
    this.minLevel = Number.MAX_SAFE_INTEGER;
    this.maxLevel = Number.MIN_SAFE_INTEGER;

    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        milestonesProducts.sort(Product.compare).forEach (product => {        
            while (PriorityGroup.productOverlapsGreedy(levels, product)) {
                product.level += product.direction;
            }
            levels[product.level] = product.getEndValue();
            this.minLevel = Math.min (product.level, this.minLevel);
            this.maxLevel = Math.max (product.level, this.maxLevel);
        });
    } 
    if (this.trakMap.mode === TrakMap.LAZYMODE) {
        milestonesProducts.sort(Product.compareReverse).forEach (product => {        
            while (PriorityGroup.productOverlapsLazy(levels, product)) {
                product.level += product.direction;
            }
            levels[product.level] = product.getStartValue();
            this.minLevel = Math.min (product.level, this.minLevel);
            this.maxLevel = Math.max (product.level, this.maxLevel);
        });
    }     
};
PriorityGroup.productOverlapsGreedy = function (levels, product) {
    if (levels[product.level] === undefined) {
        return false;
    }
    if (product.getWidth() > 0) {
        return product.getStartValue() < levels[product.level];
    }
    if (product.getWidth() === 0) {
        return product.getStartValue() <= levels[product.level];
    }
};
PriorityGroup.productOverlapsLazy = function (levels, product) {
    if (levels[product.level] === undefined) {
        return false;
    }
    if (product.getWidth() > 0) {
        return product.getEndValue() > levels[product.level];
    }
    if (product.getWidth() === 0) {
        return product.getEndValue() >= levels[product.level];
    }
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

// function could cause circular dependency;
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
PriorityGroup.prototype.deleteThis = function () {
    assert (() => this.trakMap.priorityGroups.indexOf(this) === -1);
    
    this.products.slice().forEach (
        prod => this.trakMap.deleteProductUnsafe(prod));
    this.milestones.slice().forEach (
        milestone => this.trakMap.deleteMilestoneUnsafe(milestone));

    assert (() => this.products.length === 0);
    assert (() => this.milestones.length === 0);
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
PriorityGroup.prototype.createMilestone = function () {
    this.trakMap.newMilestone(this.index, Util.getDefaultDay(), 0);
    this.trakMap.draw();
};

//tests
PriorityGroup.prototype.checkInvariants = function () {
    assert (() => trakMap.priorityGroups[this.index] = this);
};

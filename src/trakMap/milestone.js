'use strict'

// The milestone has some similarities to the interface of product,
// since it can behave as a dependent or dependency

var Milestone = function (trakMap, index, obj) {
    this.incoming = [];
    this.outgoing = [];
    
    this.priorityGroup;
    this.value;
    this.level;

    this.trakMap = trakMap;
    this.index = index;

    this.direction = Product.GOINGUP;
    this.position = {x: 0, y: 0};

    this.restore (obj);
};

Milestone.DEFAULTMILESTONE = {
    "priorityGroup": 0,
    "value": 0,
    "level": 0
};

// save and restore
Milestone.prototype.restore = function (obj) {
    this.value = obj.value;
    this.priorityGroup = this.trakMap.priorityGroups[obj.priorityGroup];
    this.priorityGroup.addMilestone(this);
    this.level = obj.level;
};
Milestone.prototype.save = function () {
    assert (() => this.trakMap.priorityGroups[this.priorityGroup.index] ===
            this.priorityGroup);
    return {
        "level": this.level,
        "value": this.value,
        "priorityGroup": this.priorityGroup.index
    };
};
Milestone.prototype.toJSON = Milestone.prototype.save;

//drawing
Milestone.DIAMONDSIZE = 15;
Milestone.prototype.draw = function (parent) {
    let milestone = Draw.svgElem ("g", {
        "class": "milestone",
        "transform": "translate(" + this.position.x + ", " + this.position.y + ")"
    }, parent);

    Draw.svgElem("path", {
        "class": this.resolveStatusClass (),
        "d" : "M -" +  MsAtReport.DIAMONDSIZE + " 0" +
            "L 0 " +  MsAtReport.DIAMONDSIZE +
            "L " + MsAtReport.DIAMONDSIZE + " 0" +
            "L 0 -" + MsAtReport.DIAMONDSIZE + " Z"
    }, milestone);

    Draw.svgElem ("text", {
        "x": 0,
        "y": 4,
        "text-anchor": "middle"
    }, milestone).textContent = this.getEndValue().toString();
};

// queries. A lot of these are similar to the Product class.
Milestone.prototype.getEndValue = function () {
    return this.value;
};
Milestone.prototype.getStartValue = function () {
    return this.value;
};
Milestone.prototype.getWidth = function () {
    return 0;
};
Milestone.prototype.getMinEndX = function () {
    return this.position.x;
};
Milestone.prototype.hasValidDependencies = function () {
    return false;
};
Milestone.prototype.fulfilledDependencies = function () {
    return true;
};
Milestone.prototype.getPriority = function () {
    return this.priorityGroup.priority;
};

// modifications
Milestone.prototype.removeDependent = Product.prototype.removeDependent;
Milestone.prototype.removeDependency = Product.prototype.removeDependency;
Milestone.prototype.resolveYCoord = function () {
    let offset = this.priorityGroup.yOffset;
    let value = this.level * TrakMap.VSPACE;
    this.position.y = value + offset;
};
Milestone.prototype.setStartX = function (x) {
    this.position.x = x;
};
Milestone.prototype.setEndX = Milestone.prototype.setStartX;
// user events

// testing
Milestone.prototype.checkInvariants = function () {
    assert (() => this.outgoing.every(
        dep => dep.dependencyType === Dependency.MILESTONE &&
            dep.dependency === this));
     assert (() => this.incoming.every(
        dep => dep.dependentType === Dependency.MILESTONE &&
             dep.dependent === this));

    assert (() => this.trakMap.priorityGroups[this.priorityGroup.index] ===
            this.priorityGroup);
    assert (() => this.direction === Product.GOINGDOWN ||
            this.direction === Product.GOINGUP)
    assert (this.trakMap.milestones[this.index] === this)   
};



'use strict'
class HangingDependencyError extends Error {
    constructor (msg) {
        super (msg);
        this.name = "HangingDependencyError";
    }
}

var Dependency = function (trakMap, index, obj) {
    // state
    this.dependencyType;
    this.dependency;
    this.dependentType;
    this.dependent;

    // view model
    this.trakMap = trakMap;
    
    this.start;
    this.end;

    this.index = index;

    //view
    this.elem;

    this.restore (obj);
}
Dependency.MILESTONE = 0;
Dependency.PRODUCT = 1;

Dependency.DEFAULTDEPENDENCY = {
    "dependencyType": Dependency.MILESTONE,
    "dependency": 0,
    "dependentType": Dependency.PRODUCT,
    "dependent": 0
};

Dependency.prototype.draw = function (parent) {
    var connections = Draw.svgElem("g", {
        "class": "dependency"
    }, parent);

    connections.addEventListener(
        "dblclick", () => this.trakMap.deleteDependency(this));

    if (this.dependency.getEndValue() === this.dependent.getStartValue() &&
        this.dependency.getPriority() <= this.dependent.getPriority()){
        var cls = "priorityLine priority-" + this.dependent.getPriority();
        this.elem = Draw.straightLine(
            this.dependent.getStart(), this.dependency.getEnd(), cls, connections);      
    }
    else {
        this.elem = Draw.doubleAngledLine(
            this.dependent.getStart(), this.dependency.getEnd(), TrakMap.HSPACE,
            TrakMap.VSPACE, "priorityLine slack", connections);
    }

    return connections;
};

// Serialisation methods
Dependency.prototype.restore = function (obj) {
    if (obj.dependencyType === Dependency.PRODUCT) {
        this.dependency = this.trakMap.products[obj.dependency];
    }
    else if (obj.dependencyType === Dependency.MILESTONE) {
        this.dependency = this.trakMap.milestones[obj.dependency];
    }
    else {
        assert (() => false);
    }
    this.dependencyType = obj.dependencyType;
    this.dependency.addDependent(this);

    if (obj.dependentType === Dependency.PRODUCT) {
        this.dependent = this.trakMap.products[obj.dependent];
    }
    else if (obj.dependentType === Dependency.MILESTONE) {
        this.dependent = this.trakMap.milestones[obj.dependent];
    }
    else {
        assert (() => false);
    }
    this.dependentType = obj.dependentType;
    this.dependent.addDependency(this);
};
Dependency.prototype.save = function () {
    assert(() => this.dependencyType === Dependency.PRODUCT ?
           this.trakMap.products[this.dependency.index] === this.dependency :
           this.trakMap.milestones[this.dependency.index] === this.dependency);
    assert(() => this.dependentType === Dependency.PRODUCT ?
           this.trakMap.products[this.dependent.index] === this.dependent :
           this.trakMap.milestones[this.dependent.index] === this.dependent);
    
    return {
        "dependencyType": this.dependencyType,
        "dependency": this.dependency.index,
        "dependentType": this.dependentType,
        "dependent": this.dependent.index
    };
};
Dependency.prototype.toJSON = Dependency.prototype.save;

//queries
Dependency.prototype.isDependencyFulfilled = function () {
    return this.dependencyType === Dependency.MILESTONE ||
        this.dependency.visited ||
        this.dependency.getPriority() > this.dependent.getPriority();
};

//modifications
Dependency.prototype.deleteThis  = function () {
    assert (() => this.trakMap.dependencies.indexOf(this) === -1);
    this.dependency.removeDependent(this);
    this.dependent.removeDependency(this);
};

// user events
// *empty*

// testing
Dependency.prototype.checkInvariants = function () {
    assert (() =>
            (this.dependency instanceof Milestone &&
             this.dependencyType === Dependency.MILESTONE) ||
            (this.dependency instanceof Product &&
             this.dependencyType === Dependency.PRODUCT))
     assert (() =>
            (this.dependent instanceof Milestone &&
             this.dependentType === Dependency.MILESTONE) ||
            (this.dependent instanceof Product &&
             this.dependentType === Dependency.PRODUCT))
};

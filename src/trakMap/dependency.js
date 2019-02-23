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

    if (this.isSolidLine()){
        var cls = this.getLineClass();
        Draw.straightLine(
            this.dependent.getStart(), this.dependency.getEnd(), cls, connections);      
    }
    else {
        let start = this.dependency.getEnd();
        let end = this.dependent.getStart();
        let diff = Math.max (100, Math.abs(start.x - end.x));

        Draw.sLine(start, end, 100, "priorityLine slack", connections);
        // Draw.doubleAngledLine(
        //     this.dependent.getStart(), this.dependency.getEnd(), TrakMap.HSPACE,
        //     TrakMap.VSPACE, "priorityLine slack", connections);
    }

    return connections;
};

Dependency.prototype.isSolidLine = function () {
    if (this.dependency.getEndValue() !== this.dependent.getStartValue()) {
        return false;
    }
    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return this.hasValidDependency();
    }
    if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return this.hasValidDependent();
    }
    assert (() => false);
};

Dependency.prototype.getLineClass = function () {
    if (this.trakMap.mode === TrakMap.GREEDYMODE) {
        return this.dependent.getLineClass();
    }
    if (this.trakMap.mode === TrakMap.LAZYMODE) {
        return this.dependency.getLineClass();
    }
};

// Serialisation methods
Dependency.prototype.restore = function (obj) {
    // paranoia check if file has weird values for dependencyType.
    this.dependencyType = obj["dependencyType"] ? 1 : 0;
    if (this.dependencyType === Dependency.PRODUCT) {
        this.dependency = this.trakMap.products[obj["dependency"]];
    }
    else if (this.dependencyType === Dependency.MILESTONE) {
        this.dependency = this.trakMap.milestones[obj["dependency"]];
    }
    else {
        assert (() => false);
    }

    if (!this.dependency) {
        throw new FileValidationError ("Dependency has invalid dependency index");
    }
    this.dependency.addDependent(this);

    this.dependentType = obj["dependentType"] ? 1 : 0;
    if (this.dependentType === Dependency.PRODUCT) {
        this.dependent = this.trakMap.products[obj["dependent"]];
    }
    else if (this.dependentType === Dependency.MILESTONE) {
        this.dependent = this.trakMap.milestones[obj["dependent"]];
    }
    else {
        assert (() => false);
    }

    if (!this.dependent) {
        throw new FileValidationError ("Dependency has invalid dependent index");
    }
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
    return !this.hasValidDependency() || 
        this.dependencyType === Dependency.MILESTONE ||
        this.dependency.visited;
};
Dependency.prototype.isDependentFulfilled = function () {
    return !this.hasValidDependent() || 
        this.dependentType === Dependency.MILESTONE ||
        this.dependent.visited;
};
Dependency.prototype.hasValidDependency = function () {
    if (this.dependentType === Dependency.MILESTONE) {
        return false;
    }
    return this.dependency.getPriority() <= this.dependent.getPriority();
};
Dependency.prototype.hasValidDependent = function () {
    if (this.dependencyType === Dependency.MILESTONE) {
        return false;
    }
    return this.dependent.getPriority() <= this.dependency.getPriority();
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

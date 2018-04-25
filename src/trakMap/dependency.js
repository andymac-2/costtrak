'use strict'
// this class does not automatically update the screen when it is constructed.

var Dependency = function (trakMap, index, obj) {
    // state
    this.dependency;
    this.dependant;

    // view model
    this.trakMap = trakMap;
    
    this.start;
    this.end;

    this.index = index;

    //view
    this.elem;


    this.trakMap.products[obj.dependency].outgoing.push(this);
    this.trakMap.products[obj.dependent].incoming.push(this);
    this.restore (obj);
}

Dependency.prototype.draw = function () {
    var connections = this.trakMap.connections;

    if (this.dependency.getEndValue() === this.dependent.getStartValue()){
        var cls = "priorityLine priority-" + this.dependent.priority;
        this.elem = Draw.straightLine(
            this.dependent.start, this.dependency.end, cls, connections);      
    }
    else {
        this.elem = Draw.doubleAngledLine(
            this.dependent.start, this.dependency.end, TrakMap.HSPACE,
            TrakMap.VSPACE, "priorityLine slack", connections);
    }

};

// Serialisation methods
Dependency.prototype.restore = function (obj) {
    this.dependent = this.trakMap.products[obj.dependent];
    this.dependency = this.trakMap.products[obj.dependency];
};
Dependency.prototype.save = function () {
    assert(() => this.trakMap.products[this.dependency.index] ===
           this.dependency);
    assert(() => this.trakMap.products[this.dependant.index] ===
           this.dependant);
    
    return {
        "dependency": this.dependency.index,
        "dependant": this.dependant.index
    };
};
Dependency.prototype.toJSON = Dependency.prototype.save;

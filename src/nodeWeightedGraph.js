'use strict'

class CircularDependencyError extends Error {
    constructor (msg) {
        super (msg);
        this.name = "CircularDependencyError"
    }
}

/** @interface */
var WeightedNode = function () {}

// read only
/** @type {[weightedNode]} */
WeightedNode.prototype.outgoing;
/** @type {[weightedNode]} */
WeightedNode.prototype.incoming;
/** @type {number} */
WeightedNode.prototype.weight;
/** @type {number} */
WeightedNode.prototype.priority;

// modifiable properties
/** 
    a nodes value is at least minValue and at least as big as all of
    it's dependents values plus their weight. the value is the "start" of the node
@type {number} */
WeightedNode.prototype.value;
/** @type {boolean} */
WeightedNode.prototype.visited;




var nodeWeightedGraph = {};

/** a topological sort
@type {function([WeightedNode]):[WeightedNode]}
*/
nodeWeightedGraph.topoSort = function (nodes) {
    // find all nodes which have no dependencies, also set all nodes
    // visited to "false"
    nodes.forEach(node => node.visited = false)
    let active = nodes.filter(node => this.fulfilledDependencies(node));

    // for each element in the active list, check all of it's
    // dependants. If any of the dependants dependencies have all been
    // fulfilled and it has not been visited yet, add it to the active
    // list.
    
    for (var i = 0; i < active.length; i++) {
        active[i].visited = true;

        var outgoing = active[i].outgoing;
        
        for (var j = 0; j < outgoing.length; j++) {
            var dependent = outgoing[j].dependent;
            if (this.fulfilledDependencies (dependent) &&
                 dependent.visited === false)
            {
                dependent.visited = true;
                active.push(dependent);
            }
        }
    }

    // cyclic graph.
    if (active.length !== nodes.length) {
        throw new CircularDependencyError ("Circular dependency detected.");
    }

    return active;
};
nodeWeightedGraph.fulfilledDependencies =  function (node) {
    return node.incoming.every(dep => {
        return dep.dependency.visited === true ||
            dep.dependency.getPriority() > node.getPriority()
    });
};

/** sort nodes by their minimal possible value.
@type {function([WeightedNode]):[WeightedNode]}
*/
nodeWeightedGraph.greedySort = function (nodes) {
    var topoSorted = this.topoSort (nodes);

    topoSorted.forEach(node => {
        node.value = 0;

        node.incoming.forEach(dep => {
            let dependency = dep.dependency;
            if (dependency.getPriority() <= node.getPriority()) {                                       
                node.value = Math.max(node.value, dependency.getEndValue());
            }
        });
    });

    return topoSorted.sort(Product.compare);
};


// Tests
var nWGTest = function (nodes) {
    nodeWeightedGraph.greedySort(nodes);

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var incoming = nodes[i].incoming;
        var value = nodes[i].value;
        var maxvalue = 0;
        
        for (var j = 0; j < incoming.length; j++) {
            var testvalue = incoming[j].dependency.value +
                incoming[j].dependency.weight;
            if (node.getPriority() <= incoming[j].dependency.getPriority()) {
                maxvalue = testvalue > maxvalue ? testvalue : maxvalue;
            }
        }

        assert (() => maxvalue === value);
    }
};


var nWGTests = function () {
    runTests ({
        
        "Single object": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 2, priorityGroup: 0}
            ],
            dependencies: [],
            start: 0,
            priorityGroups: [
                {name: "Group1", priority: 0}
            ]
        }).products),
        
        "Single dependency": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 2, priorityGroup: 0},
                {name: "two", weight: 2, priorityGroup: 0}
            ],
            dependencies: [
                {dependency: 0, dependent: 1}
            ],
            start: 0,
            priorityGroups: [
                {name: "Group1", priority: 0}
            ]
        }).products),
        
        "Circular dependency": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 2, priorityGroup: 0},
                {name: "two", weight: 2, priorityGroup: 0}
            ],
            dependencies: [
                //   {dependency: 0, dependent: 1},
                {dependency: 1, dependent: 0}
            ],
            start: 0,
            priorityGroups: [
                {name: "Group1", priority: 0}
            ]
        }).products),

        "Complicated dependencies": nWGTest.bind(null, new TrakMap ({
            products: [
                {name: "one", weight: 4, priorityGroup: 0},
                {name: "two", weight: 30, priorityGroup: 0},
                {name: "three", weight: 3, priorityGroup: 0},
                {name: "four", weight: 30, priorityGroup: 0},
                {name: "five", weight: 8, priorityGroup: 0},
                {name: "six", weight: 3, priorityGroup: 0},
                {name: "seven", weight: 3, priorityGroup: 0}
            ],
            dependencies: [
                {dependency: 0, dependent: 1},
                {dependency: 2, dependent: 1},
                {dependency: 0, dependent: 3},
                {dependency: 2, dependent: 3},
                {dependency: 1, dependent: 4},
                {dependency: 3, dependent: 4},
                {dependency: 2, dependent: 5},
                {dependency: 1, dependent: 5},
                {dependency: 2, dependent: 6},
                {dependency: 0, dependent: 6},
                {dependency: 6, dependent: 5},
                {dependency: 6, dependent: 4}
            ],
            start: 0,
            priorityGroups: [
                {name: "Group1", priority: 0}
            ]
        }).products)
    });
}

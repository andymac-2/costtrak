'use strict'

class CircularDependencyError extends Error {
    constructor (msg) {
        super (msg);
        this.name = "CircularDependencyError";
    }
}


var nodeWeightedGraph = {};

/** sort nodes by their minimal possible value.
 * @param {Array<Product>} nodes A list of unsorted nodes.
 * @return {Array<Product>} Sorted nodes
*/
nodeWeightedGraph.topoSort = function (nodes) {
    // find all nodes which have no dependencies, also set all nodes
    // visited to "false"
    nodes.forEach(node => node.visited = false);
    let active = nodes
        .filter(node => nodeWeightedGraph.fulfilledDependencies(node))
        .map(node => {
            node.visited = true;
            return node;
        });   

    // for each element in the active list, check all of it's
    // dependants. If any of the dependants dependencies have all been
    // fulfilled and it has not been visited yet, add it to the active
    // list.
    
    for (var i = 0; i < active.length; i++) {
        active[i].visited = true;

        active[i].outgoing.forEach (dep => {
            let dependent = dep.dependent;
            if (nodeWeightedGraph.fulfilledDependencies (dependent) &&
                dependent.visited === false)
            {
                dependent.visited = true;
                active.push(dependent);
            }    
        });
    }

    assert (() => active.every(prod => prod instanceof Product));
    // cyclic graph.
    if (nodes.some(node => node.visited === false)) {
        throw new CircularDependencyError ("Circular dependency detected.");
    }
    assert (() => active.length === nodes.length);
    return active;
};
/** sort nodes by their minimal possible value.
 * @param {Array<Product>} nodes A list of unsorted nodes.
 * @return {Array<Product>} Sorted nodes
*/
nodeWeightedGraph.topoSortLazy = function (nodes) {
    nodes.forEach(node => node.visited = false);
    let active = nodes
        .filter(node => nodeWeightedGraph.fulfilledDependents(node))
        .map(node => {
            node.visited = true;
            return node;
        });
    
    for (var i = 0; i < active.length; i++) {
        active[i].visited = true;

        active[i].incoming.forEach (dep => {
            let dependency = dep.dependency;
            if (nodeWeightedGraph.fulfilledDependents (dependency) &&
                dependency.visited === false)
            {
                dependency.visited = true;
                active.push(dependency);
            }    
        });
    }

    assert (() => active.every(prod => prod instanceof Product));
    if (nodes.some(node => node.visited === false)) {
        throw new CircularDependencyError ("Circular dependency detected.");
    }
    assert (() => active.length === nodes.length);
    return active;
};

nodeWeightedGraph.fulfilledDependencies = function (node) {
    return node.incoming.every(dep => dep.isDependencyFulfilled());
};
nodeWeightedGraph.fulfilledDependents = function (node) {
    return node.outgoing.every(dep => dep.isDependentFulfilled());
};

/** sort nodes by their minimal possible value.
 * @param {Array<Product>} nodes A list of unsorted nodes.
 * @return {Array<Product>} Sorted nodes
*/
nodeWeightedGraph.greedySort = function (nodes) {
    var topoSorted = nodeWeightedGraph.topoSort (nodes);

    topoSorted.forEach(node => {
        node.value = Number.MIN_SAFE_INTEGER;
        node.incoming.forEach(dep => {
            if (dep.hasValidDependency()) {                                       
                node.value = Math.max(node.value, dep.dependency.getEndValue());
            }
        });
    });

    assert (() => topoSorted.every(node => node instanceof Product));
    assert (() => topoSorted.every(node => {
        let max = node.incoming
            .filter(dep => dep.hasValidDependency())
            .map(dep => dep.dependency.getEndValue())
            .reduce((acc, curr) => Math.max (acc, curr))
        return node.value === max;
    }));

    return topoSorted.sort(Product.compare);
};
/** sort nodes by their minimal possible value.
 * @param {Array<Product>} nodes A list of unsorted nodes.
 * @return {Array<Product>} Sorted nodes
*/
nodeWeightedGraph.lazySort = function (nodes) {
    var topoSorted = nodeWeightedGraph.topoSortLazy (nodes);

    topoSorted.forEach(node => {
        node.value = Number.MAX_SAFE_INTEGER;
        node.outgoing.forEach(dep => {
            if (dep.hasValidDependent()) {                                       
                node.value = Math.min(
                    node.value, dep.dependent.getStartValue() - node.weight);
            }
        });
    });
    // long assertion here, this does not modify node.value, just checks that it
    // is correct
    assert (() => topoSorted.every(node => node instanceof Product));
    assert (() => topoSorted.every(node => {
        let min = node.outgoing
            .filter(dep => dep.hasValidDependent())
            .map(dep => dep.dependent.getStartValue())
            .reduce((acc, curr) => Math.min (acc, curr))
        return node.value === min - node.weight;
    }));

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

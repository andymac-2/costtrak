window.onload = function () {
    //runTestSuite();
    var app = document.getElementById ("app");
    
    var trakMap = new TrakMap ({
        products: [
            {name: "one", weight: 4, priorityGroup: 0},
            {name: "two", weight: 30, priorityGroup: 0},
            {name: "three", weight: 3, priorityGroup: 0},
            {name: "four", weight: 30, priorityGroup: 0},
            {name: "five", weight: 8, priorityGroup: 2},
            {name: "six", weight: 3, priorityGroup: 1},
            {name: "seven", weight: 3, priorityGroup: 1},
            {name: "eight", weight: 10, priorityGroup: 0},
            {name: "nine", weight: 4, priorityGroup: 1},
            {name: "ten", weight: 35, priorityGroup: 1}
        ],
        dependencies: [
            {dependency: 6, dependent: 8},
            {dependency: 6, dependent: 9},
            {dependency: 8, dependent: 5},
            {dependency: 9, dependent: 5},
            {dependency: 3, dependent: 7},
            {dependency: 1, dependent: 7},
            {dependency: 0, dependent: 1},
            {dependency: 2, dependent: 1},
            {dependency: 0, dependent: 3},
            {dependency: 2, dependent: 3},
            {dependency: 0, dependent: 4},
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
            {name: "Group1", priority: 0},
            {name: "Group2", priority: 1},
            {name: "Group3", priority: 2},
            {name: "Group4", priority: 3},
            {name: "Group5", priority: 4}
        ]
    }, app);
}




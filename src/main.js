window.onload = function () {
    runTestSuite();
    var app = document.getElementById ("app");
    
    var trakMap = new TrakMap ({
        products: [
            {name: "one", weight: 4, priority: 0},
            {name: "two", weight: 30, priority: 0},
            {name: "three", weight: 3, priority: 0},
            {name: "four", weight: 30, priority: 0},
            {name: "five", weight: 8, priority: 2},
            {name: "six", weight: 3, priority: 1},
            {name: "seven", weight: 3, priority: 1},
            {name: "eight", weight: 10, priority: 0},
            {name: "nine", weight: 4, priority: 1},
            {name: "ten", weight: 35, priority: 1}
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
        prioritiesList: [2, 0, 1, 3]
    }, app);
}




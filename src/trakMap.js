'use strict'

var TrakMap = function (obj, parent) {
    // View
    this.elem = Draw.svgElem ("svg", {
        "width": "3100",
        "viewBox": "-100, -100, 3000, 1000"
    }, parent);

    this.parent;

    if (parent) {
        this.parent = parent;
    }

    // SVG layers from background to foreground
    this.connections;
    this.lines;
    this.bubbles;
    this.menus;

    //View model (calculated)
    this.yOffsets;
    this.origin;

    // graph elements (state)
    this.products = [];
    this.dependencies = [];
    this.start;
    this.prioritiesList;

    /** @type {Unclicker} */ this.unclicker = new Unclicker (this.elem);

    this.restore(obj);
};
TrakMap.HSPACE = 30;
TrakMap.MINPRODUCTWIDTH = 150;
TrakMap.UNITVALUEWIDTH = 10;
TrakMap.VSPACE = 70;
TrakMap.PRIORITYSPACE = 90;
TrakMap.MARGIN = 30;

// reactive functions
// obj: {prodicts, dependencies, start, prioritiesList};
TrakMap.prototype.restore = function (obj) {
    var flatProducts = obj.products;
    var flatDependencies = obj.dependencies;
    this.start = obj.start;
    this.prioritiesList = obj.prioritiesList

    this.products = [];

    for (var i = 0; i < flatProducts.length; i++) {
        this.products.push(new Product (this, i, flatProducts[i]));
    };

    this.dependencies = [];

    for (i = 0; i < flatDependencies.length; i++) {
        this.dependencies.push(new Dependency (this, i, flatDependencies[i]));
    }

    this.draw();
};

TrakMap.prototype.draw = function () {
    this.resolveCoordinates();

    this.elem.innerHTML = "";

    this.connections =  Draw.svgElem("g", {"class": "TMConnections"}, this.elem);
    this.lines =  Draw.svgElem("g", {"class": "TMProducts"}, this.elem);
    this.bubbles =  Draw.svgElem("g", {"class": "TMBubbles"}, this.elem);
    this.menus =  Draw.svgElem("g", {"class": "TMMenus"}, this.elem);

    Draw.dateBubble (this.origin, "0", this.bubbles);

    this.products.forEach (product => {
        product.drawLine(this.lines);
        product.drawBubble(this.bubbles);
    });
    this.dependencies.forEach (dependency => dependency.draw());
    // TODO draw the bounding boxes
};

TrakMap.prototype.resolveCoordinates = function () {

    // Step 1: resolve y coordinates
    var priorityProducts = nodeWeightedGraph.greedySort(this.products);

    //TODO: proper circular dependency error handling
    if (priorityProducts.length === 0) {
        return;
    }

    var levelBounds = priorityProducts.map (TrakMap.resolvePriorityGroup);
    this.resolvePriorityGroupOffsets(levelBounds);

    this.products.forEach (product => {
        product.start.y = product.end.y =
            this.getYCoord(product.priority, product.level);
    });


    // Step 2: resolve x coordinates
    var sortedProducts = this.products.sort(Product.compare);
    var heap = new MinHeap (Product.compareEnds);
    var cursor = 0;
    var lastValue = 0;

    sortedProducts.forEach(product => {
        // go through heap elements < our current value.
        while (!heap.empty() &&
               (heap.getMin().getEndValue() <= product.getStartValue()))
        {
            var min = heap.getMin();
            if (lastValue !== min.getEndValue()) {
                lastValue = min.getEndValue();
                cursor += TrakMap.HSPACE;
                cursor = (cursor > min.getMinEndX()) ?
                    cursor : min.getMinEndX();
            }

            min.end.x = cursor;
            heap.deleteMin();
        }

        // add the product itself
        if (lastValue !== product.getStartValue()) {
            lastValue = product.getStartValue();
            cursor += TrakMap.HSPACE;
        }

        product.start.x = cursor + TrakMap.HSPACE;
        heap.add(product);
    });

    var min;
    while (min = heap.deleteMin()) {
        if (lastValue !== min.getEndValue()) {
            lastValue = min.getEndValue();
            cursor += TrakMap.HSPACE;
            cursor = (cursor > min.getMinEndX()) ? cursor : min.getMinEndX();
        }
        min.end.x = cursor;
    }

    this.origin = {x: 0, y: this.getYCoord (0, 0)};
};

TrakMap.prototype.resolvePriorityGroupOffsets = function (levelBounds) {
    this.yOffsets = [];
    var boundary = TrakMap.MARGIN;
    this.yOffsets.length = levelBounds.length;
    for (var i = 0; i < this.prioritiesList.length; i++) {
        var priority = this.prioritiesList[i];
        var bounds = levelBounds[priority] || TrakMap.DEFAULTPRIORITYGROUPLEVEL;
        var offset = boundary - bounds.minLevel * TrakMap.VSPACE;
        var levelDiff = bounds.maxLevel -
            bounds.minLevel;
        boundary += TrakMap.VSPACE * levelDiff + TrakMap.PRIORITYSPACE;

        this.yOffsets[priority] = offset;
    }
};

// static function resolves levels so that products do not overlap.
TrakMap.DEFAULTPRIORITYGROUPLEVEL = {minLevel: 0, maxLevel: 0}
TrakMap.resolvePriorityGroup = function (priorityGroup) {
    var levels = {}
    var minLevel = 0;
    var maxLevel = 0;

    priorityGroup.forEach(product => {
        while (levels[product.level] && levels[product.level] > product.getStartValue()) {
            product.level += product.level > 0 ? 1 : -1;
        }
        levels[product.level] = product.getEndValue();
        minLevel = product.level < minLevel ? product.level : minLevel;
        maxLevel = product.level > maxLevel ? product.level : maxLevel;
    });

    return {minLevel: minLevel, maxLevel: maxLevel};
};


TrakMap.prototype.getYCoord = function (priority, level) {
    var offset = this.yOffsets[priority];
    var value = level * TrakMap.VSPACE;
    return value + offset;
};

TrakMap.prototype.save = function () {
    return {
        start: this.start,
        prioritiesList: this.prioritiesList,
        products: this.products.map(product => product.save()),
        dependencies: this.dependencies.map(dependency => dependency.save())
    };
};


// adds a rpoduct with the serialisation of obj. Call the draw method
// to update the screen
TrakMap.prototype.addProduct = function (obj) {
    this.products.push(new Product (this, this.products.length, obj));
};

// adds a dependency with the serialisation of obj. Call the draw
// method to update the screen
TrakMap.prototype.addDependency = function (obj) {
    this.dependencies.push(
        new Dependency (this, this.dependencies.length, obj));
};

// removes a dependency. Call the draw method to update the screen
TrakMap.prototype.removeDependency = function (dep) {
    assert (() => dep instanceof Dependency);

    dep.dependency.removeDependant(dep);
    dep.dependent.removeDependency(dep);

    Util.removeFromIndexedArray(this.dependencies, dep);
};

// removes a product. Call the draw method to update the screen
TrakMap.prototype.removeProduct = function (prod) {
    assert (() => (prod instanceof Product));
    assert (() => prod === this.products[prod.index]);

    // remove dependencies.
    for (var i = 0; i < prod.incoming.length; i++) {
        this.removeDependency(prod.incoming[i]);
    }

    for (i = 0; i < prod.outgoing.length; i++) {
        this.removeDependency(prod.outgoing[i]);
    }

    Util.removeFromIndexedArray (this.products, prod);
};

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
    
    this.selection = null;
    this.selType = TrakMap.SELNOTHING;

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

    var dateBubble = new DateBubble (this, null);
    dateBubble.draw(this.bubbles);

    this.products.forEach (product => {
        product.drawLine(this.lines);
        product.drawBubble(this.bubbles);
    });
    this.dependencies.forEach (dependency => dependency.draw(this.connections));
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
    var sortedProducts = this.products.slice().sort(Product.compare);
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

// selection state in order of high to low priority.
TrakMap.SELDEPENDENCY = 0;
TrakMap.SELDEPENDENT = 1;
TrakMap.SELNORMAL = 2;
TrakMap.SELNOTHING = 3;
TrakMap.prototype.select = function (type, obj) {
    // I just want to lament the absence of sum types in most
    // imperative languages at this point, as this would have been
    // much cleaner with them
    if (obj === this.selection && type >= this.selType) {
        return;
    }
    if (type === TrakMap.SELNORMAL &&
             this.selType === TrakMap.SELDEPENDENCY &&
             obj !== this.selection)
    {
        assert (() => this.selection instanceof Product);
        assert (() => obj instanceof Product);
        this.newDependency (this.selection, obj);

        this.selection = null
        this.selType = TrakMap.SELNOTHING;
        this.draw();
    }
    else if (type === TrakMap.SELNORMAL &&
             this.selType === TrakMap.SELDEPENDENT &&
             obj !== this.selection) {
        assert (() => this.selection instanceof Product);
        assert (() => obj instanceof Product);
        this.newDependency (obj, this.selection);

        this.selection = null
        this.selType = TrakMap.SELNOTHING;
        this.draw();
    }
    else {
        this.selection = obj;
        this.selType = type;
    }
};

// adds a product with the serialisation of obj. Call the draw method
// to update the screen
TrakMap.prototype.addProduct = function (obj) {
    var product = new Product (this, this.products.length, obj);
    this.products.push(product);
    return product;
};

// adds a dependency with the serialisation of obj. Call the draw
// method to update the screen
TrakMap.prototype.addDependency = function (obj) {
    var dep =  new Dependency (this, this.dependencies.length, obj);
    this.dependencies.push(dep);
    return dep;
};

TrakMap.prototype.newDependency = function (dependency, dependent) {
    assert (() => this.products[dependency.index] === dependency)
    assert (() => this.products[dependent.index] === dependent)
    
    return this.addDependency ({
        "dependency": dependency.index,
        "dependent": dependent.index
    });
};

// removes a dependency. Call the draw method to update the screen
TrakMap.prototype.removeDependency = function (dep) {
    assert (() => dep instanceof Dependency);

    dep.dependency.removeDependent(dep);
    dep.dependent.removeDependency(dep);

    Util.removeFromIndexedArray(this.dependencies, dep);
};

// removes a product. Call the draw method to update the screen
TrakMap.prototype.removeProduct = function (prod) {
    assert (() => (prod instanceof Product));
    assert (() => prod === this.products[prod.index]);

    // remove dependencies.
    prod.incoming.forEach(elem => this.removeDependency(elem));
    prod.outgoing.forEach(elem => this.removeDependency(elem));

    assert (() => prod.incoming.length === 0);
    assert (() => prod.outgoing.length === 0);
    
    Util.removeFromIndexedArray (this.products, prod);
};

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
    this.rightMost = 0;

    // graph elements (state)
    this.products = [];
    this.milestones = [];
    this.dependencies = [];
    this.priorityGroups = [];
    this.start;
    this.mode;

    // selections
    this.selection = null;
    this.selType = TrakMap.SELNOTHING;

    /** @type {Unclicker} */ this.unclicker = new Unclicker (this.elem);
    this.restore(obj);
    this.draw();
};
TrakMap.HSPACE = 30;
TrakMap.MINPRODUCTWIDTH = 230;
TrakMap.UNITVALUEWIDTH = 3;
TrakMap.VSPACE = 70;
TrakMap.PRIORITYSPACE = 130;
TrakMap.MARGIN = 30;

TrakMap.LAZYMODE = 0;
TrakMap.GREEDYMODE = 1;

TrakMap.NEWFILE = {
    "products" : [
        Product.DEFAULTPRODUCT
    ],
    "milestones" : [
        Milestone.DEFAULTMILESTONE
    ],
    "dependencies": [
        Dependency.DEFAULTDEPENDENCY
    ],
    "start": 0,
    "mode": TrakMap.GREEDYMODE,
    "priorityGroups": [
        PriorityGroup.DEFAULTPRIORITYGROUP
    ]
}

TrakMap.prototype.save = function () {
    return {
        "start": this.start,
        "mode": this.mode,
        "priorityGroups": this.priorityGroups,
        "products": this.products.map(product => product.save()),
        "milestones": this.milestones.map(milestone => milestone.save()),
        "dependencies": this.dependencies.map(dependency => dependency.save())
    };
};

TrakMap.prototype.restore = function (obj) {
    this.start = obj.start;
    this.mode = obj.mode;

    this.priorityGroups = [];
    obj.priorityGroups.forEach ((priorityGroup, i) => {
        this.priorityGroups.push(new PriorityGroup (this, i, priorityGroup));
    });

    this.milestones = [];
    obj.milestones.forEach((milestone, i) => {
        this.milestones.push(new Milestone (this, i, milestone));
    })

    this.products = [];
    obj.products.forEach((product, i) => {
        this.products.push(new Product (this, i, product));
    });

    this.dependencies = [];
    obj.dependencies.forEach((dependency, i) => {
        this.dependencies.push(new Dependency (this, i, dependency));
    });
};

TrakMap.prototype.draw = function () {
    this.resolveCoordinates();

    this.elem.innerHTML = "";

    this.connections =  Draw.svgElem("g", {"class": "TMConnections"}, this.elem);
    this.lines =  Draw.svgElem("g", {"class": "TMProducts"}, this.elem);
    this.bubbles =  Draw.svgElem("g", {"class": "TMBubbles"}, this.elem);
    this.menus =  Draw.svgElem("g", {"class": "TMMenus"}, this.elem);

    this.products.forEach (product => {
        product.drawLine(this.lines);
        product.drawBubble(this.bubbles);
    });
    this.milestones.forEach (milestone => milestone.draw(this.bubbles));
    this.dependencies.forEach (dependency => dependency.draw(this.connections));

    this.priorityGroups.forEach (priorityGroup => {
        priorityGroup.draw(this.lines);
    });
};

TrakMap.prototype.resolveCoordinates = function () {
    this.products.forEach(prod => {
        if (this.mode === TrakMap.LAZYMODE && !prod.hasValidDependents()) {
            throw new HangingDependencyError (
                'Product "' + prod.name + '" has no dependents in lazy mode.');
        }
        if (this.mode === TrakMap.GREEDYMODE && !prod.hasValidDependencies()) {
            throw new HangingDependencyError (
                'Product "' + prod.name + '" has no dependencies in greedy mode.');
        }
    });

    // TODO make this function work for lazy mode
    
    // Step 1: resolve y coordinates
    nodeWeightedGraph.greedySort(this.products);

    this.resolvePriorityLevels ();
    this.resolvePriorityGroupOffsets();
    this.resolveYValues ();

    // Step 2: resolve x coordinates
    var heap = new MinHeap (Product.compareEnds);
    var cursor = 0;
    var lastValue = 0;
    this.rightMost = 0;

    let sortedProducts = this.products
        .concat(this.milestones)
        .sort(Product.compare);

    sortedProducts.forEach(product => {
        // go through heap elements <= our current value, heap
        // elements should be traversed with priority.
        while (!heap.empty() &&
               (heap.getMin().getEndValue() <= product.getStartValue()))
        {
            var min = heap.getMin();
            if (lastValue !== min.getEndValue()) {
                lastValue = min.getEndValue();
                cursor = Math.max(cursor + TrakMap.HSPACE, min.getMinEndX());
            }

            this.rightMost = Math.max (this.rightMost, cursor);
            min.setEndX(cursor);
            heap.deleteMin();
        }

        // add the product itself
        if (lastValue !== product.getStartValue()) {
            lastValue = product.getStartValue();
            cursor += TrakMap.HSPACE;
        }

        product.setStartX(cursor);
        heap.add(product);
    });

    var min;
    while (min = heap.deleteMin()) {
        if (lastValue !== min.getEndValue()) {
            lastValue = min.getEndValue();
            cursor = Math.max(cursor + TrakMap.HSPACE, min.getMinEndX());
        }
        this.rightMost = Math.max (this.rightMost, cursor);
        min.setEndX(cursor);
    }
};

TrakMap.prototype.resolvePriorityGroupOffsets = function () {
    this.priorityGroups.length;
    
    let boundary = TrakMap.MARGIN;
    this.priorityGroups.forEach (priorityGroup => {
        priorityGroup.yOffset = boundary - priorityGroup.minLevel * TrakMap.VSPACE;
        
        let levelDiff = priorityGroup.maxLevel - priorityGroup.minLevel;
        boundary += TrakMap.VSPACE * levelDiff + TrakMap.PRIORITYSPACE;
    });
};
TrakMap.prototype.resolvePriorityLevels = function () {
    this.priorityGroups.forEach (priorityGroup => {
        priorityGroup.resolveLevels();
    });
};
TrakMap.prototype.resolveYValues = function () {
    this.products.forEach (product => product.resolveYCoord());
    this.milestones.forEach (milestone => milestone.resolveYCoord());
};

//onchange takes one argument: the selected priority group
TrakMap.prototype.drawPriorityGroupSelector =
    function (onchange, attrs, parent)
{
    let entries = this.priorityGroups.map(priorityGroup => priorityGroup.name);
    Draw.dropDown ((evt) => {
        onchange(this.priorityGroups[evt.currentTarget.value])
    }, entries, attrs, parent);
};

// user events
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
        
        this.makeSafeModification(
            () => this.newDependency (this.selection, obj));

        this.selection = null
        this.selType = TrakMap.SELNOTHING;
    }
    else if (type === TrakMap.SELNORMAL &&
             this.selType === TrakMap.SELDEPENDENT &&
             obj !== this.selection)
    {
        assert (() => this.selection instanceof Product);
        assert (() => obj instanceof Product);

        this.makeSafeModification(
            () => this.newDependency (obj, this.selection));

        this.selection = null
        this.selType = TrakMap.SELNOTHING;
    }
    else {
        this.selection = obj;
        this.selType = type;
    }
};


// modifictions:
TrakMap.prototype.addProduct = function (obj) {
    let product = new Product (this, this.products.length, obj);
    this.products.push(product);
    return product;
};
TrakMap.prototype.addMilestone = function (obj) {
    let milestone = new Milestone (this, this.milestones.length, obj);
    this.milestones.push(milestone);
    return milestone;
};
TrakMap.prototype.addDependency = function (obj) {
    let dep =  new Dependency (this, this.dependencies.length, obj);
    this.dependencies.push(dep);
    return dep;
};

TrakMap.prototype.newDependency = function (dependency, dependent) {
    assert (() => this.products[dependency.index] === dependency)
    assert (() => this.products[dependent.index] === dependent)
    
    return this.addDependency ({
        "dependencyType": Dependency.PRODUCT,
        "dependency": dependency.index,
        "dependentType": Dependency.PRODUCT,
        "dependent": dependent.index
    })
};

TrakMap.prototype.removePriorityGroup = function (priorityGroup) {
    Util.removeFromIndexedArray (this.priorityGroups, priorityGroup);
};

TrakMap.prototype.setAllDirections = function (dir) {
    assert (() => dir === Product.GOINGDOWN || dir === Product.GOINGUP);
    this.products.forEach (prod => prod.setDirection(dir));
    this.milestones.forEach (milestone => milestone.setDirection(dir));
};

// unsave methods may throw errors. When an error is thrown, the
// entire state may be left in an invalid state. We can make them safe
// using makeSafeModification
TrakMap.prototype.deleteDependencyUnsafe = function (dep) {
    Util.removeFromIndexedArray(this.dependencies, dep);
    dep.deleteThis();
};
TrakMap.prototype.deleteProductUnsafe = function (product) {
    Util.removeFromIndexedArray (this.products, product);
    product.deleteThis();
};
TrakMap.prototype.deletePriorityGroupUnsafe = function (pg) {
    Util.removeFromIndexedArray (this.priorityGroups, pg);
    pg.deleteThis();
};
TrakMap.prototype.deleteMilestoneUnsafe = function (milestone) {
    Util.removeFromIndexedArray (this.milestones, milestone);
    milestone.deleteThis();
};

// special utilities
TrakMap.prototype.makeSafeModification = function (func) {
    let backup = this.save();
    func();

    try {
        this.draw();
    }
    catch (e) {
        this.restore(backup);
        this.draw();
        alert (e.name + ": " + e.message);
    }
};

//user events
TrakMap.prototype.newPriorityGroup = function () {
    let priorityGroup = new PriorityGroup (
        this, this.priorityGroups.length, PriorityGroup.DEFAULTPRIORITYGROUP);
    this.priorityGroups.push(priorityGroup);
    this.draw();
    return priorityGroup;
};

TrakMap.prototype.deleteDependency = function (dep) {
    this.makeSafeModification(() => this.deleteDependencyUnsafe(dep));
};
TrakMap.prototype.deleteProduct = function (product) {
    this.makeSafeModification(() => this.deleteProductUnsafe(product));
};
TrakMap.prototype.deletePriorityGroup = function (pg) {
    this.makeSafeModification(() => this.deletePriorityGroupUnsafe(pg));
};
TrakMap.prototype.deleteMilestone = function (milestone) {
    this.makeSafeModification(() => this.deleteMilestoneUnsafe(milestone));
};

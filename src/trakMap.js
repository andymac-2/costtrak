'use strict'

var TrakMap = function (obj) {
    // View
    this.elem = Draw.svgElem ("svg", {});

    //View model (calculated)
    this.rightMost = 0;
    this.bottom = 0;

    // graph elements (state)
    this.products = [];
    this.milestones = [];
    this.dependencies = [];
    this.priorityGroups = [];
    this.mode;

    // selections
    this.selection = null;
    this.selType = TrakMap.SELNOTHING;

    /** @type {Unclicker} */ this.unclicker = new Unclicker (this.elem);
    this.restore(obj);
};
TrakMap.HSPACE = 44;
TrakMap.MINPRODUCTWIDTH = 250;
TrakMap.UNITVALUEWIDTH = 3;
TrakMap.VSPACE = 70;
TrakMap.PRIORITYSPACE = 130;
TrakMap.MARGIN = 30;
TrakMap.PAGEMARGIN = 40;

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
    "mode": TrakMap.GREEDYMODE,
    "priorityGroups": [
        PriorityGroup.DEFAULTPRIORITYGROUP
    ]
}

TrakMap.prototype.save = function () {
    return {
        "mode": this.mode,
        "priorityGroups": this.priorityGroups,
        "products": this.products.map(product => product.save()),
        "milestones": this.milestones.map(milestone => milestone.save()),
        "dependencies": this.dependencies.map(dependency => dependency.save())
    };
};

TrakMap.prototype.restore = function (obj) {
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

    let width = this.getRight() - this.getLeft();
    let height = this.getBottom() - this.getTop();

    this.elem.setAttribute ("width", "" + width);
    this.elem.setAttribute ("viewBox", "" + 
        this.getLeft() + " " +
        this.getTop() + " " + 
        width + " " +
        height + " ");

    this.elem.innerHTML = "";

    let connections =  Draw.svgElem("g", {"class": "TMConnections"}, this.elem);
    let lines =  Draw.svgElem("g", {"class": "TMProducts"}, this.elem);
    let bubbles =  Draw.svgElem("g", {"class": "TMBubbles"}, this.elem);

    this.products.forEach (product => {
        product.drawLine(lines);
        product.drawBubble(bubbles);
    });
    this.milestones.forEach (milestone => milestone.draw(bubbles));
    this.dependencies.forEach (dependency => dependency.draw(connections));

    this.priorityGroups.forEach (priorityGroup => {
        priorityGroup.draw(lines);
    });

    return this.elem;
};

TrakMap.prototype.resolveCoordinates = function () {
    assert (() => this.mode === TrakMap.LAZYMODE || 
        this.mode === TrakMap.GREEDYMODE);

    if (this.mode === TrakMap.GREEDYMODE) {
        this.greedyResolve ();
    }
    if (this.mode === TrakMap.LAZYMODE) {
        this.lazyResolve ();
    }

    this.resolvePriorityLevels ();
    this.resolvePriorityGroupOffsets();
    this.resolveYValues ();

    // Step 2: resolve x coordinates
    this.resolveXValues();
};
// Resolving X values. The following properties should hold true:
// 1. Date bubbles and milestones must be in order. Date bubbles with lower
//    values must appear strictly left of those with higher values.
// 2. Date bubbles/milestones with the same date should appear with the same
//    horizontal position
// 3. Products have a minimum width, which should not be violated. The minimum X
//    value is given by the getMinEndX() method of products/milestones once the
//    start X has been set.
// 4. Date bubbles/milestones must appear with a minimum distance apart given by
//    the formula: (TrakMap.HSPACE + dateDifference * Trakmap.UNITVLUEWIDTH)
//
// This prevents dates which are obviously too far apart in time appearing too
//    close to each other on the diagram. It also allocates enough width to
//    display product titles and other data.
TrakMap.prototype.resolveXValues = function () {
    var heap = new MinHeap(Product.compareEnds);
    var cursor = 0;
    this.rightMost = 0;
    let sortedProducts = this.products
        .concat(this.milestones)
        .sort(Product.compare);
    let lastValue = sortedProducts[0].getStartValue();

    sortedProducts.forEach(product => {
        // go through heap elements <= our current value, heap
        // elements should be traversed with priority.
        while (!heap.empty() &&
            (heap.getMin().getEndValue() <= product.getStartValue()))
        {
            var min = heap.getMin();
            if (lastValue !== min.getEndValue()) {
                let oldLast = lastValue;
                lastValue = min.getEndValue();
                cursor += TrakMap.HSPACE +
                    (lastValue - oldLast) * TrakMap.UNITVALUEWIDTH;
                cursor = Math.max(cursor, min.getMinEndX());
            }
            this.rightMost = Math.max(this.rightMost, cursor);
            min.setEndX(cursor);
            heap.deleteMin();
        }
        // add the product itself
        if (lastValue !== product.getStartValue()) {
            let oldLast = lastValue;
            lastValue = product.getStartValue();
            cursor += TrakMap.HSPACE +
                (lastValue - oldLast) * TrakMap.UNITVALUEWIDTH;
        }
        product.setStartX(cursor);
        heap.add(product);
    });
    var min;
    while (min = heap.deleteMin()) {
        if (lastValue !== min.getEndValue()) {
            let oldLast = lastValue;
            lastValue = min.getEndValue();
            cursor += TrakMap.HSPACE +
                (lastValue - oldLast) * TrakMap.UNITVALUEWIDTH;
            cursor = Math.max(cursor, min.getMinEndX());
        }
        this.rightMost = Math.max(this.rightMost, cursor);
        min.setEndX(cursor);
    }
};
TrakMap.prototype.lazyResolve = function () {
    assert (() => this.mode === TrakMap.LAZYMODE);
    this.products.forEach(prod => {
        if (!prod.hasValidDependents()) {
            throw new HangingDependencyError (
                'Product "' + prod.name + '" has no dependents in lazy mode.');
        }
    });

    nodeWeightedGraph.lazySort(this.products);
};
TrakMap.prototype.greedyResolve = function () {
    assert (() => this.mode === TrakMap.GREEDYMODE);
    this.products.forEach(prod => {
        if (!prod.hasValidDependencies()) {
            throw new HangingDependencyError (
                'Product "' + prod.name + '" has no dependencies in greedy mode.');
        }
    });

    nodeWeightedGraph.greedySort(this.products);
};

TrakMap.prototype.resolvePriorityGroupOffsets = function () {
    this.priorityGroups.length;
    
    let boundary = TrakMap.MARGIN;
    this.priorityGroups.forEach (priorityGroup => {
        priorityGroup.yOffset = boundary - priorityGroup.minLevel * TrakMap.VSPACE;
        
        let levelDiff = priorityGroup.maxLevel - priorityGroup.minLevel;
        boundary += TrakMap.VSPACE * levelDiff + TrakMap.PRIORITYSPACE;
    });
    this.bottom = boundary;
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
TrakMap.prototype.drawPriorityGroupSelector = function(onchange, attrs, parent){
    let entries = this.priorityGroups.map(priorityGroup => priorityGroup.name);
    Draw.dropDown ((evt) => {
        onchange(this.priorityGroups[evt.currentTarget.value])
    }, entries, attrs, parent);
};
// queries
TrakMap.prototype.getTop = function () {
    return -TrakMap.MARGIN -PriorityGroup.TOPMARGIN;
};
TrakMap.prototype.getLeft = function () {
    return -PriorityGroup.LEFTMARGIN - TrakMap.MARGIN;
};
TrakMap.prototype.getRight = function () {
    return this.rightMost + PriorityGroup.LEFTMARGIN + TrakMap.MARGIN;
};
TrakMap.prototype.getBottom = function () {
    return this.bottom;
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
TrakMap.prototype.newMilestone = function (pgIndex, value, level) {
    return this.addMilestone({
        "priorityGroup": pgIndex,
        "value": value,
        "level": level
    });
}; 
TrakMap.prototype.addDependency = function (obj) {
    let dep =  new Dependency (this, this.dependencies.length, obj);
    this.dependencies.push(dep);
    return dep;
};
TrakMap.prototype.newDependency = function (dependency, dependent) {
    let dependencyType = dependency instanceof Product ? 
        Dependency.PRODUCT : Dependency.MILESTONE;
    let dependentType = dependent instanceof Product ?
        Dependency.PRODUCT : Dependency.MILESTONE;
    
    return this.addDependency ({
        "dependencyType": dependencyType,
        "dependency": dependency.index,
        "dependentType": dependentType,
        "dependent": dependent.index
    });
};
TrakMap.prototype.setAllDirections = function (dir) {
    assert (() => dir === Product.GOINGDOWN || dir === Product.GOINGUP);
    this.products.forEach (prod => prod.setDirection(dir));
    this.milestones.forEach (milestone => milestone.setDirection(dir));
};

// unsafe methods may throw errors. When an error is thrown, the
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
        if (!NDEBUG) {
            throw e;
        }
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
TrakMap.prototype.toggleMode = function () {
    if (this.mode === TrakMap.GREEDYMODE) {
        this.setMode(TrakMap.LAZYMODE);
    }
    else if (this.mode === TrakMap.LAZYMODE) {
        this.setMode(TrakMap.GREEDYMODE);
    }
};
TrakMap.prototype.setMode = function (mode) {
    this.makeSafeModification(() => this.setModeUnsafe(mode));
};
TrakMap.prototype.setModeUnsafe = function (mode) {
    assert (() => mode === TrakMap.GREEDYMODE || 
        mode === TrakMap.LAZYMODE);

    this.mode = mode;

    if (this.mode === TrakMap.GREEDYMODE) {
        this.products.forEach (product => {
            if (product.hasValidDependencies()) {
                return;
            }

            let milestone = this.newMilestone (product.priorityGroup.index, 
                product.getStartValue(), product.level);
            this.newDependency(milestone, product);
        });
    }

    if (this.mode === TrakMap.LAZYMODE) {
        this.products.forEach (product => {
            if (product.hasValidDependents()) {
                return;
            }

            let milestone = this.newMilestone (product.priorityGroup.index, 
                product.getEndValue(), product.level);
            this.newDependency(product, milestone);

            assert (() => product.hasValidDependents());
        });
    }
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


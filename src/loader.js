'use strict'

/** @constructor
    @struct */
var Loader = function (parent) {
    //view
    /** @type {Element} */ 
    this.elem = Draw.htmlElem ("div", {
        "class": "trakMapContainer"
    }, parent);

    /** @type {MilestoneMap} */ this.trakMap;
    /** @type {Element} */ this.parent = parent;

    // Util.throttleEvent (window, "resize", this.draw.bind(this), 100);

    this.newFile();
};

Loader.prototype.save = function () {
    var string = JSON.stringify(this.trakMap.save(), null, "    ");
    // TODO: trakmap name
    Util.download (this.trakMap.name + ".json", string, "application/json",
                   this.elem);
};

Loader.prototype.restore = function (string) {
    var obj = JSON.parse(string);
    this.trakMap = new TrakMap(obj);
};

Loader.prototype.draw = function () {
    this.elem.innerHTML = "";
    
    var menubar = Draw.htmlElem ("div", {
        "class": "menubar"
    }, this.elem);

    var fileSegment = Draw.menuBarSegment("File", menubar);
    Draw.iconBar ([{
        icon: "icons/new.svg",
        action: this.newFile.bind(this)
    }, {
        icon: "icons/open.svg",
        action: this.loadFile.bind(this)
    }, {
        icon: "icons/save.svg",
        action: this.save.bind(this)
    }], {}, fileSegment.body);

    let priorityGroupSegment = Draw.menuBarSegment("Group", menubar);
    Draw.iconBar([{
         icon: "icons/plus.svg",
        action: () => this.trakMap.newPriorityGroup()
    }], {}, priorityGroupSegment.body);

    let modeSegment = Draw.menuBarSegment("Mode", menubar);
    Draw.iconBar([{
         icon: "icons/arrow-two-left-right.svg",
        action: () => this.trakMap.toggleMode()
    }], {}, modeSegment.body);

    let printSegment = Draw.menuBarSegment ("Print", menubar);
    Draw.iconBar ([{
        icon: "icons/print.svg",
        action: this.print.bind(this)
    }], {}, printSegment.body);

    let aboutSegment = Draw.menuBarSegment ("About", menubar);
    Draw.iconBar ([{
        icon: "icons/info.svg",
        action: () => alert(Loader.aboutText)
    }, {
        icon: "icons/question.svg",
        action: () => window.open("https://andymac-2.github.io/trakmap/instructions")
    }], {}, aboutSegment.body);

    Draw.elem("div", {
        "class": "menuBarPlaceholder"
    }, this.elem);

    this.trakMap.draw(this.elem);
};

// user events
Loader.prototype.newFile = function () {
    this.trakMap = new TrakMap (TrakMap.NEWFILE);
    this.draw();
};

Loader.prototype.loadFile = function () {
    var restoreDraw = (string) => {
        try {
            this.restore(string);
            this.draw();
        }
        catch (e) {
            alert ("Error: Invalid file.");
            throw e;
        }
    };
    
    Util.upload (this.elem, restoreDraw, ".json");
};

Loader.prototype.print = function () {
    try {
        this.parent.innerHTML = ""
        this.trakMap.draw(this.parent);
        window.print();
        this.parent.innerHTML = "";
        this.parent.appendChild(this.elem);
    }
    catch (err) {
        Util.allertErr(err);
        throw err;
    }
};


/** @const {string} */ Loader.aboutText = `TrakMap, Version: ` + VERSION + `

For help and support, please visit:

https://andymac-2.github.io/trakmap/instructions



Copyright 2018 Andrew Pritchard

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
`;

'use strict'

class AssertionError extends Error {
    constructor (msg) {
        super ("Assertion failed : " + msg);
        this.name = "AssertionError"
    }
}

/** @define {boolean} */
var NDEBUG = false;

// runtime check, check for user errors.
var runTAssert = function (test) {
    if (test()) {
        return;
    }
    throw new AssertionError (test.toString());
};

// debug check
var assert = NDEBUG === true ? () => {} : runTAssert;

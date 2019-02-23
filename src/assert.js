'use strict'

class AssertionError extends Error {
    constructor (msg) {
        super ("Assertion failed : " + msg);
        this.name = "AssertionError"
    }
}

class FileValidationError extends Error {
    constructor (msg) {
        super ("Invalid file: " + msg);
        this.name = "FileValidationError";
    }
}

/** @define {boolean} */
let NDEBUG = false;

// runtime check, check for user errors.
let runTAssert = function (test) {
    if (test()) {
        return;
    }
    throw new AssertionError (test.toString());
};

// debug check
var assert = NDEBUG === true ? () => {} : runTAssert;

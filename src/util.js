'use strict'

// miscellaneous functions.

var Util = {};

Util.removeAtIndex = function (array, index) {
    array[index] = array[array.length - 1];
    array.pop();   
};

Util.removeFromArray = function (array, obj) {
    var index = array.indedxOf(obj);
    assert (() => index >= 0);

    array[index] = array[array.length - 1];
    array.pop();
};

Util.removeFromIndexedArray = function (array, obj) {
    assert (() => array[obj.index] = obj);
    var index = obj.index;

    array[index] = array[array.length - 1];
    array[index].index = index;
    array.pop();
};

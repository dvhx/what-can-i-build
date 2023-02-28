// Various functions
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.nameToType = function (aName, aCircuit) {
    // Converts PT7 to "pot_trimmer"
    var n = aName.match(/^[A-Z]+/)[0];
    if (SC.types[n]) {
        return SC.types[n];
    }
    alert("Unknown part type " + aName + ' in ' + aCircuit);
};



// Global variables
"use strict";
// globals: document, window

var SC = window.SC || {};

// All circuits specs loaded from circuit/circuits.js
// SC.circuit.bazz_fuss = {name: "", author: "", url: {...}, parts: {"R1": "1k", ...}}
SC.circuit = SC.circuit || {};

// Component name prefixes, used to sort component into correct section
SC.types = {
    "R": "resistor",
    "P": "pot",
    "PT": "pot_trimmer",
    "C": "capacitor",
    "L": "inductor",
    "D": "diode",
    "T": "transistor",
    "Q": "chip",
    "J": "connector",
    "S": "switch",
    "LDR": "ldr",
    "V": "tube",
    "U": "supply",
    "X": "other"
};

// Object with inputs for all sections and all components
// SC.values.capacitor['2n2'] = {label: ..., input: ...}
SC.values = {};

// User's component counts
// SC.counts.capacitor['2n2'] = 10
SC.counts = CA.storage.readObject('SC.counts', {});
if (Object.keys(SC.counts).length === 0) {
    SC.counts.supply = {"9": 10};
}

// User's done circuits
// SC.done['ampeg_scrambler'] = 1
SC.done = CA.storage.readObject('SC.done', {});

// User's seen circuits, used to show new circuits on startup
// SC.seen['ampeg_scrambler'] = 1
SC.seen = CA.storage.readObject('SC.seen', {});

// HTML Elements with id
// SC.e.sidebar = ...

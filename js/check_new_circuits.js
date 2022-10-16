// Dialog that alerts for new circuits
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.checkNewCircuits = function () {
    // alert user on new circuits
    var c, i, unseen = [], d, div; //, p, newparts = {};
    // compare circuits with seen ones
    for (c in SC.circuit) {
        if (SC.circuit.hasOwnProperty(c)) {
            if (!SC.seen[c]) {
                unseen.push({
                    key: c,
                    name: SC.circuit[c].name,
                    author: SC.circuit[c].author,
                    parts: Object.keys(SC.circuit[c].parts)
                });
                SC.seen[c] = 1;
            }
        }
    }
    //console.log(newparts);
    // if some unseen show dialog
    if (unseen.length > 0) {
        d = CA.modalDialog('New circuits!', 'There are ' + unseen.length + ' new circuits. Make sure you have parts counts updated!', ['OK'], function (aButton) {
            // Remember seen objects
            if (aButton === 'OK') {
                CA.storage.writeObject('SC.seen', SC.seen);
            }
        });
        // show few new circuit names
        d.content.style.padding = '1ex';
        for (i = 0; i < unseen.length; i++) {
            div = document.createElement('div');
            div.textContent = unseen[i].name + ' by ' + unseen[i].author;
            d.content.appendChild(div);
            if (i > 10) {
                div.textContent = '... and ' + (unseen.length - 10) + ' more';
                break;
            }
        }
    }
};


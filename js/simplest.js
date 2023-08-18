// Simplest pedals
"use strict";
// linter: lint-jshint
/* global window, document */

var SC = window.SC || {};

SC.partsComplexity = function (aParts) {
    // Group parts by type, 3R 5C 1T
    var o = {};
    Object.keys(aParts).forEach((k) => {
        var c = k.charAt(0);
        o[c] = o[c] || 0;
        o[c]++;
    });
    // Sort by letter and join letter+count
    var summary = Object.entries(o).sort(function (a, b) { return a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1;})
        .map(a => a[1] + a[0]).join(' ').replace('1U', '');
    return {
        complexity: Object.values(aParts).length - 1,
        summary
    };
};

SC.render = function (aPedal) {
    // Render one pedal
    var tr = document.createElement('tr'),
        complexity = document.createElement('td'),
        summary = document.createElement('td'),
        name = document.createElement('td');
    complexity.textContent = aPedal.complexity;
    summary.textContent = aPedal.summary;
    summary.title = JSON.stringify(aPedal.parts, undefined, 1).replace(/["\{\}]/g, '');
    name.textContent = aPedal.name + ' by ' + aPedal.author;

    tr.appendChild(complexity);
    tr.appendChild(summary);
    tr.appendChild(name);
    Object.entries(aPedal.url).forEach(([kind, url]) => {
        if (url && url.length > 0) {
            var a = document.createElement('a');
            a.textContent = kind;
            a.href = url;
            a.style.marginLeft = '1ex';
            name.appendChild(a);

        }
    });
    SC.output.appendChild(tr);
};

window.addEventListener('DOMContentLoaded', function () {
    var sorted = Object.values(SC.circuit).map((c) => {
        var com = SC.partsComplexity(c.parts);
        return {
            author: c.author,
            name: c.name,
            complexity: com.complexity,
            summary: com.summary,
            parts: c.parts,
            url: c.url
        };
    }).sort((a, b) => a.complexity - b.complexity);
    SC.output = document.getElementById('output');
    sorted.forEach(a => SC.render(a));
});

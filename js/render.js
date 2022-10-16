// Render one circuit
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.renderUrl = function (aTd, aIcon, aUrl) {
    // Render one url link with text
    if (!aUrl) {
        return;
    }
    var a = document.createElement('a');
    a.href = aUrl;
    a.textContent = aIcon;
    a.target = '_blank';
    a.style.display = 'block';
    aTd.appendChild(a);
};

SC.complexity = function (aCircuit) {
    // Return summary of circuit complexity, e.g.  6: 2C 1D 1P 1R 1T
    var u = {}, k, prefix, arr = [], t = 0;
    for (k in aCircuit.parts) {
        if (aCircuit.parts.hasOwnProperty(k)) {
            prefix = k.match(/^[A-Z]+/)[0];
            if (prefix === 'U') {
                continue;
            }
            u[prefix] = u[prefix] || 0;
            u[prefix]++;
            t++;
        }
    }
    for (k in u) {
        if (u.hasOwnProperty(k)) {
            arr.push({type: k, count: u[k]});
        }
    }
    return arr.sort(function (a, b) {
        return a.type === b.type ? 0 : a.type < b.type ? -1 : 1;
    }).map(function (a) {
        return a.count + a.type;
    }).join(' ');
};

SC.renderOne = function (unused, aCircuit, aErrors, aWarnings) {
    // Render one circuit and it's errors or warnings
    var tr, td, e, w, done, k, a, b, span, lc;
    tr = document.createElement('tr');
    // links
    td = document.createElement('td');
    for (k in aCircuit.url) {
        if (aCircuit.url.hasOwnProperty(k)) {
            //console.log(td, k, aCircuit.url[k]);
            SC.renderUrl(td, k, aCircuit.url[k]);
        }
    }
    tr.appendChild(td);
    // name
    td = document.createElement('td');
    tr.appendChild(td);
    td.className = 'full';
    b = document.createElement('b');
    b.textContent = aCircuit.name;
    td.appendChild(b);
    // author
    if (aCircuit.author) {
        span = document.createElement('span');
        span.textContent = ' by ';
        td.appendChild(span);
        b = document.createElement('b');
        b.textContent = aCircuit.author;
        td.appendChild(b);
    }
    // errors
    if (aErrors.length > 0) {
        e = document.createElement('div');
        e.className = 'error';
        e.textContent = 'Missing(' + aErrors.length + '): ' + aErrors.join(', ');
        td.appendChild(e);
    }
    // warnings
    if (aWarnings.length > 0) {
        w = document.createElement('div');
        w.className = 'warning';
        w.textContent = aWarnings.join(', ');
        w.title = "Substitutions";
        td.appendChild(w);
    }
    // complexity
    td = document.createElement('td');
    b = document.createElement('b');
    b.textContent = Object.keys(aCircuit.parts).length + ': ';
    td.appendChild(b);
    td.appendChild(document.createTextNode(SC.complexity(aCircuit)));
    tr.appendChild(td);
    // actions
    td = document.createElement('td');
    lc = CA.labelCheckbox(td, 'done', SC.done[aCircuit.key]);
    lc.checkbox.onclick = function () {
        if (lc.checkbox.checked) {
            SC.done[aCircuit.key] = 1;
        } else {
            delete SC.done[aCircuit.key];
        }
        CA.storage.writeObject('SC.done', SC.done);
    };
    tr.appendChild(td);
    return tr;
};


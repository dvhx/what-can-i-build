// Search single part
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.singlePartSearch = function (aPart) {
    // Search circuits with this part
    var c, p, i, a, u = {}, r, url, name;
    for (c in SC.circuit) {
        if (SC.circuit.hasOwnProperty(c)) {
            for (p in SC.circuit[c].parts) {
                if (SC.circuit[c].parts.hasOwnProperty(p)) {
                    a = SC.circuit[c].parts[p];
                    if (!Array.isArray(a)) {
                        a = [a];
                    }
                    for (i = 0; i < a.length; i++) {
                        if (a[i] === aPart) {
                            url = '';
                            for (r in SC.circuit[c].url) {
                                if (SC.circuit[c].url.hasOwnProperty(r)) {
                                    url = url || SC.circuit[c].url[r];
                                }
                            }
                            name = SC.circuit[c].name + ' by ' + SC.circuit[c].author;
                            u[c] = {name: name, url: url}; //'- [' + name + '](' + url + ')';
                        }
                    }
                }
            }
        }
    }
    r = Object.values(u).sort(function (o1, o2) {
        return o1.name === o2.name ? 0 : (o1.name < o2.name ? -1 : 1);
    });
    console.log(r);
    return r;
};

window.addEventListener('DOMContentLoaded', function () {
    SC.e = {
        count: document.getElementById('count'),
        output: document.getElementById('output'),
        name: document.getElementById('name')
    };
    SC.e.count.textContent = Object.keys(SC.circuit).length;
    SC.e.name.onchange = function () {
        SC.e.output.textContent = '';
        var i, a, r = SC.singlePartSearch(SC.e.name.value);
        for (i = 0; i < r.length; i++) {
            a = document.createElement('a');
            a.href = r[i].url;
            a.textContent = r[i].name;
            SC.e.output.appendChild(a);
        }
        console.log('r', r);
    };
    var c, p, u = {}, a, i, f, o, url_part = document.location.search.replace('?part=', '');
    for (c in SC.circuit) {
        if (SC.circuit.hasOwnProperty(c)) {
            for (p in SC.circuit[c].parts) {
                if (SC.circuit[c].parts.hasOwnProperty(p)) {
                    f = p.charAt(0);
                    if (f === 'C' || f === 'R' || f === 'U' || f === 'P') {
                        continue;
                    }
                    a = SC.circuit[c].parts[p];
                    if (!Array.isArray(a)) {
                        a = [a];
                    }
                    for (i = 0; i < a.length; i++) {
                        u[a[i]] = 1;
                    }
                }
            }
        }
    }
    u = Object.keys(u).sort();
    for (i = 0; i < u.length; i++) {
        o = document.createElement('option');
        o.value = u[i];
        o.textContent = u[i];
        o.selected = u[i] === url_part;
        //console.log(u[i]);
        SC.e.name.appendChild(o);
    }
    SC.e.name.onchange();
});


// Various statistics
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.stats = SC.stats || {};

SC.stats.values = function () {
    // all circuits
    var k, c, n, t, val, v, ret = {}, ret2 = {}, a;
    for (k in SC.circuit) {
        if (SC.circuit.hasOwnProperty(k)) {
            c = SC.circuit[k];
            // all parts
            for (n in c.parts) {
                if (c.parts.hasOwnProperty(n)) {
                    t = SC.nameToType(n, k);
                    ret[t] = ret[t] || {};
                    // all values
                    val = Array.isArray(c.parts[n]) ? c.parts[n] : [c.parts[n]];
                    for (v = 0; v < val.length; v++) {
                        ret[t][val[v]] = ret[t][val[v]] || 0;
                        ret[t][val[v]]++;
                    }
                }
            }
        }
    }
    // sort by count
    function sortByCount(x, y) {
        return y.count - x.count;
    }
    for (t in ret) {
        if (ret.hasOwnProperty(t)) {
            a = [];
            for (v in ret[t]) {
                if (ret[t].hasOwnProperty(v)) {
                    a.push({value: v, count: ret[t][v]});
                }
            }
            ret2[t] = a.sort(sortByCount);
        }
    }
    return ret2;
};

window.addEventListener('DOMContentLoaded', function () {
    var p = SC.stats.values(), i, t,
        table = document.createElement('table'),
        tr1 = document.createElement('tr'),
        th,
        tr2 = document.createElement('tr'),
        tr3 = document.createElement('tr'),
        td1,
        td2,
        div;
    table.appendChild(tr1);
    table.appendChild(tr2);
    table.appendChild(tr3);
    document.body.appendChild(table);
    for (t in p) {
        if (p.hasOwnProperty(t)) {
            // type
            th = document.createElement('th');
            th.textContent = t;
            th.setAttribute('colspan', 2);
            th.style.borderRight = '1px solid black';
            tr1.appendChild(th);
            // value, count
            th = document.createElement('th');
            th.textContent = 'value';
            tr2.appendChild(th);
            th = document.createElement('th');
            th.textContent = 'count';
            th.style.borderRight = '1px solid black';
            tr2.appendChild(th);
            // value + count
            td1 = document.createElement('td');
            tr3.appendChild(td1);
            td2 = document.createElement('td');
            td2.style.borderRight = '1px solid black';
            tr3.appendChild(td2);
            for (i = 0; i < p[t].length; i++) {
                // value
                div = document.createElement('div');
                div.textContent = p[t][i].value;
                td1.appendChild(div);
                // count
                div = document.createElement('div');
                div.textContent = p[t][i].count;
                td2.appendChild(div);
            }
        }
    }
});

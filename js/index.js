// Main page
"use strict";
// globals: document, window, CA

var SC = window.SC || {};

SC.nameToType = function (aName, aCircuit) {
    // Converts PT7 to "pot_trimmer"
    var n = aName.match(/^[A-Z]+/)[0];
    if (SC.types[n]) {
        return SC.types[n];
    }
    alert("Unknown part type " + aName + ' in ' + aCircuit);
};

SC.refresh = function () {
    // Refresh view of possible circuits after counts update or checkbox change
    var f = SC.filter(SC.circuit, SC.counts),
        opa,
        can = 0,
        rows = 0,
        total = Object.keys(SC.circuit).length;

    SC.e.table_ok.textContent = '';

    opa = SC.e.filter_show_done.checked ? 0.5 : 1;
    SC.e.filter_show_possible.parentElement.style.opacity = opa;
    SC.e.filter_show_subs.parentElement.style.opacity = opa;

    f.forEach(function (a) {
        var tr;
        if (SC.e.filter_show_done.checked) {
            if (SC.done[a.key]) {
                tr = SC.renderOne(a.key, a.circuit, a.errors, a.warnings);
                SC.e.table_ok.appendChild(tr);
            }
            return;
        }
        if (SC.done[a.key]) {
            return;
        }
        if (SC.e.filter_show_possible.checked && a.errors.length > 0) {
            return;
        }
        if (!SC.e.filter_show_possible.checked && a.errors.length <= 0) {
            return;
        }
        if (!SC.e.filter_show_subs.checked && a.warnings.length > 0) {
            return;
        }
        tr = SC.renderOne(a.key, a.circuit, a.errors, a.warnings);
        rows++;
        SC.e.table_ok.appendChild(tr);
        // count possible to build circuits
        if (a.errors.length === 0) {
            if (!SC.done[a.key]) {
                can++;
            }
        }
    });
    SC.e.total_count.textContent = '(' + can + '/' + total + ')';
    SC.e.total_count.title = 'You can build ' + can + ' of total ' + total + ' circuits';
    SC.e.nothing.style.display = (rows <= 0 && !SC.e.filter_show_done.checked) ? 'block' : 'none';
    //SC.lastFilter = f;
};

SC.onUpdateCount = function (event) {
    // Save user's updated parts count in sidebar
    var type = event.target.dataType,
        value = event.target.dataValue,
        count = event.target.value;
    SC.counts[type] = SC.counts[type] || {};
    SC.counts[type][value] = parseInt(count, 10);
    SC.refresh();
    CA.storage.writeObject('SC.counts', SC.counts);
};

SC.createLabelInput = function (aType, aValue) {
    // Create one label+input for odd one part type and value
    var label, span, input;
    // label
    label = document.createElement('label');
    label.className = 'type_' + aType + '_' + aValue;
    // span
    span = document.createElement('span');
    span.textContent = aValue.toString().replace('DARLINGTON', 'DARL');
    if (span.textContent.length > 8) {
        span.style.fontSize = 'x-small';
    }
    label.appendChild(span);
    // input
    input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.max = 100;
    input.step = 10;
    input.dataType = aType;
    input.dataValue = aValue;
    input.addEventListener('change', SC.onUpdateCount);
    input.addEventListener('input', SC.onUpdateCount);
    input.value = (SC.counts[aType] && SC.counts[aType][aValue]) || '';
    label.appendChild(input);
    return {
        label: label,
        span: span,
        input: input
    };
};

SC.showParts = function () {
    // Show parts and user counts for all circuits
    var k, c, n, t, v, a, val, use_eng, sec, i;
    // all circuits
    for (k in SC.circuit) {
        if (SC.circuit.hasOwnProperty(k)) {
            c = SC.circuit[k];
            // all parts
            for (n in c.parts) {
                if (c.parts.hasOwnProperty(n)) {
                    t = SC.nameToType(n, k);
                    if (!SC.e['type_' + t]) {
                        alert('Type ' + t + ' has no section');
                    }
                    // all values
                    val = Array.isArray(c.parts[n]) ? c.parts[n] : [c.parts[n]];
                    for (v = 0; v < val.length; v++) {
                        if (!SC.values[t]) {
                            SC.values[t] = {};
                        }
                        if (!SC.values[t][val[v]]) {
                            SC.values[t][val[v]] = SC.createLabelInput(t, val[v]);
                        }
                    }
                }
            }
        }
    }
    function value_compare(x, y) {
        // sorting function
        if (x.value === y.value) {
            return 0;
        }
        return x.value < y.value ? -1 : 1;
    }
    // short inputs by value and add them to correct section
    for (t in SC.values) {
        if (SC.values.hasOwnProperty(t)) {
            a = [];
            use_eng = t === 'capacitor' || t === 'resistor' || t === 'pot' || t === 'pot_trimmer';
            for (v in SC.values[t]) {
                if (SC.values[t].hasOwnProperty(v)) {
                    // convert engineering values 4k7 to 4700
                    val = v;
                    if (use_eng) {
                        val = SC.fromEng(v.replace(' Stereo', ''));
                    }
                    a.push({v: v, value: val, li: SC.values[t][v]});
                }
            }
            // add them to sections
            sec = SC.e['type_' + t];
            a = a.sort(value_compare);
            for (i = 0; i < a.length; i++) {
                sec.appendChild(a[i].li.label);
            }
        }
    }
};

SC.plusTenAll = function (event) {
    // Increase all in the next section by 10
    var v, t = event.target.parentElement.nextElementSibling.id.replace('type_', '');
    if (!confirm('Increase all ' + t + ' counts by 10?')) {
        return;
    }
    for (v in SC.values[t]) {
        if (SC.values[t].hasOwnProperty(v)) {
            SC.counts[t] = SC.counts[t] || {};
            SC.counts[t][v] = SC.counts[t][v] || 0;
            SC.counts[t][v] += 10;
            SC.values[t][v].input.value = SC.counts[t][v];
        }
    }
    CA.storage.writeObject('SC.counts', SC.counts);
    SC.refresh();
};

SC.exact = function (aPartsCounts) {
    // Find exact parts counts, e.g. {P:3, S:1} will find anything with 3 pots and 1 switch
    var k, c = {}, j, ok, z, ret = [], url;
    for (k in SC.circuit) {
        if (SC.circuit.hasOwnProperty(k)) {
            c = {};
            for (j in SC.circuit[k].parts) {
                if (SC.circuit[k].parts.hasOwnProperty(j)) {
                    z = j.match(/^[A-Z]+/)[0];
                    c[z] = c[z] || 0;
                    c[z]++;
                }
            }
            ok = true;
            for (j in aPartsCounts) {
                if (aPartsCounts.hasOwnProperty(j)) {
                    if (c[j] !== aPartsCounts[j]) {
                        ok = false;
                    }
                }
            }
            if (ok) {
                console.log(SC.circuit[k].name, SC.circuit[k].parts);
                url = '';
                for (j in SC.circuit[k].url) {
                    if (SC.circuit[k].url.hasOwnProperty(j)) {
                        if (SC.circuit[k].url[j] !== '') {
                            url = SC.circuit[k].url[j];
                            break;
                        }
                    }
                }
                ret.push('- [' + k + '](' + url + ')');
            }
        }
    }
    console.log(ret.join('\n'));
};

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
                            u[c] = '- [' + name + '](' + url + ')';
                        }
                    }
                }
            }
        }
    }
    r = Object.values(u).sort().join('\n');
    console.log(r);
    return u;
};

window.addEventListener('DOMContentLoaded', function () {
    SC.e = CA.elementsWithId();
    SC.e.filter_show_possible.onclick = SC.refresh;
    SC.e.filter_show_subs.onclick = SC.refresh;
    SC.e.filter_show_done.onclick = SC.refresh;
    SC.e.plus_10_resistor.onclick = SC.plusTenAll;
    SC.e.plus_10_capacitor.onclick = SC.plusTenAll;
    SC.showParts();
    SC.refresh();
    SC.checkNewCircuits();
});


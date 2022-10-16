// Filter circuits I can build depending on my parts counts
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.filter = function (aCircuits, aCounts) {
    // Filter circuits I can build depending on my parts counts
    //console.log(aCircuits, aCounts);
    var k, c, n, t, remain, missing, missing2, has_alternative, v, val, notes, result = [];
    // all circuits
    for (k in aCircuits) {
        if (aCircuits.hasOwnProperty(k)) {
            c = aCircuits[k];
            c.key = k;
            //console.warn(k);
            remain = JSON.parse(JSON.stringify(aCounts));
            missing = {};
            notes = [];
            // all parts
            for (n in c.parts) {
                if (c.parts.hasOwnProperty(n)) {
                    t = SC.nameToType(n, k);
                    // must have at least one value
                    val = c.parts[n];
                    if (!Array.isArray(val)) {
                        val = [val];
                    }
                    // check all values
                    missing2 = [];
                    has_alternative = false;
                    for (v = 0; v < val.length; v++) {
                        if (remain[t] && remain[t][val[v]]) {
                            remain[t][val[v]]--;
                            //console.log('has', t, n, val[v], remain[t][val[v]]);
                            has_alternative = true;
                            if (v > 0) {
                                //notes.push('Using alternative ' + t + ' ' + val[v] + ' instead of ' + val[0]);
                                notes.push(val[0] + '➜' + val[v]);
                            }
                            break;
                        }
                        //console.log('has not', t, n, val[v]);
                        missing2[t + ' ' + val[v]] = missing2[t + ' ' + val[v]] || 0;
                        missing2[t + ' ' + val[v]]++;
                    }
                    if (!has_alternative && (Object.keys(missing2).length > 0)) {
                        missing[Object.keys(missing2).join(' or ')] = 1;
                    }
                }
            }
            //console.log('missing', Object.keys(missing).sort());
            //console.log('notes', notes);
            result.push({
                key: k,
                name: c.name,
                circuit: c,
                errors: Object.keys(missing).sort(),
                warnings: notes,
                parts_count: Object.keys(c.parts).length
            });
        }
    }
    // sort ascending by errors count
    result.sort(function (a, b) {
        if (a.errors.length === b.errors.length) {
            return a.parts_count - b.parts_count;
        }
        return a.errors.length - b.errors.length;
    });
    return result;
};



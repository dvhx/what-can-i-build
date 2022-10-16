// Converting from and to engineering values (4.7k or 4k7 -> 4700)
"use strict";
// globals: document, window

var SC = window.SC || {};

SC.fromEng = function (aValue) {
    // convert 4.7k to 4700
    if (aValue === undefined || aValue === 0 || aValue === null) {
        return aValue;
    }

    var suffix, k, m, q, z, v = aValue.toString(),
        multiplier = {
            k: 1e3,
            M: 1e6,
            G: 1e9,
            T: 1e12,
            m: 1e-3,
            u: 1e-6,
            n: 1e-9,
            p: 1e-12
        };

    // XkY
    m = v.match(/^([0-9]+)([kMGTmunp])([0-9]+)$/);
    if (m) {
        q = multiplier[m[2]];
        z = parseFloat(m[3]);
        //console.log(m[3].length);
        if (m[3].length >= 1) {
            q /= 10;
        }
        if (m[3].length >= 2) {
            q /= 10;
        }
        if (m[3].length >= 3) {
            q /= 10;
        }
        if (m[3].length >= 4) {
            throw "Unsupported format " + aValue;
        }
        //console.log({z, q});
        return parseFloat(m[1]) * multiplier[m[2]] + z * q;
    }

    suffix = v.substr(-1);
    k = multiplier[suffix] || 1;
    if (k !== 1) {
        v = v.substr(0, v.length - 1);
    }
    return parseFloat(v) * k;
};

SC.toEng = function (aReal) {
    // convert 1234.5678 to 1.23k
    if (aReal === undefined || aReal === 0 || aReal === null) {
        return aReal;
    }
    var orig = aReal, sign = aReal < 0 ? '-' : '';
    aReal = Math.abs(aReal);
    function out(x) {
        //console.log('x', x);
        return sign + parseFloat(x.toPrecision(3)).toString();
    }
    function out2(x, c) {
        if (x < 10) {
            if (x.toFixed(3).includes('.000')) {
                return out(x) + c;
            }
            return out(x).replace('.', c);
        }
        return out(x) + c;
    }
    if ((aReal >= 1) && (aReal < 1000)) {
        return out(aReal);
    }

    if (aReal >= 1000) {
        aReal = aReal / 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out2(aReal, 'k');
        }
        aReal = aReal / 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out2(aReal, 'M');
        }
        aReal = aReal / 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out2(aReal, 'G');
        }
        aReal = aReal / 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out2(aReal, 'T');
        }
    }
    if (aReal < 1) {
        aReal = aReal * 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out(aReal) + 'm';
        }
        aReal = aReal * 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out2(aReal, 'u');
        }
        aReal = aReal * 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out2(aReal, 'n');
        }
        aReal = aReal * 1000;
        if ((aReal >= 1) && (aReal < 1000)) {
            return out2(aReal, 'p');
        }
    }
    return out(orig);
};

// small test set
/*
if (SC.toEng(1) !== '1') { throw "toEng failed 1"; }
if (SC.toEng(10) !== '10') { throw "toEng failed 2"; }
if (SC.toEng(100) !== '100') { throw "toEng failed 3"; }
if (SC.toEng(1000) !== '1k') { throw "toEng failed 4"; }
if (SC.toEng(10000) !== '10k') { throw "toEng failed 5"; }
if (SC.toEng(100000) !== '100k') { throw "toEng failed 6"; }
if (SC.toEng(1000000) !== '1M') { throw "toEng failed 7"; }
if (SC.toEng(10000000) !== '10M') { throw "toEng failed 8"; }
if (SC.toEng(100000000) !== '100M') { throw "toEng failed 9"; }
if (SC.toEng(1000000000) !== '1G') { throw "toEng failed 10"; }

if (SC.toEng(1.5) !== '1.5') { throw "toEng failed 11"; }
if (SC.toEng(15) !== '15') { throw "toEng failed 12"; }
if (SC.toEng(150) !== '150') { throw "toEng failed 13"; }
if (SC.toEng(1500) !== '1k5') { throw "toEng failed 14"; }
if (SC.toEng(15000) !== '15k') { throw "toEng failed 15"; }
if (SC.toEng(150000) !== '150k') { throw "toEng failed 16"; }
if (SC.toEng(1500000) !== '1M5') { throw "toEng failed 17"; }
if (SC.toEng(15000000) !== '15M') { throw "toEng failed 18"; }
if (SC.toEng(150000000) !== '150M') { throw "toEng failed 19"; }
if (SC.toEng(1500000000) !== '1G5') { throw "toEng failed 20"; }
*/

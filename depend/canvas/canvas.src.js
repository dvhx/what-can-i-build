// Canvas (custom build 2023-02-19--14-58-04)
"use strict";
// globals: document, window

var CA = window.CA || {};

// file: browser.js
// Detect browser type, version and capabilities
// globals: document, window, navigator
// require: defaults
// provide: browser


CA.browser = (function () {
    var self = {}, ua = window.navigator.userAgent, m;

    // defaults
    self.chrome = false;
    self.type = undefined;
    self.msie = false;
    self.firefox = false;
    self.msie = false;
    self.edge = false;
    self.safari = false;
    self.version = undefined;
    self.blur = true;
    self.language = 'en';
    self.touch = navigator.maxTouchPoints > 0;
    self.android = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    self.iphone = navigator.userAgent.toLowerCase().indexOf("iPhone") > -1;
    self.ios = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    self.windows = navigator.platform === 'Win32';
    self.linux = navigator.platform.match(/linux/i);

    // Detect user language from browser or language param
    (function () {
        var br = (navigator.languages && navigator.languages[0].substr(0, 2)) || (navigator.language && navigator.language.substr(0, 2)),
            param = CA.defaults && CA.defaults.language && CA.defaults.language.value;
        if (CA.defaults && CA.defaults.language && CA.defaults.language.fromUrl) {
            self.language = param || br;
            return;
        }
        self.language =  br || param;
    }());

    // IE 10 or older
    m = ua.indexOf('MSIE ');
    if (m > 0) {
        self.type = 'msie';
        self.msie = true;
        self.blur = false;
        self.version = parseInt(ua.substring(m + 5, ua.indexOf('.', m)), 10);
    }
    // IE 11
    m = ua.indexOf('Trident/');
    if (m > 0) {
        m = ua.indexOf('rv:');
        self.type = 'msie';
        self.msie = true;
        self.blur = false;
        self.version = parseInt(ua.substring(m + 3, ua.indexOf('.', m)), 10);
    }
    // EDGE (IE 12+)
    m = ua.indexOf('Edge/');
    if (m > 0) {
        self.type = 'edge';
        self.msie = true;
        self.edge = true;
        self.blur = false;
        self.version = parseInt(ua.substring(m + 5, ua.indexOf('.', m)), 10);
    }

    // Firefox
    m = window.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
    if (m) {
        self.type = 'firefox';
        self.firefox = true;
        self.blur = true;
        self.version = parseInt(m[1], 10);
    }

    // Chrome
    m = window.navigator.userAgent.match(/Chrome\/([0-9]+)\./);
    if (m) {
        self.type = 'chrome';
        self.chrome = true;
        self.blur = true;
        self.version = parseInt(m[1], 10);
    }

    // Safari
    m = window.navigator.userAgent.match(/Safari\/([0-9]+)\./);
    if (m && (window.safari !== undefined)) {
        self.type = 'safari';
        self.safari = true;
        self.blur = true;
        self.version = parseInt(m[1], 10);
    }

    // other browser
    return self;
}());


// file: modal_dialog.js
// Modal dialog with message and buttons
// globals: document, window
// require: translations, browser
// provide: modal, modalDialog


CA.modalDialog = function (aTitle, aMessage, aButtons, aCallback) {
    // Modal dialog with message and buttons
    var m, c, i, p, nav, b, orig = [], buttonPressed = false, content,
        lang = (CA.browser && CA.browser.language) || 'en',
        t = CA.translations && CA.translations[lang];

    if (typeof aButtons === 'string') {
        aButtons = aButtons.split(',');
    }
    orig = aButtons.slice(); // slice is shallow and buttons are strings

    // translate
    if (t && t.modal && t.modal[aTitle]) {
        t = t.modal[aTitle];
        if (!t.message) {
            console.warn('CA.translations.' + lang + '.' + aTitle + '.message is missing');
        }
        aMessage = t.message || aMessage;
        if (!t.buttons) {
            console.warn('modalDialog ' + aTitle + ' has no buttons in ' + lang);
        } else {
            for (i = 0; i < aButtons.length; i++) {
                if (t.buttons.hasOwnProperty(aButtons[i])) {
                    aButtons[i] = t.buttons[aButtons[i]];
                } else {
                    console.warn('modalDialog ' + aTitle + ' has no button ' + aButtons[i] + ' in ' + lang);
                }
            }
        }
    }

    function onClose() {
        // Close without choice
        if (!buttonPressed && aCallback) {
            aCallback();
        }
    }
    m = CA.modal(aTitle || '', onClose);
    // content (above buttons)
    content = document.createElement('div');
    content.className = 'ca_content';
    content.style.overflowY = 'auto';
    m.content = content;
    m.div.appendChild(content);
    m.div.style.display = 'flex';
    m.div.style.flexDirection = 'column';
    m.div.style.overflowY = 'auto';
    m.div.style.maxHeight = '100vh';
    // container
    c = document.createElement('div');
    c.className = 'ca_buttons';
    c.style.textAlign = 'center';
    c.style.padding = '0 1ex 1ex 1ex';
    m.container = c;
    m.div.appendChild(c);
    // message
    if (aMessage) {
        p = document.createElement('div');
        p.textContent = aMessage;
        p.style.padding = '1em';
        content.appendChild(p);
        m.message = p;
    }
    function onClick(event) {
        if (!aCallback) {
            buttonPressed = true;
            m.close.click();
            return;
        }
        if (aCallback(event.target.dataItem, event.target.dataIndex) !== false) {
            buttonPressed = true;
            m.close.click();
        }
    }
    if (aButtons) {
        nav = document.createElement('div');
        nav.style.display = 'flex';
        nav.style.justifyContent = 'center';
        m.buttonsDiv = nav;
        m.buttons = {};
        c.appendChild(nav);
        for (i = 0; i < aButtons.length; i++) {
            b = document.createElement('button');
            b.dataItem = orig[i];
            b.dataIndex = i;
            b.textContent = aButtons[i];
            b.onclick = onClick;
            m.buttons[orig[i]] = b;
            nav.appendChild(b);
        }
    }

    return m;
};


// file: modal.js
// Showing modals inside page
// globals: document, window, setTimeout
// require: aabb, browser, settings, translations, translation


CA.modalVisible = null;

CA.modal = function (aTitle, aCallback) {
    // Showing modal with title and close button with dark transparent background
    var bg, div, more, close, nav, h1, hide, onKeyDown,
        lang = (CA.browser && CA.browser.language) || 'en',
        t = CA.translations && CA.translations[lang];
    // translation
    if (t && t.modal && t.modal[aTitle]) {
        t = t.modal[aTitle];
        if (!t.title) {
            console.warn('CA.translations.' + lang + '.modal.' + aTitle + '.title is missing');
        }
        aTitle = t.title || aTitle;
    }
    // bg
    bg = document.createElement('div');
    bg.style.position = 'fixed';
    bg.style.left = '0';
    bg.style.top = '0';
    bg.style.width = '100vw';
    bg.style.height = '100vh';
    bg.style.backgroundColor = 'rgba(0,0,0,0.3)';
    bg.style.display = 'flex';
    bg.style.alignItems = 'center';
    bg.style.justifyContent = 'center';
    bg.style.zIndex = CA.zIndex.slow();
    document.body.appendChild(bg);
    // div
    div = document.createElement('div');
    div.className = 'ca_modal';
    //div.style.position = 'fixed';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = 'medium';
    div.style.boxShadow = '0 0 1ex rgba(0,0,0,0.3)';
    div.style.borderRadius = '0.5ex';
    div.style.backgroundColor = 'white';
    //div.style.overflowY = 'auto';
    div.style.maxWidth = '100vw';
    div.style.maxHeight = '100vh';
    bg.appendChild(div);
    // nav
    nav = document.createElement('div');
    nav.className = 'ca_nav';
    nav.style.display = 'flex';
    div.appendChild(nav);
    // close
    more = document.createElement('button');
    more.textContent = '?';
    more.style.display = 'none';
    more.style.minWidth = 'initial';
    more.style.minHeight = 'initial';
    more.style.border = 'none';
    more.style.backgroundColor = 'transparent';
    more.style.marginTop = '0';
    more.style.outline = 'none';
    more.title = (t && t.more) || 'More options';
    nav.appendChild(more);
    // h1
    h1 = document.createElement('div');
    h1.textContent = aTitle || '';
    h1.style.flex = 1;
    h1.style.fontSize = 'large';
    h1.style.fontWeight = 'bold';
    h1.style.textAlign = 'center';
    h1.style.whiteSpace = 'nowrap';

    function movable() {
        // Make this dialog movable by dragging it's title
        h1.style.border = '1px solid white';
        h1.style.cursor = 'pointer';
        h1.style.userSelect = 'none';
        var sx, sy, moving, nx, ny, r, titleMouseDown, titleMouseUp, ae;
        h1.onmousedown = function (event) {
            ae = document.activeElement;
            sx = event.screenX;
            sy = event.screenY;
            moving = true;
            r = div.getBoundingClientRect();
            div.style.position = 'fixed';
            div.style.left = r.left + 'px';
            div.style.top = r.top + 'px';
            window.addEventListener('mousemove', titleMouseDown);
            window.addEventListener('mouseup', titleMouseUp);
        };
        titleMouseDown = function (event) {
            if (moving) {
                nx = event.screenX;
                ny = event.screenY;
                div.style.left = (r.left + nx - sx) + 'px';
                div.style.top = (r.top + ny - sy) + 'px';
            }
        };
        titleMouseUp = function () {
            window.removeEventListener('mousemove', titleMouseDown);
            window.removeEventListener('mouseup', titleMouseUp);
            if (ae) {
                ae.focus();
            }
        };
    }
    movable();

    h1.style.margin = 0;
    h1.style.padding = 0;
    nav.appendChild(h1);

    hide = function () {
        // hide dialog
        window.requestAnimationFrame(function () {
            CA.modalVisible = null;
        });
        if (bg.parentElement) {
            bg.parentElement.removeChild(bg);
        }
        if (div.parentElement) {
            div.parentElement.removeChild(div);
        }
        window.removeEventListener('keydown', onKeyDown, true);
        if (aCallback) {
            aCallback();
        }
    };

    // close
    close = document.createElement('button');
    close.style.minWidth = 'initial';
    close.style.minHeight = 'initial';
    close.textContent = '\u2716'; //'❌';
    close.style.border = 'none';
    close.style.backgroundColor = 'transparent';
    close.style.outline = 'none';
    close.title = (t && t.close) || 'Close';
    close.onclick = hide;
    nav.appendChild(close);
    /*
    close.style.position = 'fixed';
    close.style.boxShadow = '0 0 1ex rgba(0,0,0,0.3)';
    close.style.borderRadius = '0.5ex';
    close.style.backgroundColor = 'white';
    close.style.overflowY = 'auto';
    */


    //document.body.appendChild(div);

    onKeyDown = function (event) {
        if (event.key === 'Escape') {
            hide();
        }
    };

    bg.onmousedown = function (event) {
        if (event.target === bg || event.target === close) {
            hide();
        }
    };

    function toAabb(aBox) {
        // Move this modal to given AABB
        div.style.left = aBox.x + 'px';
        div.style.top = aBox.y + 'px';
        div.style.width = aBox.width + 'px';
        div.style.height = aBox.height + 'px';
    }

    function near(aElement, aWidth, aHeight, aObstacle) {
        // Snap this modal near other element while avoiding obstacle
        var q = CA.aabb(aElement).near(aWidth, aHeight, CA.aabb(aObstacle)).grow(-8);
        toAabb(q);
        return q;
    }

    function full() {
        // make modal full page
        div.style.left = 0;
        div.style.top = 0;
        div.style.width = '100%';
        div.style.height = '100%';
        div.style.borderRadius = 0;
    }

    window.addEventListener('keydown', onKeyDown, true);
    // remember current modal
    CA.modalVisible = {
        bg: bg,
        div: div,
        nav: nav,
        h1: h1,
        more: more,
        close: close,
        toAabb: toAabb,
        near: near,
        translation: t,
        full: full,
        //movable: movable,
        color: function (aBg) {
            div.style.backgroundColor = aBg;
        }
    };
    return CA.modalVisible;
};

// file: storage.js
// Simplified access to localStorage with extra checks
// globals: localStorage, window
// provide: storage


CA.storage = (function () {
    var self = {};
    self.ops = 0;

    self.keyExists = function (aKey) {
        // return true if key exists in storage
        if (typeof aKey !== 'string') {
            throw "CA.storage.keyExists key " + aKey + " is not string!";
        }
        try {
            var r = localStorage.hasOwnProperty(aKey);
            return r;
        } catch (e) {
            return false;
        }
    };

    self.removeItem = function (aKey) {
        // erase single key
        if (typeof aKey !== 'string') {
            throw "CA.storage.removeItem(key) - key " + aKey + " is not string!";
        }
        localStorage.removeItem(aKey);
    };

    self.size = function (aKey) {
        // return size of a key's value in bytes
        if (!localStorage.hasOwnProperty(aKey)) {
            return 0;
        }
        var r = localStorage.getItem(aKey).length;
        return r;
    };

    self.humanSize = function (aBytes) {
        // convert 12345 to 12.3 kB
        if (aBytes > 1024 * 1024) {
            return (aBytes / 1024 / 1024).toFixed(1) + ' MB';
        }
        if (aBytes > 1024) {
            return Math.ceil(aBytes / 1024) + ' kB';
        }
        return aBytes + ' B';
    };

    self.sizeAll = function (aHuman) {
        // return size used by entire storage
        var keys = self.keys(), i, t = 0, s = 0;
        for (i = 0; i < keys.length; i++) {
            t += self.size(keys[i]);
        }
        if (aHuman) {
            s = self.humanSize(t);
        } else {
            s = t;
        }
        return s;
    };

    self.keys = function () {
        // return all keys, alphabetically sorted
        var k, keys = [];
        for (k in localStorage) {
            if (localStorage.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys.sort();
    };

    self.removeAll = function (aNothing) {
        // erase entire storage
        if (aNothing !== undefined) {
            throw "CA.storage.removeAll does not require parameter, perhaps you wanted to call CA.storage.removeItem(key)";
        }
        localStorage.clear();
    };

    self.debug = function () {
        // return size occupied by each keys and first few bytes of data
        var i, keys = self.keys().sort(), s = [], c, t = 0;
        for (i = 0; i < keys.length; i++) {
            c = self.size(keys[i]);
            t += c;
            s.push(keys[i] + ': ' + c + ' B = ' + self.readString(keys[i], '').substr(0, 80) + '...');
        }
        s.push('Total size: ' + t + ' B (' + (t / 1000).toFixed(0) + ' kB)');
        s = s.join('\n');
        return s;
    };

    self.readString = function (aKey, aDefault) {
        // read string
        var r;
        if (typeof aKey !== 'string') {
            throw "CA.storage.readString key " + aKey + " is not string!";
        }
        if ((aDefault !== undefined) && (typeof aDefault !== 'string')) {
            throw "CA.storage.readString default " + aDefault + " is not string nor undefined!";
        }
        self.ops++;
        try {
            if (localStorage.hasOwnProperty(aKey)) {
                r = localStorage.getItem(aKey);
            } else {
                r = aDefault;
            }
        } catch (e) {
            console.warn('CA.storage.writeString: ' + e);
        }
        return r;
    };

    self.writeString = function (aKey, aValue) {
        // write string
        if (typeof aKey !== 'string') {
            throw "CA.storage.writeString key " + aKey + " is not string!";
        }
        if ((aValue !== undefined) && (typeof aValue !== 'string')) {
            throw "CA.storage.writeString value " + aValue + " is not string nor undefined!";
        }
        self.ops++;
        try {
            localStorage.setItem(aKey, aValue);
        } catch (e) {
            console.warn('CA.storage.writeString: ' + e);
        }
    };

    self.readBoolean = function (aKey, aDefault) {
        // read true/false, undefined as default, everything else is default with warning
        var s = self.readString(aKey);
        // console.info(aKey, aDefault, s, typeof s);
        if (s === undefined) {
            return aDefault || false;
        }
        if ((s !== 'true') && (s !== 'false')) {
            console.warn('CA.storage.readBoolean: unusual boolean value "' + s + '" for "' + aKey + '", using default');
            return aDefault || false;
        }
        return s === 'true';
    };

    self.writeBoolean = function (aKey, aValue) {
        // write true/false
        if ((aValue !== true) && (aValue !== false)) {
            console.warn('CA.storage.writeBoolean: unusual boolean value "' + aValue + '" for "' + aKey + '", using false');
        }
        var r = aValue === true ? 'true' : 'false';
        self.writeString(aKey, r);
    };

    self.readNumber = function (aKey, aDefault) {
        // read number, undefined as default, everything else is default with warning
        var s = self.readString(aKey), f;
        if (s === undefined) {
            return aDefault || 0;
        }
        f = parseFloat(s);
        if (isNaN(f)) {
            console.warn('CA.storage.readNumber: unusual number value "' + s + '" for "' + aKey + '", using default');
            return aDefault || 0;
        }
        return f;
    };

    self.writeNumber = function (aKey, aValue) {
        // write number
        if (typeof aValue !== 'number') {
            console.warn('CA.storage.writeNumber: unusual number value "' + aValue + '" for "' + aKey + '", using 0');
            self.writeString(aKey, '0');
        } else {
            self.writeString(aKey, aValue.toString());
        }
    };

    self.inc = function (aKey, aDefault) {
        // read number, increment it, write it back
        var i = self.readNumber(aKey, aDefault);
        i++;
        self.writeNumber(aKey, i);
        return i;
    };

    self.readObject = function (aKey, aDefault) {
        // read object, undefined as default, everything else is default with warning
        var s = self.readString(aKey), o;
        if (aDefault === undefined) {
            aDefault = {};
        }
        if (typeof aDefault !== 'object') {
            console.warn('CA.storage.readObject: default is not object in "' + aKey + '" but "' + aDefault + '", using {}');
            aDefault = {};
        }
        if (s === undefined) {
            return aDefault;
        }
        o = JSON.parse(s);
        if (typeof o !== 'object') {
            console.warn('CA.storage.readObject: unusual value "' + s + '" for "' + aKey + '", using default');
            return aDefault;
        }
        return o;
    };

    self.writeObject = function (aKey, aValue) {
        // write object
        if (typeof aValue !== 'object') {
            console.warn('CA.storage.writeObject: unusual object value "' + aValue + '" for "' + aKey + '", using {}');
            self.writeString(aKey, '{}');
        } else {
            self.writeString(aKey, JSON.stringify(aValue));
        }
    };

    self.readArray = function (aKey, aDefault) {
        // read array, undefined as default, everything else is default with warning
        var s = self.readString(aKey), o;
        if (aDefault === undefined) {
            aDefault = [];
        }
        if (!Array.isArray(aDefault)) {
            console.warn('CA.storage.readArray: default is not array in "' + aKey + '" but "' + aDefault + '", using []');
            aDefault = [];
        }
        if (s === undefined) {
            return aDefault;
        }
        o = JSON.parse(s);
        if (!Array.isArray(o)) {
            console.warn('CA.storage.readArray: unusual value "' + s + '" for "' + aKey + '", using default');
            return aDefault;
        }
        return o;
    };

    self.writeArray = function (aKey, aValue) {
        // write array
        if (!Array.isArray(aValue)) {
            console.warn('CA.storage.writeArray: unusual array value "' + aValue + '" for "' + aKey + '", using []');
            self.writeString(aKey, '[]');
        } else {
            self.writeString(aKey, JSON.stringify(aValue));
        }
    };

    return self;
}());


// file: table.js
// Render html table from data
// globals: document, window


CA.table = function (aParent, aData, aTrCallbackECR, aThCallbackECR, aTdCallbackECR) {
    // Create HTML table from data
    var self = {}, k, th, tr, td, i, j, every = [];
    self.parent = aParent === 'string' ? document.getElementById(aParent) : aParent;
    self.table = document.createElement('table');
    self.onclicktr = null;
    self.onclickth = null;
    self.onclicktd = null;
    self.tr = [];

    function handleClick(event, aNodeName, aCallbackElementColumnRow) {
        if (!aCallbackElementColumnRow) {
            return;
        }
        var e = event.target, element, column, row;
        do {
            column = column || e.dataColumn;
            row = row || e.dataRow;
            if (!element && e.nodeName === aNodeName) {
                element = e;
            }
            e = e.parentElement;
        } while (e && !element);
        //console.log(aNodeName, element, column, row);
        aCallbackElementColumnRow(element, column, row);
    }

    function handleClickTR(event) {
        handleClick(event, 'TR', self.onclicktr);
    }

    function handleClickTH(event) {
        handleClick(event, 'TH', self.onclickth);
    }

    function handleClickTD(event) {
        handleClick(event, 'TD', self.onclicktd);
    }

    // header
    self.header = document.createElement('tr');
    self.header.dataRow = -1;
    self.header.onclick = handleClickTR;
    for (k in aData[0]) {
        if (aData[0].hasOwnProperty(k)) {
            th = document.createElement('th');
            th.textContent = k;
            th.dataColumn = k;
            th.onclick = handleClickTH;
            if (aThCallbackECR) {
                aThCallbackECR(th, k, -1);
            }
            self.header.appendChild(th);
        }
    }
    if (aTrCallbackECR) {
        aTrCallbackECR(self.header, '', -1);
    }
    self.table.appendChild(self.header);

    // in case attributes are different in each row
    every = {};
    for (i = 0; i < aData.length; i++) {
        for (k in aData[i]) {
            if (aData[i].hasOwnProperty(k)) {
                every[k] = 1;
            }
        }
    }
    every = Object.keys(every);
    // console.log(every);

    // rows
    for (i = 0; i < aData.length; i++) {
        tr = document.createElement('tr');
        tr.dataRow = i;
        tr.onclick = handleClickTR;
        self.tr.push(tr);
        for (j = 0; j < every.length; j++) {
            k = every[j];
        //for (k in aData[i]) {
          //  if (aData[i].hasOwnProperty(k)) {
            td = document.createElement('td');
            if (aData[i][k] instanceof HTMLElement) {
                td.appendChild(aData[i][k]);
            } else {
                td.textContent = aData[i][k];
            }
            td.dataColumn = k;
            td.dataRow = i;
            td.onclick = handleClickTD;
            if (aTdCallbackECR) {
                aTdCallbackECR(td, k, i);
            }
            tr.appendChild(td);
            //}
        }
        if (aTrCallbackECR) {
            aTrCallbackECR(tr, '', i);
        }
        self.table.appendChild(tr);
    }
    self.parent.appendChild(self.table);
    return self;
};

// file: utils/elementsWithId.js
CA.elementsWithId = function () {
    // Return all elements with defined id, if id is set, it is assumed they will be used so we can have them all at once
    function acceptNode() {
        return window.NodeFilter.FILTER_ACCEPT;
    }
    var w = document.createTreeWalker(document.body, window.NodeFilter.SHOW_ELEMENT, acceptNode, false),
        n = w.nextNode(),
        o = {};
    while (n) {
        if (n.id) {
            o[n.id] = n;
        }
        n = w.nextNode();
    }
    return o;
};


// file: utils/focusNext.js
CA.focusNext = function (aElement) {
    // Focus next tab-able element, this doesn't honour tab-indexes
    // find all tab-able elements
    var i, all = Array.from(document.querySelectorAll('input, button, a, area, object, select, textarea, [contenteditable]'));
    // find the current tab index
    i = all.indexOf(aElement);
    // focus the following element
    i = (i + 1) % all.length;
    all[i].focus();
    if (all[i].select) {
        all[i].select();
    }
    return all[i];
};


// file: utils/label_checkbox.js
// Create Label+Checkbox input (for modalDialog)
// globals: document, window, CA

CA.labelCheckbox = function (aParent, aLabel, aChecked) {
    // Create checkbox and label
    var label = document.createElement('label'),
        checkbox = document.createElement('input'),
        span = document.createElement('span');
    span.textContent = aLabel;
    span.style.verticalAlign = 'middle';
    checkbox.type = 'checkbox';
    checkbox.checked = aChecked ? true : false;
    label.appendChild(checkbox);
    label.appendChild(span);
    label.style.whiteSpace = 'nowrap';
    aParent.appendChild(label);
    return {
        label: label,
        checkbox: checkbox,
        span: span
    };
};

// file: z_index.js
// Get highest zIndex value
// globals: document, window, NodeFilter
// provide: zIndex


CA.zIndex = (function () {
    var self = {}, f = 0;

    self.fast = function () {
        // Get next highest z-index fast
        f++;
        return f;
    };

    self.slow = function () {
        // returns real highest used zIndex plus 1
        if (!document.body) {
            return self.fast();
        }
        function acceptNode() {
            return NodeFilter.FILTER_ACCEPT;
        }
        var ie11 = (CA.browser.msie && CA.browser.version <= 11),
            w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, ie11 ? acceptNode : null, false),
            n,
            cur,
            m = 0,
            v = window.document.defaultView;
        n = w.nextNode();
        while (n) {
            if (n instanceof window.HTMLElement) {
                cur = parseInt(v.getComputedStyle(n).getPropertyValue('z-index'), 10);
                if (cur > m) {
                    m = cur;
                }
            }
            n = w.nextNode();
        }
        return m + 1;
    };

    return self;
}());


(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.wangEditor = factory());
}(this, (function () { 'use strict';

/*
    poly-fill
*/

var polyfill = function () {

    // Object.assign
    if (typeof Object.assign != 'function') {
        Object.assign = function (target, varArgs) {
            // .length of function is 2
            if (target == null) {
                // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) {
                    // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
    }
};

function createElemByHTML(html) {
    var div = void 0;
    div = document.createElement('div');
    div.innerHTML = html;
    return div.children;
}

function isDOMList(selector) {
    if (!selector) {
        return false;
    }
    if (selector instanceof HTMLCollection || selector instanceof NodeList) {
        return true;
    }
    return false;
}

function querySelectorAll(selector) {
    var result = document.querySelectorAll(selector);
    if (isDOMList(result)) {
        return result;
    } else {
        return [result];
    }
}

var eventList = [];

function DomElement(selector) {
    if (!selector) {
        return;
    }

    if (selector instanceof DomElement) {
        return selector;
    }

    this.selector = selector;
    var nodeType = selector.nodeType;

    var selectorResult = [];
    if (nodeType === 9) {
        selectorResult = [selector];
    } else if (nodeType === 1) {
        selectorResult = [selector];
    } else if (isDOMList(selector) || selector instanceof Array) {
        selectorResult = selector;
    } else if (typeof selector === 'string') {
        selector = selector.replace('/\n/mg', '').trim();
        if (selector.indexOf('<') === 0) {
            selectorResult = createElemByHTML(selector);
        } else {
            selectorResult = querySelectorAll(selector);
        }
    }

    var length = selectorResult.length;
    if (!length) {
        return this;
    }

    var i = void 0;
    for (i = 0; i < length; i++) {
        this[i] = selectorResult[i];
    }
    this.length = length;
}

DomElement.prototype = {
    constructor: DomElement,

    forEach: function forEach(fn) {
        var i = void 0;
        for (i = 0; i < this.length; i++) {
            var elem = this[i];
            var result = fn.call(elem, elem, i);
            if (result === false) {
                break;
            }
        }
        return this;
    },

    // clone
    clone: function clone(deep) {
        var cloneList = [];
        this.forEach(function (elem) {
            cloneList.push(elem.cloneNode(!!deep));
        });
        return $(cloneList);
    },

    get: function get(index) {
        var length = this.length;
        if (index >= length) {
            index = index % length;
        }
        return $(this[index]);
    },

    first: function first() {
        return this.get(0);
    },

    last: function last() {
        var length = this.length;
        return this.get(length - 1);
    },
	
    on: function on(type, selector, fn) {
        if (!fn) {
            fn = selector;
            selector = null;
        }

        var types = [];
        types = type.split(/\s+/);

        return this.forEach(function (elem) {
            types.forEach(function (type) {
                if (!type) {
                    return;
                }

                eventList.push({
                    elem: elem,
                    type: type,
                    fn: fn
                });

                if (!selector) {
                    elem.addEventListener(type, fn);
                    return;
                }

                elem.addEventListener(type, function (e) {
                    var target = e.target;
                    if (target.matches(selector)) {
                        fn.call(target, e);
                    }
                });
            });
        });
    },

    off: function off(type, fn) {
        return this.forEach(function (elem) {
            elem.removeEventListener(type, fn);
        });
    },

    attr: function attr(key, val) {
        if (val == null) {
            return this[0].getAttribute(key);
        } else {
            return this.forEach(function (elem) {
                elem.setAttribute(key, val);
            });
        }
    },

    addClass: function addClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            var arr = void 0;
            if (elem.className) {
                arr = elem.className.split(/\s/);
                arr = arr.filter(function (item) {
                    return !!item.trim();
                });
                if (arr.indexOf(className) < 0) {
                    arr.push(className);
                }
                elem.className = arr.join(' ');
            } else {
                elem.className = className;
            }
        });
    },

    removeClass: function removeClass(className) {
        if (!className) {
            return this;
        }
        return this.forEach(function (elem) {
            var arr = void 0;
            if (elem.className) {
                arr = elem.className.split(/\s/);
                arr = arr.filter(function (item) {
                    item = item.trim();
                    if (!item || item === className) {
                        return false;
                    }
                    return true;
                });
                elem.className = arr.join(' ');
            }
        });
    },

    css: function css(key, val) {
        var currentStyle = key + ':' + val + ';';
        return this.forEach(function (elem) {
            var style = (elem.getAttribute('style') || '').trim();
            var styleArr = void 0,
                resultArr = [];
            if (style) {
                styleArr = style.split(';');
                styleArr.forEach(function (item) {
                    var arr = item.split(':').map(function (i) {
                        return i.trim();
                    });
                    if (arr.length === 2) {
                        resultArr.push(arr[0] + ':' + arr[1]);
                    }
                });
                resultArr = resultArr.map(function (item) {
                    if (item.indexOf(key) === 0) {
                        return currentStyle;
                    } else {
                        return item;
                    }
                });
                if (resultArr.indexOf(currentStyle) < 0) {
                    resultArr.push(currentStyle);
                }
                elem.setAttribute('style', resultArr.join('; '));
            } else {
                elem.setAttribute('style', currentStyle);
            }
        });
    },

    show: function show() {
        return this.css('display', 'block');
    },

    hide: function hide() {
        return this.css('display', 'none');
    },

    children: function children() {
        var elem = this[0];
        if (!elem) {
            return null;
        }

        return $(elem.children);
    },

    childNodes: function childNodes() {
        var elem = this[0];
        if (!elem) {
            return null;
        }

        return $(elem.childNodes);
    },

    append: function append($children) {
        return this.forEach(function (elem) {
            $children.forEach(function (child) {
                elem.appendChild(child);
            });
        });
    },

    remove: function remove() {
        return this.forEach(function (elem) {
            if (elem.remove) {
                elem.remove();
            } else {
                var parent = elem.parentElement;
                parent && parent.removeChild(elem);
            }
        });
    },

    isContain: function isContain($child) {
        var elem = this[0];
        var child = $child[0];
        return elem.contains(child);
    },

    getSizeData: function getSizeData() {
        var elem = this[0];
        return elem.getBoundingClientRect(); 
    },

    
    getNodeName: function getNodeName() {
        var elem = this[0];
        return elem.nodeName;
    },

    find: function find(selector) {
        var elem = this[0];
        return $(elem.querySelectorAll(selector));
    },

    text: function text(val) {
        if (!val) {
            var elem = this[0];
            return elem.innerHTML.replace(/<.*?>/g, function () {
                return '';
            });
        } else {
            return this.forEach(function (elem) {
                elem.innerHTML = val;
            });
        }
    },

    html: function html(value) {
        var elem = this[0];
        if (value == null) {
            return elem.innerHTML;
        } else {
            elem.innerHTML = value;
            return this;
        }
    },

    val: function val() {
        var elem = this[0];
        return elem.value.trim();
    },

    // focus
    focus: function focus() {
        return this.forEach(function (elem) {
            elem.focus();
        });
    },

    parent: function parent() {
        var elem = this[0];
        return $(elem.parentElement);
    },

    parentUntil: function parentUntil(selector, _currentElem) {
        var results = document.querySelectorAll(selector);
        var length = results.length;
        if (!length) {
            return null;
        }

        var elem = _currentElem || this[0];
        if (elem.nodeName === 'BODY') {
            return null;
        }

        var parent = elem.parentElement;
        var i = void 0;
        for (i = 0; i < length; i++) {
            if (parent === results[i]) {
                return $(parent);
            }
        }

        return this.parentUntil(selector, parent);
    },

    equal: function equal($elem) {
        if ($elem.nodeType === 1) {
            return this[0] === $elem;
        } else {
            return this[0] === $elem[0];
        }
    },

    insertBefore: function insertBefore(selector) {
        var $referenceNode = $(selector);
        var referenceNode = $referenceNode[0];
        if (!referenceNode) {
            return this;
        }
        return this.forEach(function (elem) {
            var parent = referenceNode.parentNode;
            parent.insertBefore(elem, referenceNode);
        });
    },

    insertAfter: function insertAfter(selector) {
        var $referenceNode = $(selector);
        var referenceNode = $referenceNode[0];
        if (!referenceNode) {
            return this;
        }
        return this.forEach(function (elem) {
            var parent = referenceNode.parentNode;
            if (parent.lastChild === referenceNode) {
                parent.appendChild(elem);
            } else {
                parent.insertBefore(elem, referenceNode.nextSibling);
            }
        });
    }
};

function $(selector) {
    return new DomElement(selector);
}

$.offAll = function () {
    eventList.forEach(function (item) {
        var elem = item.elem;
        var type = item.type;
        var fn = item.fn;
        elem.removeEventListener(type, fn);
    });
};


var config = {

    menus: ['head', 'bold', 'fontSize', 'fontName', 'italic', 'underline', 'strikeThrough', 'foreColor', 'backColor', 'link', 'list', 'justify', 'quote', 'emoticon', 'image', 'table', 'video', 'code', 'undo', 'redo'],

    fontNames: ['宋体', '微软雅黑', 'Arial', 'Tahoma', 'Verdana'],

    colors: ['#000000', '#eeece0', '#1c487f', '#4d80bf', '#c24f4a', '#8baa4a', '#7b5ba1', '#46acc8', '#f9963b', '#ffffff'],

    emotions: [{
        title: 'title',
        type: 'image',
        content: [{
            alt: '[image]',
            src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/50/pcmoren_huaixiao_org.png'
        }, {
            alt: '[image]',
            src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/pcmoren_tian_org.png'
        }, {
            alt: '[image]',
            src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/3c/pcmoren_wu_org.png'
        }]
    }, {
        title: 'image',
        type: 'image',
        content: [{
            src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/7a/shenshou_thumb.gif',
            alt: '[image]'
        }, {
            src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/60/horse2_thumb.gif',
            alt: '[image]'
        }, {
            src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/bc/fuyun_thumb.gif',
            alt: '[image]'
        }]
    }, {
        title: 'emoji',
        type: 'emoji',
        content: '😀 😃 😄 😁 😆 😅 😂 😊 😇 🙂 🙃 😉 😓 😪 😴 🙄 🤔 😬 🤐'.split(/\s/)
    }],

    zIndex: 10000,

    debug: false,

    linkCheck: function linkCheck(text, link) {
        return true;
    },

    linkImgCheck: function linkImgCheck(src) {
        return true;
    },

    pasteFilterStyle: true,

    pasteIgnoreImg: false,

    pasteTextHandle: function pasteTextHandle(content) {
        return content;
    },


    showLinkImg: true,
    linkImgCallback: function linkImgCallback(url) {
    },

    uploadImgMaxSize: 5 * 1024 * 1024,

    uploadImgShowBase64: false,
    uploadFileName: '',

    uploadImgParams: {
    },

    uploadImgHeaders: {
    },

    withCredentials: false,
    uploadImgTimeout: 10000,

    uploadImgHooks: {
        before: function before(xhr, editor, files) {
            
        },
        success: function success(xhr, editor, result) {
        },
        fail: function fail(xhr, editor, result) {
        },
        error: function error(xhr, editor) {
        },
        timeout: function timeout(xhr, editor) {
        }
    },

    qiniu: false

};

var UA = {
    _ua: navigator.userAgent,

    isWebkit: function isWebkit() {
        var reg = /webkit/i;
        return reg.test(this._ua);
    },
    isIE: function isIE() {
        return 'ActiveXObject' in window;
    }
};
function objForEach(obj, fn) {
    var key = void 0,
        result = void 0;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            result = fn.call(obj, key, obj[key]);
            if (result === false) {
                break;
            }
        }
    }
}

function arrForEach(fakeArr, fn) {
    var i = void 0,
        item = void 0,
        result = void 0;
    var length = fakeArr.length || 0;
    for (i = 0; i < length; i++) {
        item = fakeArr[i];
        result = fn.call(fakeArr, item, i);
        if (result === false) {
            break;
        }
    }
}

function getRandom(prefix) {
    return prefix + Math.random().toString().slice(2);
}
function replaceHtmlSymbol(html) {
    if (html == null) {
        return '';
    }
    return html.replace(/</gm, '&lt;').replace(/>/gm, '&gt;').replace(/"/gm, '&quot;').replace(/(\r\n|\r|\n)/g, '<br/>');
}



function isFunction(fn) {
    return typeof fn === 'function';
}

function Bold(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-bold"></i>\n        </div>');
    this.type = 'click';

    this._active = false;
}

Bold.prototype = {
    constructor: Bold,
    onClick: function onClick(e) {

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            editor.selection.createEmptyRange();
        }

        editor.cmd.do('bold');

        if (isSeleEmpty) {
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('bold')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};


var replaceLang = function (editor, str) {
    var langArgs = editor.config.langArgs || [];
    var result = str;

    langArgs.forEach(function (item) {
        var reg = item.reg;
        var val = item.val;

        if (reg.test(result)) {
            result = result.replace(reg, function () {
                return val;
            });
        }
    });

    return result;
};

var _emptyFn = function _emptyFn() {};

function DropList(menu, opt) {
    var _this = this;

    var editor = menu.editor;
    this.menu = menu;
    this.opt = opt;
    var $container = $('<div class="w-e-droplist"></div>');

    var $title = opt.$title;
    var titleHtml = void 0;
    if ($title) {
        titleHtml = $title.html();
        titleHtml = replaceLang(editor, titleHtml);
        $title.html(titleHtml);

        $title.addClass('w-e-dp-title');
        $container.append($title);
    }

    var list = opt.list || [];
    var type = opt.type || 'list'; 
    var onClick = opt.onClick || _emptyFn;

    var $list = $('<ul class="' + (type === 'list' ? 'w-e-list' : 'w-e-block') + '"></ul>');
    $container.append($list);
    list.forEach(function (item) {
        var $elem = item.$elem;

        var elemHtml = $elem.html();
        elemHtml = replaceLang(editor, elemHtml);
        $elem.html(elemHtml);

        var value = item.value;
        var $li = $('<li class="w-e-item"></li>');
        if ($elem) {
            $li.append($elem);
            $list.append($li);
            $li.on('click', function (e) {
                onClick(value);

                _this.hideTimeoutId = setTimeout(function () {
                    _this.hide();
                }, 0);
            });
        }
    });

    $container.on('mouseleave', function (e) {
        _this.hideTimeoutId = setTimeout(function () {
            _this.hide();
        }, 0);
    });

    this.$container = $container;

    this._rendered = false;
    this._show = false;
}

DropList.prototype = {
    constructor: DropList,

    show: function show() {
        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
        }

        var menu = this.menu;
        var $menuELem = menu.$elem;
        var $container = this.$container;
        if (this._show) {
            return;
        }
        if (this._rendered) {
            $container.show();
        } else {
            var menuHeight = $menuELem.getSizeData().height || 0;
            var width = this.opt.width || 100; 
            $container.css('margin-top', menuHeight + 'px').css('width', width + 'px');

            $menuELem.append($container);
            this._rendered = true;
        }

        this._show = true;
    },

    hide: function hide() {
        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
        }

        var $container = this.$container;
        if (!this._show) {
            return;
        }
        $container.hide();
        this._show = false;
    }
};

function Head(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-header"></i></div>');
    this.type = 'droplist';

    this._active = false;
    this.droplist = new DropList(this, {
        width: 100,
        $title: $('<p></p>'),
        type: 'list', 
        list: [{ $elem: $('<h1>H1</h1>'), value: '<h1>' }, { $elem: $('<h2>H2</h2>'), value: '<h2>' }, { $elem: $('<h3>H3</h3>'), value: '<h3>' }, { $elem: $('<h4>H4</h4>'), value: '<h4>' }, { $elem: $('<h5>H5</h5>'), value: '<h5>' }, { $elem: $('<p>正文</p>'), value: '<p>' }],
        onClick: function onClick(value) {
            _this._command(value);
        }
    });
}

Head.prototype = {
    constructor: Head,

    _command: function _command(value) {
        var editor = this.editor;

        var $selectionElem = editor.selection.getSelectionContainerElem();
        if (editor.$textElem.equal($selectionElem)) {
            return;
        }

        editor.cmd.do('formatBlock', value);
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var reg = /^h/i;
        var cmdValue = editor.cmd.queryCommandValue('formatBlock');
        if (reg.test(cmdValue)) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function FontSize(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-text-heigh"></i></div>');
    this.type = 'droplist';

    this._active = false;

    this.droplist = new DropList(this, {
        width: 160,
        $title: $('<p></p>'),
        type: 'list',
        list: [{ $elem: $('<span style="font-size: x-small;">x-small</span>'), value: '1' }, { $elem: $('<span style="font-size: small;">small</span>'), value: '2' }, { $elem: $('<span>normal</span>'), value: '3' }, { $elem: $('<span style="font-size: large;">large</span>'), value: '4' }, { $elem: $('<span style="font-size: x-large;">x-large</span>'), value: '5' }, { $elem: $('<span style="font-size: xx-large;">xx-large</span>'), value: '6' }],
        onClick: function onClick(value) {
          
            _this._command(value);
        }
    });
}

FontSize.prototype = {
    constructor: FontSize,

    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('fontSize', value);
    }
};

function FontName(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-font"></i></div>');
    this.type = 'droplist';

    this._active = false;

    var config = editor.config;
    var fontNames = config.fontNames || [];

    this.droplist = new DropList(this, {
        width: 100,
        $title: $('<p></p>'),
        type: 'list', 
        list: fontNames.map(function (fontName) {
            return { $elem: $('<span style="font-family: ' + fontName + ';">' + fontName + '</span>'), value: fontName };
        }),
        onClick: function onClick(value) {
            _this._command(value);
        }
    });
}

FontName.prototype = {
    constructor: FontName,

    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('fontName', value);
    }
};

/*
    panel
*/

var emptyFn = function emptyFn() {};

var _isCreatedPanelMenus = [];

function Panel(menu, opt) {
    this.menu = menu;
    this.opt = opt;
}

Panel.prototype = {
    constructor: Panel,

    show: function show() {
        var _this = this;

        var menu = this.menu;
        if (_isCreatedPanelMenus.indexOf(menu) >= 0) {
            return;
        }

        var editor = menu.editor;
        var $body = $('body');
        var $textContainerElem = editor.$textContainerElem;
        var opt = this.opt;

        var $container = $('<div class="w-e-panel-container"></div>');
        var width = opt.width || 300;
        $container.css('width', width + 'px').css('margin-left', (0 - width) / 2 + 'px');

        var $closeBtn = $('<i class="w-e-icon-close w-e-panel-close"></i>');
        $container.append($closeBtn);
        $closeBtn.on('click', function () {
            _this.hide();
        });

        var $tabTitleContainer = $('<ul class="w-e-panel-tab-title"></ul>');
        var $tabContentContainer = $('<div class="w-e-panel-tab-content"></div>');
        $container.append($tabTitleContainer).append($tabContentContainer);

        var height = opt.height;
        if (height) {
            $tabContentContainer.css('height', height + 'px').css('overflow-y', 'auto');
        }

        var tabs = opt.tabs || [];
        var tabTitleArr = [];
        var tabContentArr = [];
        tabs.forEach(function (tab, tabIndex) {
            if (!tab) {
                return;
            }
            var title = tab.title || '';
            var tpl = tab.tpl || '';

            title = replaceLang(editor, title);
            tpl = replaceLang(editor, tpl);

            var $title = $('<li class="w-e-item">' + title + '</li>');
            $tabTitleContainer.append($title);
            var $content = $(tpl);
            $tabContentContainer.append($content);

            $title._index = tabIndex;
            tabTitleArr.push($title);
            tabContentArr.push($content);

            if (tabIndex === 0) {
                $title._active = true;
                $title.addClass('w-e-active');
            } else {
                $content.hide();
            }

            $title.on('click', function (e) {
                if ($title._active) {
                    return;
                }
                tabTitleArr.forEach(function ($title) {
                    $title._active = false;
                    $title.removeClass('w-e-active');
                });
                tabContentArr.forEach(function ($content) {
                    $content.hide();
                });
                $title._active = true;
                $title.addClass('w-e-active');
                $content.show();
            });
        });

        $container.on('click', function (e) {
            e.stopPropagation();
        });
        $body.on('click', function (e) {
            _this.hide();
        });

        $textContainerElem.append($container);

        tabs.forEach(function (tab, index) {
            if (!tab) {
                return;
            }
            var events = tab.events || [];
            events.forEach(function (event) {
                var selector = event.selector;
                var type = event.type;
                var fn = event.fn || emptyFn;
                var $content = tabContentArr[index];
                $content.find(selector).on(type, function (e) {
                    e.stopPropagation();
                    var needToHide = fn(e);
                    if (needToHide) {
                        _this.hide();
                    }
                });
            });
        });

        var $inputs = $container.find('input[type=text],textarea');
        if ($inputs.length) {
            $inputs.get(0).focus();
        }

        this.$container = $container;

        this._hideOtherPanels();
        _isCreatedPanelMenus.push(menu);
    },

    hide: function hide() {
        var menu = this.menu;
        var $container = this.$container;
        if ($container) {
            $container.remove();
        }

        _isCreatedPanelMenus = _isCreatedPanelMenus.filter(function (item) {
            if (item === menu) {
                return false;
            } else {
                return true;
            }
        });
    },

    _hideOtherPanels: function _hideOtherPanels() {
        if (!_isCreatedPanelMenus.length) {
            return;
        }
        _isCreatedPanelMenus.forEach(function (menu) {
            var panel = menu.panel || {};
            if (panel.hide) {
                panel.hide();
            }
        });
    }
};

function Link(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-link"></i></div>');
    this.type = 'panel';

    this._active = false;
}

Link.prototype = {
    constructor: Link,

    onClick: function onClick(e) {
        var editor = this.editor;
        var $linkelem = void 0;

        if (this._active) {
            $linkelem = editor.selection.getSelectionContainerElem();
            if (!$linkelem) {
                return;
            }
            editor.selection.createRangeByElem($linkelem);
            editor.selection.restoreSelection();
            this._createPanel($linkelem.text(), $linkelem.attr('href'));
        } else {
            if (editor.selection.isSelectionEmpty()) {
                this._createPanel('', '');
            } else {
                this._createPanel(editor.selection.getSelectionText(), '');
            }
        }
    },

    _createPanel: function _createPanel(text, link) {
        var _this = this;

        var inputLinkId = getRandom('input-link');
        var inputTextId = getRandom('input-text');
        var btnOkId = getRandom('btn-ok');
        var btnDelId = getRandom('btn-del');

        var delBtnDisplay = this._active ? 'inline-block' : 'none';

        var panel = new Panel(this, {
            width: 300,
            tabs: [{
                title: '',
                tpl: '<div>\n                            <input id="' + inputTextId + '" type="text" class="block" value="' + text + '" placeholder="\u94FE\u63A5\u6587\u5B57"/></td>\n                            <input id="' + inputLinkId + '" type="text" class="block" value="' + link + '" placeholder="http://..."/></td>\n                            <div class="w-e-button-container">\n                                <button id="' + btnOkId + '" class="right">\u63D2\u5165</button>\n                                <button id="' + btnDelId + '" class="gray right" style="display:' + delBtnDisplay + '">\u5220\u9664\u94FE\u63A5</button>\n                            </div>\n                        </div>',
               
                events: [
                {
                    selector: '#' + btnOkId,
                    type: 'click',
                    fn: function fn() {
                        var $link = $('#' + inputLinkId);
                        var $text = $('#' + inputTextId);
                        var link = $link.val();
                        var text = $text.val();
                        _this._insertLink(text, link);

                        return true;
                    }
                },
                {
                    selector: '#' + btnDelId,
                    type: 'click',
                    fn: function fn() {
                        _this._delLink();
                        return true;
                    }
                }]
            } // tab end
            ] // tabs end
        });
        panel.show();

        this.panel = panel;
    },

    _delLink: function _delLink() {
        if (!this._active) {
            return;
        }
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var selectionText = editor.selection.getSelectionText();
        editor.cmd.do('insertHTML', '<span>' + selectionText + '</span>');
    },

    _insertLink: function _insertLink(text, link) {
        var editor = this.editor;
        var config = editor.config;
        var linkCheck = config.linkCheck;
        var checkResult = true; 
        if (linkCheck && typeof linkCheck === 'function') {
            checkResult = linkCheck(text, link);
        }
        if (checkResult === true) {
            editor.cmd.do('insertHTML', '<a href="' + link + '" target="_blank">' + text + '</a>');
        } else {
            alert(checkResult);
        }
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        if ($selectionELem.getNodeName() === 'A') {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Italic(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-italic"></i>\n        </div>');
    this.type = 'click';

    this._active = false;
}

Italic.prototype = {
    constructor: Italic,

    onClick: function onClick(e) {

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            editor.selection.createEmptyRange();
        }

        editor.cmd.do('italic');

        if (isSeleEmpty) {
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('italic')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Redo(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-redo"></i>\n        </div>');
    this.type = 'click';

    this._active = false;
}

Redo.prototype = {
    constructor: Redo,

    onClick: function onClick(e) {

        var editor = this.editor;

        editor.cmd.do('redo');
    }
};

function StrikeThrough(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-strikethrough"></i>\n        </div>');
    this.type = 'click';

    this._active = false;
}

StrikeThrough.prototype = {
    constructor: StrikeThrough,

    onClick: function onClick(e) {

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            editor.selection.createEmptyRange();
        }

        editor.cmd.do('strikeThrough');

        if (isSeleEmpty) {
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('strikeThrough')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Underline(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-underline"></i>\n        </div>');
    this.type = 'click';

    this._active = false;
}
Underline.prototype = {
    constructor: Underline,

    onClick: function onClick(e) {

        var editor = this.editor;
        var isSeleEmpty = editor.selection.isSelectionEmpty();

        if (isSeleEmpty) {
            editor.selection.createEmptyRange();
        }

        editor.cmd.do('underline');

        if (isSeleEmpty) {
            editor.selection.collapseRange();
            editor.selection.restoreSelection();
        }
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('underline')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Undo(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-undo"></i>\n        </div>');
    this.type = 'click';

    this._active = false;
}

Undo.prototype = {
    constructor: Undo,

    onClick: function onClick(e) {

        var editor = this.editor;

        editor.cmd.do('undo');
    }
};

function List(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-list2"></i></div>');
    this.type = 'droplist';

    this._active = false;

    this.droplist = new DropList(this, {
        width: 120,
        $title: $('<p></p>'),
        type: 'list', 
        list: [{ $elem: $('<span><i class="w-e-icon-list-numbered"></i> </span>'), value: 'insertOrderedList' }, { $elem: $('<span><i class="w-e-icon-list2"></i> 无序列表</span>'), value: 'insertUnorderedList' }],
        onClick: function onClick(value) {
            _this._command(value);
        }
    });
}

List.prototype = {
    constructor: List,

    _command: function _command(value) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        editor.selection.restoreSelection();
        if (editor.cmd.queryCommandState(value)) {
            return;
        }
        editor.cmd.do(value);

        var $selectionElem = editor.selection.getSelectionContainerElem();
        if ($selectionElem.getNodeName() === 'LI') {
            $selectionElem = $selectionElem.parent();
        }
        if (/^ol|ul$/i.test($selectionElem.getNodeName()) === false) {
            return;
        }
        if ($selectionElem.equal($textElem)) {
            return;
        }
        var $parent = $selectionElem.parent();
        if ($parent.equal($textElem)) {
            return;
        }

        $selectionElem.insertAfter($parent);
        $parent.remove();
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor.cmd.queryCommandState('insertUnOrderedList') || editor.cmd.queryCommandState('insertOrderedList')) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Justify(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-paragraph-left"></i></div>');
    this.type = 'droplist';

    this._active = false;

    this.droplist = new DropList(this, {
        width: 100,
        $title: $('<p>对齐方式</p>'),
        type: 'list', 
        list: [{ $elem: $('<span><i class="w-e-icon-paragraph-left"></i> 靠左</span>'), value: 'justifyLeft' }, { $elem: $('<span><i class="w-e-icon-paragraph-center"></i> 居中</span>'), value: 'justifyCenter' }, { $elem: $('<span><i class="w-e-icon-paragraph-right"></i> 靠右</span>'), value: 'justifyRight' }],
        onClick: function onClick(value) {
            _this._command(value);
        }
    });
}

Justify.prototype = {
    constructor: Justify,
    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do(value);
    }
};

function ForeColor(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-pencil2"></i></div>');
    this.type = 'droplist';

    var config = editor.config;
    var colors = config.colors || [];

    this._active = false;

    this.droplist = new DropList(this, {
        width: 120,
        $title: $('<p></p>'),
        type: 'inline-block', 
        list: colors.map(function (color) {
            return { $elem: $('<i style="color:' + color + ';" class="w-e-icon-pencil2"></i>'), value: color };
        }),
        onClick: function onClick(value) {
            _this._command(value);
        }
    });
}

ForeColor.prototype = {
    constructor: ForeColor,

    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('foreColor', value);
    }
};

function BackColor(editor) {
    var _this = this;

    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-paint-brush"></i></div>');
    this.type = 'droplist';

    var config = editor.config;
    var colors = config.colors || [];

    this._active = false;

    this.droplist = new DropList(this, {
        width: 120,
        $title: $('<p></p>'),
        type: 'inline-block', 
        list: colors.map(function (color) {
            return { $elem: $('<i style="color:' + color + ';" class="w-e-icon-paint-brush"></i>'), value: color };
        }),
        onClick: function onClick(value) {
            _this._command(value);
        }
    });
}

BackColor.prototype = {
    constructor: BackColor,

    _command: function _command(value) {
        var editor = this.editor;
        editor.cmd.do('backColor', value);
    }
};

function Quote(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-quotes-left"></i>\n        </div>');
    this.type = 'click';

    this._active = false;
}
Quote.prototype = {
    constructor: Quote,

    onClick: function onClick(e) {
        var editor = this.editor;
        var $selectionElem = editor.selection.getSelectionContainerElem();
        var nodeName = $selectionElem.getNodeName();

        if (!UA.isIE()) {
            if (nodeName === 'BLOCKQUOTE') {
                editor.cmd.do('formatBlock', '<P>');
            } else {
                editor.cmd.do('formatBlock', '<BLOCKQUOTE>');
            }
            return;
        }

        var content = void 0,
            $targetELem = void 0;
        if (nodeName === 'P') {
            content = $selectionElem.text();
            $targetELem = $('<blockquote>' + content + '</blockquote>');
            $targetELem.insertAfter($selectionElem);
            $selectionElem.remove();
            return;
        }
        if (nodeName === 'BLOCKQUOTE') {
            content = $selectionElem.text();
            $targetELem = $('<p>' + content + '</p>');
            $targetELem.insertAfter($selectionElem);
            $selectionElem.remove();
        }
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var reg = /^BLOCKQUOTE$/i;
        var cmdValue = editor.cmd.queryCommandValue('formatBlock');
        if (reg.test(cmdValue)) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Code(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-terminal"></i>\n        </div>');
    this.type = 'panel';

    this._active = false;
}
Code.prototype = {
    constructor: Code,

    onClick: function onClick(e) {
        var editor = this.editor;
        var $startElem = editor.selection.getSelectionStartElem();
        var $endElem = editor.selection.getSelectionEndElem();
        var isSeleEmpty = editor.selection.isSelectionEmpty();
        var selectionText = editor.selection.getSelectionText();
        var $code = void 0;

        if (!$startElem.equal($endElem)) {
            editor.selection.restoreSelection();
            return;
        }
        if (!isSeleEmpty) {
            $code = $('<code>' + selectionText + '</code>');
            editor.cmd.do('insertElem', $code);
            editor.selection.createRangeByElem($code, false);
            editor.selection.restoreSelection();
            return;
        }

        if (this._active) {
            this._createPanel($startElem.html());
        } else {
            this._createPanel();
        }
    },

    _createPanel: function _createPanel(value) {
        var _this = this;

        value = value || '';
        var type = !value ? 'new' : 'edit';
        var textId = getRandom('texxt');
        var btnId = getRandom('btn');

        var panel = new Panel(this, {
            width: 500,
            tabs: [{
                title: '',
                tpl: '<div>\n                        <textarea id="' + textId + '" style="height:145px;;">' + value + '</textarea>\n                        <div class="w-e-button-container">\n                            <button id="' + btnId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    <div>',
               
                events: [
                {
                    selector: '#' + btnId,
                    type: 'click',
                    fn: function fn() {
                        var $text = $('#' + textId);
                        var text = $text.val() || $text.html();
                        text = replaceHtmlSymbol(text);
                        if (type === 'new') {
                            _this._insertCode(text);
                        } else {
                            _this._updateCode(text);
                        }

                        return true;
                    }
                }]
            } // first tab end
            ] // tabs end
        }); // new Panel end
        panel.show();

        this.panel = panel;
    },

    _insertCode: function _insertCode(value) {
        var editor = this.editor;
        editor.cmd.do('insertHTML', '<pre><code>' + value + '</code></pre><p><br></p>');
    },

    _updateCode: function _updateCode(value) {
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        $selectionELem.html(value);
        editor.selection.restoreSelection();
    },
    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var $parentElem = $selectionELem.parent();
        if ($selectionELem.getNodeName() === 'CODE' && $parentElem.getNodeName() === 'PRE') {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Emoticon(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu">\n            <i class="w-e-icon-happy"></i>\n        </div>');
    this.type = 'panel';

    this._active = false;
}

Emoticon.prototype = {
    constructor: Emoticon,

    onClick: function onClick() {
        this._createPanel();
    },

    _createPanel: function _createPanel() {
        var _this = this;

        var editor = this.editor;
        var config = editor.config;
        var emotions = config.emotions || [];

        var tabConfig = [];
        emotions.forEach(function (emotData) {
            var emotType = emotData.type;
            var content = emotData.content || [];

            var faceHtml = '';

            if (emotType === 'emoji') {
                content.forEach(function (item) {
                    if (item) {
                        faceHtml += '<span class="w-e-item">' + item + '</span>';
                    }
                });
            }
            if (emotType === 'image') {
                content.forEach(function (item) {
                    var src = item.src;
                    var alt = item.alt;
                    if (src) {
                        faceHtml += '<span class="w-e-item"><img src="' + src + '" alt="' + alt + '" data-w-e="1"/></span>';
                    }
                });
            }

            tabConfig.push({
                title: emotData.title,
                tpl: '<div class="w-e-emoticon-container">' + faceHtml + '</div>',
                events: [{
                    selector: 'span.w-e-item',
                    type: 'click',
                    fn: function fn(e) {
                        var target = e.target;
                        var $target = $(target);
                        var nodeName = $target.getNodeName();

                        var insertHtml = void 0;
                        if (nodeName === 'IMG') {
                            insertHtml = $target.parent().html();
                        } else {
                            insertHtml = '<span>' + $target.html() + '</span>';
                        }

                        _this._insert(insertHtml);
                        return true;
                    }
                }]
            });
        });

        var panel = new Panel(this, {
            width: 300,
            height: 200,
            tabs: tabConfig
        });

        panel.show();

        this.panel = panel;
    },

    _insert: function _insert(emotHtml) {
        var editor = this.editor;
        editor.cmd.do('insertHTML', emotHtml);
    }
};

function Table(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-table2"></i></div>');
    this.type = 'panel';

    this._active = false;
}

Table.prototype = {
    constructor: Table,

    onClick: function onClick() {
        if (this._active) {
            this._createEditPanel();
        } else {
            this._createInsertPanel();
        }
    },

    _createInsertPanel: function _createInsertPanel() {
        var _this = this;

        var btnInsertId = getRandom('btn');
        var textRowNum = getRandom('row');
        var textColNum = getRandom('col');

        var panel = new Panel(this, {
            width: 250,
            tabs: [{
                title: '',
                tpl: '<div>\n                        <p style="text-align:left; padding:5px 0;">\n                            \u521B\u5EFA\n                            <input id="' + textRowNum + '" type="text" value="5" style="width:40px;text-align:center;"/>\n                            \u884C\n                            <input id="' + textColNum + '" type="text" value="5" style="width:40px;text-align:center;"/>\n                            \u5217\u7684\u8868\u683C\n                        </p>\n                        <div class="w-e-button-container">\n                            <button id="' + btnInsertId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    </div>',
                
                events: [{
                    selector: '#' + btnInsertId,
                    type: 'click',
                    fn: function fn() {
                        var rowNum = parseInt($('#' + textRowNum).val());
                        var colNum = parseInt($('#' + textColNum).val());

                        if (rowNum && colNum && rowNum > 0 && colNum > 0) {
                            _this._insert(rowNum, colNum);
                        }
                        return true;
                    }
                }]
            } // first tab end
            ] // tabs end
        }); // panel end

        panel.show();

        this.panel = panel;
    },

    _insert: function _insert(rowNum, colNum) {
        var r = void 0,
            c = void 0;
        var html = '<table border="0" width="100%" cellpadding="0" cellspacing="0">';
        for (r = 0; r < rowNum; r++) {
            html += '<tr>';
            if (r === 0) {
                for (c = 0; c < colNum; c++) {
                    html += '<th>&nbsp;</th>';
                }
            } else {
                for (c = 0; c < colNum; c++) {
                    html += '<td>&nbsp;</td>';
                }
            }
            html += '</tr>';
        }
        html += '</table><p><br></p>';

        var editor = this.editor;
        editor.cmd.do('insertHTML', html);

        editor.cmd.do('enableObjectResizing', false);
        editor.cmd.do('enableInlineTableEditing', false);
    },

    _createEditPanel: function _createEditPanel() {
        var _this2 = this;

        var addRowBtnId = getRandom('add-row');
        var addColBtnId = getRandom('add-col');
        var delRowBtnId = getRandom('del-row');
        var delColBtnId = getRandom('del-col');
        var delTableBtnId = getRandom('del-table');

        var panel = new Panel(this, {
            width: 320,
            tabs: [{
                title: '',
                tpl: '<div>\n                        <div class="w-e-button-container" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">\n                            <button id="' + addRowBtnId + '" class="left">\u589E\u52A0\u884C</button>\n                            <button id="' + delRowBtnId + '" class="red left">\u5220\u9664\u884C</button>\n                            <button id="' + addColBtnId + '" class="left">\u589E\u52A0\u5217</button>\n                            <button id="' + delColBtnId + '" class="red left">\u5220\u9664\u5217</button>\n                        </div>\n                        <div class="w-e-button-container">\n                            <button id="' + delTableBtnId + '" class="gray left">\u5220\u9664\u8868\u683C</button>\n                        </dv>\n                    </div>',
                
                events: [{
                    selector: '#' + addRowBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._addRow();
                        return true;
                    }
                }, {
                    selector: '#' + addColBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._addCol();
                        return true;
                    }
                }, {
                    selector: '#' + delRowBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._delRow();
                        return true;
                    }
                }, {
                    selector: '#' + delColBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._delCol();
                        return true;
                    }
                }, {
                    selector: '#' + delTableBtnId,
                    type: 'click',
                    fn: function fn() {
                        _this2._delTable();
                        return true;
                    }
                }]
            }]
        });
        panel.show();
    },

    _getLocationData: function _getLocationData() {
        var result = {};
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var nodeName = $selectionELem.getNodeName();
        if (nodeName !== 'TD' && nodeName !== 'TH') {
            return;
        }

        var $tr = $selectionELem.parent();
        var $tds = $tr.children();
        var tdLength = $tds.length;
        $tds.forEach(function (td, index) {
            if (td === $selectionELem[0]) {
                result.td = {
                    index: index,
                    elem: td,
                    length: tdLength
                };
                return false;
            }
        });

        var $tbody = $tr.parent();
        var $trs = $tbody.children();
        var trLength = $trs.length;
        $trs.forEach(function (tr, index) {
            if (tr === $tr[0]) {
                result.tr = {
                    index: index,
                    elem: tr,
                    length: trLength
                };
                return false;
            }
        });

        return result;
    },

    _addRow: function _addRow() {
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var $currentTr = $(trData.elem);
        var tdData = locationData.td;
        var tdLength = tdData.length;

        var newTr = document.createElement('tr');
        var tpl = '',
            i = void 0;
        for (i = 0; i < tdLength; i++) {
            tpl += '<td>&nbsp;</td>';
        }
        newTr.innerHTML = tpl;
        $(newTr).insertAfter($currentTr);
    },

    _addCol: function _addCol() {
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var tdData = locationData.td;
        var tdIndex = tdData.index;
        var $currentTr = $(trData.elem);
        var $trParent = $currentTr.parent();
        var $trs = $trParent.children();

        $trs.forEach(function (tr) {
            var $tr = $(tr);
            var $tds = $tr.children();
            var $currentTd = $tds.get(tdIndex);
            var name = $currentTd.getNodeName().toLowerCase();

            var newTd = document.createElement(name);
            $(newTd).insertAfter($currentTd);
        });
    },

    _delRow: function _delRow() {
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var $currentTr = $(trData.elem);
        $currentTr.remove();
    },

    _delCol: function _delCol() {
        var locationData = this._getLocationData();
        if (!locationData) {
            return;
        }
        var trData = locationData.tr;
        var tdData = locationData.td;
        var tdIndex = tdData.index;
        var $currentTr = $(trData.elem);
        var $trParent = $currentTr.parent();
        var $trs = $trParent.children();

        $trs.forEach(function (tr) {
            var $tr = $(tr);
            var $tds = $tr.children();
            var $currentTd = $tds.get(tdIndex);
            $currentTd.remove();
        });
    },

    _delTable: function _delTable() {
        var editor = this.editor;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var $table = $selectionELem.parentUntil('table');
        if (!$table) {
            return;
        }
        $table.remove();
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        var $selectionELem = editor.selection.getSelectionContainerElem();
        if (!$selectionELem) {
            return;
        }
        var nodeName = $selectionELem.getNodeName();
        if (nodeName === 'TD' || nodeName === 'TH') {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

function Video(editor) {
    this.editor = editor;
    this.$elem = $('<div class="w-e-menu"><i class="w-e-icon-play"></i></div>');
    this.type = 'panel';

    this._active = false;
}

Video.prototype = {
    constructor: Video,

    onClick: function onClick() {
        this._createPanel();
    },

    _createPanel: function _createPanel() {
        var _this = this;

        var textValId = getRandom('text-val');
        var btnId = getRandom('btn');

        var panel = new Panel(this, {
            width: 350,
            tabs: [{
                title: '',
                tpl: '<div>\n                        <input id="' + textValId + '" type="text" class="block" placeholder="\u683C\u5F0F\u5982\uFF1A<iframe src=... ></iframe>"/>\n                        <div class="w-e-button-container">\n                            <button id="' + btnId + '" class="right">\u63D2\u5165</button>\n                        </div>\n                    </div>',
                
                events: [{
                    selector: '#' + btnId,
                    type: 'click',
                    fn: function fn() {
                        var $text = $('#' + textValId);
                        var val = $text.val().trim();

                        
                        if (val) {
                            _this._insert(val);
                        }

                        return true;
                    }
                }]
            } // first tab end
            ] // tabs end
        }); // panel end

        panel.show();

        this.panel = panel;
    },

    _insert: function _insert(val) {
        var editor = this.editor;
        editor.cmd.do('insertHTML', val + '<p><br></p>');
    }
};


function Image(editor) {
    this.editor = editor;
    var imgMenuId = getRandom('w-e-img');
    this.$elem = $('<div class="w-e-menu" id="' + imgMenuId + '"><i class="w-e-icon-image"></i></div>');
    editor.imgMenuId = imgMenuId;
    this.type = 'panel';

    this._active = false;
}

Image.prototype = {
    constructor: Image,

    onClick: function onClick() {
        var editor = this.editor;
        var config = editor.config;
        if (config.qiniu) {
            return;
        }
        if (this._active) {
            this._createEditPanel();
        } else {
            this._createInsertPanel();
        }
    },

    _createEditPanel: function _createEditPanel() {
        var editor = this.editor;

        // id
        var width30 = getRandom('width-30');
        var width50 = getRandom('width-50');
        var width100 = getRandom('width-100');
        var delBtn = getRandom('del-btn');

        var tabsConfig = [{
            title: '',
            tpl: '<div>\n                    <div class="w-e-button-container" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">\n                        <span style="float:left;font-size:14px;margin:4px 5px 0 5px;color:#333;">\u6700\u5927\u5BBD\u5EA6\uFF1A</span>\n                        <button id="' + width30 + '" class="left">30%</button>\n                        <button id="' + width50 + '" class="left">50%</button>\n                        <button id="' + width100 + '" class="left">100%</button>\n                    </div>\n                    <div class="w-e-button-container">\n                        <button id="' + delBtn + '" class="gray left">\u5220\u9664\u56FE\u7247</button>\n                    </dv>\n                </div>',
            events: [{
                selector: '#' + width30,
                type: 'click',
                fn: function fn() {
                    var $img = editor._selectedImg;
                    if ($img) {
                        $img.css('max-width', '30%');
                    }
                    return true;
                }
            }, {
                selector: '#' + width50,
                type: 'click',
                fn: function fn() {
                    var $img = editor._selectedImg;
                    if ($img) {
                        $img.css('max-width', '50%');
                    }
                    return true;
                }
            }, {
                selector: '#' + width100,
                type: 'click',
                fn: function fn() {
                    var $img = editor._selectedImg;
                    if ($img) {
                        $img.css('max-width', '100%');
                    }
                    return true;
                }
            }, {
                selector: '#' + delBtn,
                type: 'click',
                fn: function fn() {
                    var $img = editor._selectedImg;
                    if ($img) {
                        $img.remove();
                    }
                    return true;
                }
            }]
        }];

        var panel = new Panel(this, {
            width: 300,
            tabs: tabsConfig
        });
        panel.show();

        this.panel = panel;
    },

    _createInsertPanel: function _createInsertPanel() {
        var editor = this.editor;
        var uploadImg = editor.uploadImg;
        var config = editor.config;

        // id
        var upTriggerId = getRandom('up-trigger');
        var upFileId = getRandom('up-file');
        var linkUrlId = getRandom('link-url');
        var linkBtnId = getRandom('link-btn');

        var tabsConfig = [{
            title: '',
            tpl: '<div class="w-e-up-img-container">\n                    <div id="' + upTriggerId + '" class="w-e-up-btn">\n                        <i class="w-e-icon-upload2"></i>\n                    </div>\n                    <div style="display:none;">\n                        <input id="' + upFileId + '" type="file" multiple="multiple" accept="image/jpg,image/jpeg,image/png,image/gif,image/bmp"/>\n                    </div>\n                </div>',
            events: [{
                selector: '#' + upTriggerId,
                type: 'click',
                fn: function fn() {
                    var $file = $('#' + upFileId);
                    var fileElem = $file[0];
                    if (fileElem) {
                        fileElem.click();
                    } else {
                        return true;
                    }
                }
            }, {
                selector: '#' + upFileId,
                type: 'change',
                fn: function fn() {
                    var $file = $('#' + upFileId);
                    var fileElem = $file[0];
                    if (!fileElem) {
                        return true;
                    }

                    var fileList = fileElem.files;
                    if (fileList.length) {
                        uploadImg.uploadImg(fileList);
                    }
                    return true;
                }
            }]
        }, // first tab end
        {
            title: '',
            tpl: '<div>\n                    <input id="' + linkUrlId + '" type="text" class="block" placeholder="\u56FE\u7247\u94FE\u63A5"/></td>\n                    <div class="w-e-button-container">\n                        <button id="' + linkBtnId + '" class="right">\u63D2\u5165</button>\n                    </div>\n                </div>',
            events: [{
                selector: '#' + linkBtnId,
                type: 'click',
                fn: function fn() {
                    var $linkUrl = $('#' + linkUrlId);
                    var url = $linkUrl.val().trim();

                    if (url) {
                        uploadImg.insertLinkImg(url);
                    }

                    return true;
                }
            }]
        } // second tab end
        ]; // tabs end

        var tabsConfigResult = [];
        if ((config.uploadImgShowBase64 || config.uploadImgServer || config.customUploadImg) && window.FileReader) {
           
            tabsConfigResult.push(tabsConfig[0]);
        }
        if (config.showLinkImg) {
            tabsConfigResult.push(tabsConfig[1]);
        }

        var panel = new Panel(this, {
            width: 300,
            tabs: tabsConfigResult
        });
        panel.show();

        this.panel = panel;
    },

    tryChangeActive: function tryChangeActive(e) {
        var editor = this.editor;
        var $elem = this.$elem;
        if (editor._selectedImg) {
            this._active = true;
            $elem.addClass('w-e-active');
        } else {
            this._active = false;
            $elem.removeClass('w-e-active');
        }
    }
};

var MenuConstructors = {};

MenuConstructors.bold = Bold;

MenuConstructors.head = Head;

MenuConstructors.fontSize = FontSize;

MenuConstructors.fontName = FontName;

MenuConstructors.link = Link;

MenuConstructors.italic = Italic;

MenuConstructors.redo = Redo;

MenuConstructors.strikeThrough = StrikeThrough;

MenuConstructors.underline = Underline;

MenuConstructors.undo = Undo;

MenuConstructors.list = List;

MenuConstructors.justify = Justify;

MenuConstructors.foreColor = ForeColor;

MenuConstructors.backColor = BackColor;

MenuConstructors.quote = Quote;

MenuConstructors.code = Code;

MenuConstructors.emoticon = Emoticon;

MenuConstructors.table = Table;

MenuConstructors.video = Video;

MenuConstructors.image = Image;

function Menus(editor) {
    this.editor = editor;
    this.menus = {};
}

Menus.prototype = {
    constructor: Menus,

    init: function init() {
        var _this = this;

        var editor = this.editor;
        var config = editor.config || {};
        var configMenus = config.menus || [];

        configMenus.forEach(function (menuKey) {
            var MenuConstructor = MenuConstructors[menuKey];
            if (MenuConstructor && typeof MenuConstructor === 'function') {
                _this.menus[menuKey] = new MenuConstructor(editor);
            }
        });

        this._addToToolbar();

        this._bindEvent();
    },

    _addToToolbar: function _addToToolbar() {
        var editor = this.editor;
        var $toolbarElem = editor.$toolbarElem;
        var menus = this.menus;
        var config = editor.config;
        var zIndex = config.zIndex + 1;
        objForEach(menus, function (key, menu) {
            var $elem = menu.$elem;
            if ($elem) {
                $elem.css('z-index', zIndex);
                $toolbarElem.append($elem);
            }
        });
    },

    _bindEvent: function _bindEvent() {
        var menus = this.menus;
        var editor = this.editor;
        objForEach(menus, function (key, menu) {
            var type = menu.type;
            if (!type) {
                return;
            }
            var $elem = menu.$elem;
            var droplist = menu.droplist;
            var panel = menu.panel;

            if (type === 'click' && menu.onClick) {
                $elem.on('click', function (e) {
                    if (editor.selection.getRange() == null) {
                        return;
                    }
                    menu.onClick(e);
                });
            }

            if (type === 'droplist' && droplist) {
                $elem.on('mouseenter', function (e) {
                    if (editor.selection.getRange() == null) {
                        return;
                    }
                    droplist.showTimeoutId = setTimeout(function () {
                        droplist.show();
                    }, 200);
                }).on('mouseleave', function (e) {
                    droplist.hideTimeoutId = setTimeout(function () {
                        droplist.hide();
                    }, 0);
                });
            }

            if (type === 'panel' && menu.onClick) {
                $elem.on('click', function (e) {
                    e.stopPropagation();
                    if (editor.selection.getRange() == null) {
                        return;
                    }
                    menu.onClick(e);
                });
            }
        });
    },

    changeActive: function changeActive() {
        var menus = this.menus;
        objForEach(menus, function (key, menu) {
            if (menu.tryChangeActive) {
                setTimeout(function () {
                    menu.tryChangeActive();
                }, 100);
            }
        });
    }
};

function getPasteText(e) {
    var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
    var pasteText = void 0;
    if (clipboardData == null) {
        pasteText = window.clipboardData && window.clipboardData.getData('text');
    } else {
        pasteText = clipboardData.getData('text/plain');
    }

    return replaceHtmlSymbol(pasteText);
}

function getPasteHtml(e, filterStyle, ignoreImg) {
    var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
    var pasteText = void 0,
        pasteHtml = void 0;
    if (clipboardData == null) {
        pasteText = window.clipboardData && window.clipboardData.getData('text');
    } else {
        pasteText = clipboardData.getData('text/plain');
        pasteHtml = clipboardData.getData('text/html');
    }
    if (!pasteHtml && pasteText) {
        pasteHtml = '<p>' + replaceHtmlSymbol(pasteText) + '</p>';
    }
    if (!pasteHtml) {
        return;
    }

    var docSplitHtml = pasteHtml.split('</html>');
    if (docSplitHtml.length === 2) {
        pasteHtml = docSplitHtml[0];
    }

    pasteHtml = pasteHtml.replace(/<(meta|script|link).+?>/igm, '');
    pasteHtml = pasteHtml.replace(/<!--.*?-->/mg, '');
    pasteHtml = pasteHtml.replace(/\s?data-.+?=('|").+?('|")/igm, '');

    if (ignoreImg) {
        pasteHtml = pasteHtml.replace(/<img.+?>/igm, '');
    }

    if (filterStyle) {
        pasteHtml = pasteHtml.replace(/\s?(class|style)=('|").*?('|")/igm, '');
    } else {
        pasteHtml = pasteHtml.replace(/\s?class=('|").*?('|")/igm, '');
    }

    return pasteHtml;
}

function getPasteImgs(e) {
    var result = [];
    var txt = getPasteText(e);
    if (txt) {
        return result;
    }

    var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
    var items = clipboardData.items;
    if (!items) {
        return result;
    }

    objForEach(items, function (key, value) {
        var type = value.type;
        if (/image/i.test(type)) {
            result.push(value.getAsFile());
        }
    });

    return result;
}
function getChildrenJSON($elem) {
    var result = [];
    var $children = $elem.childNodes() || []; 
    $children.forEach(function (curElem) {
        var elemResult = void 0;
        var nodeType = curElem.nodeType;
        if (nodeType === 3) {
            elemResult = curElem.textContent;
            elemResult = replaceHtmlSymbol(elemResult);
        }

        if (nodeType === 1) {
            elemResult = {};

            elemResult.tag = curElem.nodeName.toLowerCase();
            // attr
            var attrData = [];
            var attrList = curElem.attributes || {};
            var attrListLength = attrList.length || 0;
            for (var i = 0; i < attrListLength; i++) {
                var attr = attrList[i];
                attrData.push({
                    name: attr.name,
                    value: attr.value
                });
            }
            elemResult.attrs = attrData;
            elemResult.children = getChildrenJSON($(curElem));
        }

        result.push(elemResult);
    });
    return result;
}

function Text(editor) {
    this.editor = editor;
}
Text.prototype = {
    constructor: Text,

    init: function init() {
        this._bindEvent();
    },

    clear: function clear() {
        this.html('<p><br></p>');
    },

    html: function html(val) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        var html = void 0;
        if (val == null) {
            html = $textElem.html();
            html = html.replace(/\u200b/gm, '');
            return html;
        } else {
            $textElem.html(val);

            editor.initSelection();
        }
    },

    getJSON: function getJSON() {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        return getChildrenJSON($textElem);
    },

    text: function text(val) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        var text = void 0;
        if (val == null) {
            text = $textElem.text();
            text = text.replace(/\u200b/gm, '');
            return text;
        } else {
            $textElem.text('<p>' + val + '</p>');

            editor.initSelection();
        }
    },

    append: function append(html) {
        var editor = this.editor;
        var $textElem = editor.$textElem;
        $textElem.append($(html));
        editor.initSelection();
    },

    _bindEvent: function _bindEvent() {
        this._saveRangeRealTime();

        this._enterKeyHandle();

        this._clearHandle();

        this._pasteHandle();

        this._tabHandle();
        this._imgHandle();
        this._dragHandle();
    },

    _saveRangeRealTime: function _saveRangeRealTime() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        function saveRange(e) {
            editor.selection.saveRange();
            editor.menus.changeActive();
        }
        $textElem.on('keyup', saveRange);
        $textElem.on('mousedown', function (e) {
            $textElem.on('mouseleave', saveRange);
        });
        $textElem.on('mouseup', function (e) {
            saveRange();
            $textElem.off('mouseleave', saveRange);
        });
    },

    _enterKeyHandle: function _enterKeyHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        function insertEmptyP($selectionElem) {
            var $p = $('<p><br></p>');
            $p.insertBefore($selectionElem);
            editor.selection.createRangeByElem($p, true);
            editor.selection.restoreSelection();
            $selectionElem.remove();
        }

        function pHandle(e) {
            var $selectionElem = editor.selection.getSelectionContainerElem();
            var $parentElem = $selectionElem.parent();

            if ($parentElem.html() === '<code><br></code>') {
                insertEmptyP($selectionElem);
                return;
            }

            if (!$parentElem.equal($textElem)) {
                return;
            }

            var nodeName = $selectionElem.getNodeName();
            if (nodeName === 'P') {
                return;
            }

            if ($selectionElem.text()) {
                return;
            }

            insertEmptyP($selectionElem);
        }

        $textElem.on('keyup', function (e) {
            if (e.keyCode !== 13) {
                return;
            }
            pHandle(e);
        });

        function codeHandle(e) {
            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var $parentElem = $selectionElem.parent();
            var selectionNodeName = $selectionElem.getNodeName();
            var parentNodeName = $parentElem.getNodeName();

            if (selectionNodeName !== 'CODE' || parentNodeName !== 'PRE') {
                return;
            }

            if (!editor.cmd.queryCommandSupported('insertHTML')) {
                return;
            }

            if (editor._willBreakCode === true) {
                var $p = $('<p><br></p>');
                $p.insertAfter($parentElem);
                editor.selection.createRangeByElem($p, true);
                editor.selection.restoreSelection();
                editor._willBreakCode = false;

                e.preventDefault();
                return;
            }

            var _startOffset = editor.selection.getRange().startOffset;

            editor.cmd.do('insertHTML', '\n');
            editor.selection.saveRange();
            if (editor.selection.getRange().startOffset === _startOffset) {
                editor.cmd.do('insertHTML', '\n');
            }

            var codeLength = $selectionElem.html().length;
            if (editor.selection.getRange().startOffset + 1 === codeLength) {
                editor._willBreakCode = true;
            }
            e.preventDefault();
        }

        $textElem.on('keydown', function (e) {
            if (e.keyCode !== 13) {
                editor._willBreakCode = false;
                return;
            }
            codeHandle(e);
        });
    },

    _clearHandle: function _clearHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        $textElem.on('keydown', function (e) {
            if (e.keyCode !== 8) {
                return;
            }
            var txtHtml = $textElem.html().toLowerCase().trim();
            if (txtHtml === '<p><br></p>') {
                e.preventDefault();
                return;
            }
        });

        $textElem.on('keyup', function (e) {
            if (e.keyCode !== 8) {
                return;
            }
            var $p = void 0;
            var txtHtml = $textElem.html().toLowerCase().trim();

            if (!txtHtml || txtHtml === '<br>') {
                $p = $('<p><br/></p>');
                $textElem.html(''); 
                $textElem.append($p);
                editor.selection.createRangeByElem($p, false, true);
                editor.selection.restoreSelection();
            }
        });
    },

    _pasteHandle: function _pasteHandle() {
        var editor = this.editor;
        var config = editor.config;
        var pasteFilterStyle = config.pasteFilterStyle;
        var pasteTextHandle = config.pasteTextHandle;
        var ignoreImg = config.pasteIgnoreImg;
        var $textElem = editor.$textElem;

        var pasteTime = 0;
        function canDo() {
            var now = Date.now();
            var flag = false;
            if (now - pasteTime >= 100) {
                flag = true;
            }
            pasteTime = now;
            return flag;
        }
        function resetTime() {
            pasteTime = 0;
        }

        $textElem.on('paste', function (e) {
            if (UA.isIE()) {
                return;
            } else {
                e.preventDefault();
            }

            if (!canDo()) {
                return;
            }

            var pasteHtml = getPasteHtml(e, pasteFilterStyle, ignoreImg);
            var pasteText = getPasteText(e);
            pasteText = pasteText.replace(/\n/gm, '<br>');

            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var nodeName = $selectionElem.getNodeName();

            if (nodeName === 'CODE' || nodeName === 'PRE') {
                if (pasteTextHandle && isFunction(pasteTextHandle)) {
                    pasteText = '' + (pasteTextHandle(pasteText) || '');
                }
                editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
                return;
            }

            if (!pasteHtml) {
                resetTime();
                return;
            }
            try {
                if (pasteTextHandle && isFunction(pasteTextHandle)) {
                    pasteHtml = '' + (pasteTextHandle(pasteHtml) || '');
                }
                editor.cmd.do('insertHTML', pasteHtml);
            } catch (ex) {
                if (pasteTextHandle && isFunction(pasteTextHandle)) {
                    pasteText = '' + (pasteTextHandle(pasteText) || '');
                }
                editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
            }
        });

        $textElem.on('paste', function (e) {
            if (UA.isIE()) {
                return;
            } else {
                e.preventDefault();
            }

            if (!canDo()) {
                return;
            }

            var pasteFiles = getPasteImgs(e);
            if (!pasteFiles || !pasteFiles.length) {
                return;
            }

            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var nodeName = $selectionElem.getNodeName();
            if (nodeName === 'CODE' || nodeName === 'PRE') {
                return;
            }

            var uploadImg = editor.uploadImg;
            uploadImg.uploadImg(pasteFiles);
        });
    },

    _tabHandle: function _tabHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        $textElem.on('keydown', function (e) {
            if (e.keyCode !== 9) {
                return;
            }
            if (!editor.cmd.queryCommandSupported('insertHTML')) {
                return;
            }
            var $selectionElem = editor.selection.getSelectionContainerElem();
            if (!$selectionElem) {
                return;
            }
            var $parentElem = $selectionElem.parent();
            var selectionNodeName = $selectionElem.getNodeName();
            var parentNodeName = $parentElem.getNodeName();

            if (selectionNodeName === 'CODE' && parentNodeName === 'PRE') {
                editor.cmd.do('insertHTML', '    ');
            } else {
                editor.cmd.do('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
            }

            e.preventDefault();
        });
    },

    _imgHandle: function _imgHandle() {
        var editor = this.editor;
        var $textElem = editor.$textElem;

        $textElem.on('click', 'img', function (e) {
            var img = this;
            var $img = $(img);

            if ($img.attr('data-w-e') === '1') {
                return;
            }

            editor._selectedImg = $img;

            editor.selection.createRangeByElem($img);
            editor.selection.restoreSelection();
        });

        $textElem.on('click  keyup', function (e) {
            if (e.target.matches('img')) {
                return;
            }
            editor._selectedImg = null;
        });
    },

    _dragHandle: function _dragHandle() {
        var editor = this.editor;

        var $document = $(document);
        $document.on('dragleave drop dragenter dragover', function (e) {
            e.preventDefault();
        });

        var $textElem = editor.$textElem;
        $textElem.on('drop', function (e) {
            e.preventDefault();
            var files = e.dataTransfer && e.dataTransfer.files;
            if (!files || !files.length) {
                return;
            }

            var uploadImg = editor.uploadImg;
            uploadImg.uploadImg(files);
        });
    }
};


function Command(editor) {
    this.editor = editor;
}

Command.prototype = {
    constructor: Command,

    do: function _do(name, value) {
        var editor = this.editor;

        if (!editor._useStyleWithCSS) {
            document.execCommand('styleWithCSS', null, true);
            editor._useStyleWithCSS = true;
        }

        if (!editor.selection.getRange()) {
            return;
        }
        editor.selection.restoreSelection();

        var _name = '_' + name;
        if (this[_name]) {
            this[_name](value);
        } else {
            this._execCommand(name, value);
        }

        editor.menus.changeActive();

        editor.selection.saveRange();
        editor.selection.restoreSelection();

        editor.change && editor.change();
    },

    _insertHTML: function _insertHTML(html) {
        var editor = this.editor;
        var range = editor.selection.getRange();

        if (this.queryCommandSupported('insertHTML')) {
            this._execCommand('insertHTML', html);
        } else if (range.insertNode) {
            range.deleteContents();
            range.insertNode($(html)[0]);
        } else if (range.pasteHTML) {
            range.pasteHTML(html);
        }
    },

    _insertElem: function _insertElem($elem) {
        var editor = this.editor;
        var range = editor.selection.getRange();

        if (range.insertNode) {
            range.deleteContents();
            range.insertNode($elem[0]);
        }
    },

    _execCommand: function _execCommand(name, value) {
        document.execCommand(name, false, value);
    },

    queryCommandValue: function queryCommandValue(name) {
        return document.queryCommandValue(name);
    },

    queryCommandState: function queryCommandState(name) {
        return document.queryCommandState(name);
    },
    queryCommandSupported: function queryCommandSupported(name) {
        return document.queryCommandSupported(name);
    }
};

/*
    selection range API
*/

function API(editor) {
    this.editor = editor;
    this._currentRange = null;
}

API.prototype = {
    constructor: API,

    getRange: function getRange() {
        return this._currentRange;
    },

    saveRange: function saveRange(_range) {
        if (_range) {
            this._currentRange = _range;
            return;
        }

        var selection = window.getSelection();
        if (selection.rangeCount === 0) {
            return;
        }
        var range = selection.getRangeAt(0);

        var $containerElem = this.getSelectionContainerElem(range);
        if (!$containerElem) {
            return;
        }

        if ($containerElem.attr('contenteditable') === 'false' || $containerElem.parentUntil('[contenteditable=false]')) {
            return;
        }

        var editor = this.editor;
        var $textElem = editor.$textElem;
        if ($textElem.isContain($containerElem)) {
            this._currentRange = range;
        }
    },

    collapseRange: function collapseRange(toStart) {
        if (toStart == null) {
            toStart = false;
        }
        var range = this._currentRange;
        if (range) {
            range.collapse(toStart);
        }
    },

    getSelectionText: function getSelectionText() {
        var range = this._currentRange;
        if (range) {
            return this._currentRange.toString();
        } else {
            return '';
        }
    },

    getSelectionContainerElem: function getSelectionContainerElem(range) {
        range = range || this._currentRange;
        var elem = void 0;
        if (range) {
            elem = range.commonAncestorContainer;
            return $(elem.nodeType === 1 ? elem : elem.parentNode);
        }
    },
    getSelectionStartElem: function getSelectionStartElem(range) {
        range = range || this._currentRange;
        var elem = void 0;
        if (range) {
            elem = range.startContainer;
            return $(elem.nodeType === 1 ? elem : elem.parentNode);
        }
    },
    getSelectionEndElem: function getSelectionEndElem(range) {
        range = range || this._currentRange;
        var elem = void 0;
        if (range) {
            elem = range.endContainer;
            return $(elem.nodeType === 1 ? elem : elem.parentNode);
        }
    },

    isSelectionEmpty: function isSelectionEmpty() {
        var range = this._currentRange;
        if (range && range.startContainer) {
            if (range.startContainer === range.endContainer) {
                if (range.startOffset === range.endOffset) {
                    return true;
                }
            }
        }
        return false;
    },

    restoreSelection: function restoreSelection() {
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(this._currentRange);
    },

    createEmptyRange: function createEmptyRange() {
        var editor = this.editor;
        var range = this.getRange();
        var $elem = void 0;

        if (!range) {
            return;
        }
        if (!this.isSelectionEmpty()) {
            return;
        }

        try {
            if (UA.isWebkit()) {
                editor.cmd.do('insertHTML', '&#8203;');
                range.setEnd(range.endContainer, range.endOffset + 1);
                this.saveRange(range);
            } else {
                $elem = $('<strong>&#8203;</strong>');
                editor.cmd.do('insertElem', $elem);
                this.createRangeByElem($elem, true);
            }
        } catch (ex) {
        }
    },

    createRangeByElem: function createRangeByElem($elem, toStart, isContent) {
        if (!$elem.length) {
            return;
        }

        var elem = $elem[0];
        var range = document.createRange();

        if (isContent) {
            range.selectNodeContents(elem);
        } else {
            range.selectNode(elem);
        }

        if (typeof toStart === 'boolean') {
            range.collapse(toStart);
        }

        this.saveRange(range);
    }
};


function Progress(editor) {
    this.editor = editor;
    this._time = 0;
    this._isShow = false;
    this._isRender = false;
    this._timeoutId = 0;
    this.$textContainer = editor.$textContainerElem;
    this.$bar = $('<div class="w-e-progress"></div>');
}

Progress.prototype = {
    constructor: Progress,

    show: function show(progress) {
        var _this = this;

        if (this._isShow) {
            return;
        }
        this._isShow = true;

        var $bar = this.$bar;
        if (!this._isRender) {
            var $textContainer = this.$textContainer;
            $textContainer.append($bar);
        } else {
            this._isRender = true;
        }

        if (Date.now() - this._time > 100) {
            if (progress <= 1) {
                $bar.css('width', progress * 100 + '%');
                this._time = Date.now();
            }
        }

        var timeoutId = this._timeoutId;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(function () {
            _this._hide();
        }, 500);
    },

    _hide: function _hide() {
        var $bar = this.$bar;
        $bar.remove();

        this._time = 0;
        this._isShow = false;
        this._isRender = false;
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};


function UploadImg(editor) {
    this.editor = editor;
}

UploadImg.prototype = {
    constructor: UploadImg,

    _alert: function _alert(alertInfo, debugInfo) {
        var editor = this.editor;
        var debug = editor.config.debug;
        var customAlert = editor.config.customAlert;

        if (debug) {
            throw new Error('wangEditor: ' + (debugInfo || alertInfo));
        } else {
            if (customAlert && typeof customAlert === 'function') {
                customAlert(alertInfo);
            } else {
                alert(alertInfo);
            }
        }
    },

    insertLinkImg: function insertLinkImg(link) {
        var _this2 = this;

        if (!link) {
            return;
        }
        var editor = this.editor;
        var config = editor.config;

        var linkImgCheck = config.linkImgCheck;
        var checkResult = void 0;
        if (linkImgCheck && typeof linkImgCheck === 'function') {
            checkResult = linkImgCheck(link);
            if (typeof checkResult === 'string') {
                alert(checkResult);
                return;
            }
        }

        editor.cmd.do('insertHTML', '<img src="' + link + '" style="max-width:100%;"/>');

        var img = document.createElement('img');
        img.onload = function () {
            var callback = config.linkImgCallback;
            if (callback && typeof callback === 'function') {
                callback(link);
            }

            img = null;
        };
        img.onerror = function () {
            img = null;
            _this2._alert('插入图片错误', 'wangEditor: \u63D2\u5165\u56FE\u7247\u51FA\u9519\uFF0C\u56FE\u7247\u94FE\u63A5\u662F "' + link + '"\uFF0C\u4E0B\u8F7D\u8BE5\u94FE\u63A5\u5931\u8D25');
            return;
        };
        img.onabort = function () {
            img = null;
        };
        img.src = link;
    },

    uploadImg: function uploadImg(files) {
        var _this3 = this;

        if (!files || !files.length) {
            return;
        }

        var editor = this.editor;
        var config = editor.config;
        var uploadImgServer = config.uploadImgServer;
        var uploadImgShowBase64 = config.uploadImgShowBase64;

        var maxSize = config.uploadImgMaxSize;
        var maxSizeM = maxSize / 1024 / 1024;
        var maxLength = config.uploadImgMaxLength || 10000;
        var uploadFileName = config.uploadFileName || '';
        var uploadImgParams = config.uploadImgParams || {};
        var uploadImgParamsWithUrl = config.uploadImgParamsWithUrl;
        var uploadImgHeaders = config.uploadImgHeaders || {};
        var hooks = config.uploadImgHooks || {};
        var timeout = config.uploadImgTimeout || 3000;
        var withCredentials = config.withCredentials;
        if (withCredentials == null) {
            withCredentials = false;
        }
        var customUploadImg = config.customUploadImg;

        if (!customUploadImg) {
            if (!uploadImgServer && !uploadImgShowBase64) {
                return;
            }
        }

        var resultFiles = [];
        var errInfo = [];
        arrForEach(files, function (file) {
            var name = file.name;
            var size = file.size;

            if (!name || !size) {
                return;
            }

            if (/\.(jpg|jpeg|png|bmp|gif|webp)$/i.test(name) === false) {
                errInfo.push('\u3010' + name + '\u3011\u4E0D\u662F\u56FE\u7247');
                return;
            }
            if (maxSize < size) {
                errInfo.push('\u3010' + name + '\u3011\u5927\u4E8E ' + maxSizeM + 'M');
                return;
            }

            resultFiles.push(file);
        });
        if (errInfo.length) {
            this._alert('图片验证未通过: \n' + errInfo.join('\n'));
            return;
        }
        if (resultFiles.length > maxLength) {
            this._alert('一次最多上传' + maxLength + '张图片');
            return;
        }

        if (customUploadImg && typeof customUploadImg === 'function') {
            customUploadImg(resultFiles, this.insertLinkImg.bind(this));

            return;
        }

        var formdata = new FormData();
        arrForEach(resultFiles, function (file) {
            var name = uploadFileName || file.name;
            formdata.append(name, file);
        });

        if (uploadImgServer && typeof uploadImgServer === 'string') {
            var uploadImgServerArr = uploadImgServer.split('#');
            uploadImgServer = uploadImgServerArr[0];
            var uploadImgServerHash = uploadImgServerArr[1] || '';
            objForEach(uploadImgParams, function (key, val) {
                if (uploadImgParamsWithUrl) {
                    if (uploadImgServer.indexOf('?') > 0) {
                        uploadImgServer += '&';
                    } else {
                        uploadImgServer += '?';
                    }
                    uploadImgServer = uploadImgServer + key + '=' + val;
                }

                formdata.append(key, val);
            });
            if (uploadImgServerHash) {
                uploadImgServer += '#' + uploadImgServerHash;
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', uploadImgServer);

            xhr.timeout = timeout;
            xhr.ontimeout = function () {
                if (hooks.timeout && typeof hooks.timeout === 'function') {
                    hooks.timeout(xhr, editor);
                }

                _this3._alert('SSSS!');
            };

            if (xhr.upload) {
                xhr.upload.onprogress = function (e) {
                    var percent = void 0;
                    var progressBar = new Progress(editor);
                    if (e.lengthComputable) {
                        percent = e.loaded / e.total;
                        progressBar.show(percent);
                    }
                };
            }

            xhr.onreadystatechange = function () {
                var result = void 0;
                if (xhr.readyState === 4) {
                    if (xhr.status < 200 || xhr.status >= 300) {
                        // hook - error
                        if (hooks.error && typeof hooks.error === 'function') {
                            hooks.error(xhr, editor);
                        }

                        _this3._alert('上传图片发生错误', '\u4E0A\u4F20\u56FE\u7247\u53D1\u751F\u9519\u8BEF\uFF0C\u670D\u52A1\u5668\u8FD4\u56DE\u72B6\u6001\u662F ' + xhr.status);
                        return;
                    }

                    result = xhr.responseText;
                    if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) !== 'object') {
                        try {
                            result = JSON.parse(result);
                        } catch (ex) {
                            // hook - fail
                            if (hooks.fail && typeof hooks.fail === 'function') {
                                hooks.fail(xhr, editor, result);
                            }

                            _this3._alert('_alert', '_alert，_alert: ' + result);
                            return;
                        }
                    }
                    if (!hooks.customInsert && result.errno != '0') {
                        // hook - fail
                        if (hooks.fail && typeof hooks.fail === 'function') {
                            hooks.fail(xhr, editor, result);
                        }

                        _this3._alert('errno', 'errno，errno errno=' + result.errno);
                    } else {
                        if (hooks.customInsert && typeof hooks.customInsert === 'function') {
                            hooks.customInsert(_this3.insertLinkImg.bind(_this3), result, editor);
                        } else {
                            var data = result.data || [];
                            data.forEach(function (link) {
                                _this3.insertLinkImg(link);
                            });
                        }

                        // hook - success
                        if (hooks.success && typeof hooks.success === 'function') {
                            hooks.success(xhr, editor, result);
                        }
                    }
                }
            };

            // hook - before
            if (hooks.before && typeof hooks.before === 'function') {
                var beforeResult = hooks.before(xhr, editor, resultFiles);
                if (beforeResult && (typeof beforeResult === 'undefined' ? 'undefined' : _typeof(beforeResult)) === 'object') {
                    if (beforeResult.prevent) {
                        this._alert(beforeResult.msg);
                        return;
                    }
                }
            }

            objForEach(uploadImgHeaders, function (key, val) {
                xhr.setRequestHeader(key, val);
            });

            xhr.withCredentials = withCredentials;

            xhr.send(formdata);

            return;
        }

        if (uploadImgShowBase64) {
            arrForEach(files, function (file) {
                var _this = _this3;
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    _this.insertLinkImg(this.result);
                };
            });
        }
    }
};

var editorId = 1;

function Editor(toolbarSelector, textSelector) {
    if (toolbarSelector == null) {
        throw new Error('Error');
    }
    this.id = 'wangEditor-' + editorId++;

    this.toolbarSelector = toolbarSelector;
    this.textSelector = textSelector;

    this.customConfig = {};
}

Editor.prototype = {
    constructor: Editor,

    _initConfig: function _initConfig() {
        var target = {};
        this.config = Object.assign(target, config, this.customConfig);

        var langConfig = this.config.lang || {};
        var langArgs = [];
        objForEach(langConfig, function (key, val) {
            langArgs.push({
                reg: new RegExp(key, 'img'),
                val: val

            });
        });
        this.config.langArgs = langArgs;
    },

    _initDom: function _initDom() {
        var _this = this;

        var toolbarSelector = this.toolbarSelector;
        var $toolbarSelector = $(toolbarSelector);
        var textSelector = this.textSelector;

        var config$$1 = this.config;
        var zIndex = config$$1.zIndex;

        var $toolbarElem = void 0,
            $textContainerElem = void 0,
            $textElem = void 0,
            $children = void 0;

        if (textSelector == null) {
            $toolbarElem = $('<div></div>');
            $textContainerElem = $('<div></div>');

            $children = $toolbarSelector.children();

            $toolbarSelector.append($toolbarElem).append($textContainerElem);

            $toolbarElem.css('background-color', '#f1f1f1').css('border', '1px solid #ccc');
            $textContainerElem.css('border', '1px solid #ccc').css('border-top', 'none').css('height', '300px');
        } else {
            $toolbarElem = $toolbarSelector;
            $textContainerElem = $(textSelector);
            $children = $textContainerElem.children();
        }

        $textElem = $('<div></div>');
        $textElem.attr('contenteditable', 'true').css('width', '100%').css('height', '100%');

        if ($children && $children.length) {
            $textElem.append($children);
        } else {
            $textElem.append($('<p><br></p>'));
        }

        $textContainerElem.append($textElem);

        $toolbarElem.addClass('w-e-toolbar');
        $textContainerElem.addClass('w-e-text-container');
        $textContainerElem.css('z-index', zIndex);
        $textElem.addClass('w-e-text');

        var toolbarElemId = getRandom('toolbar-elem');
        $toolbarElem.attr('id', toolbarElemId);
        var textElemId = getRandom('text-elem');
        $textElem.attr('id', textElemId);

        this.$toolbarElem = $toolbarElem;
        this.$textContainerElem = $textContainerElem;
        this.$textElem = $textElem;
        this.toolbarElemId = toolbarElemId;
        this.textElemId = textElemId;

        var compositionEnd = true;
        $textContainerElem.on('compositionstart', function () {
            compositionEnd = false;
        });
        $textContainerElem.on('compositionend', function () {
            compositionEnd = true;
        });

        $textContainerElem.on('click keyup', function () {
            compositionEnd && _this.change && _this.change();
        });
        $toolbarElem.on('click', function () {
            this.change && this.change();
        });

        if (config$$1.onfocus || config$$1.onblur) {
            this.isFocus = false;

            $(document).on('click', function (e) {
                var isChild = $textElem.isContain($(e.target));

                var isToolbar = $toolbarElem.isContain($(e.target));
                var isMenu = $toolbarElem[0] == e.target ? true : false;

                if (!isChild) {
                    if (isToolbar && !isMenu) {
                        return;
                    }

                    if (_this.isFocus) {
                        _this.onblur && _this.onblur();
                    }
                    _this.isFocus = false;
                } else {
                    if (!_this.isFocus) {
                        _this.onfocus && _this.onfocus();
                    }
                    _this.isFocus = true;
                }
            });
        }
    },

    _initCommand: function _initCommand() {
        this.cmd = new Command(this);
    },

    _initSelectionAPI: function _initSelectionAPI() {
        this.selection = new API(this);
    },

    _initUploadImg: function _initUploadImg() {
        this.uploadImg = new UploadImg(this);
    },

    _initMenus: function _initMenus() {
        this.menus = new Menus(this);
        this.menus.init();
    },

    _initText: function _initText() {
        this.txt = new Text(this);
        this.txt.init();
    },

    initSelection: function initSelection(newLine) {
        var $textElem = this.$textElem;
        var $children = $textElem.children();
        if (!$children.length) {
            $textElem.append($('<p><br></p>'));
            this.initSelection();
            return;
        }

        var $last = $children.last();

        if (newLine) {
            var html = $last.html().toLowerCase();
            var nodeName = $last.getNodeName();
            if (html !== '<br>' && html !== '<br\/>' || nodeName !== 'P') {
                $textElem.append($('<p><br></p>'));
                this.initSelection();
                return;
            }
        }

        this.selection.createRangeByElem($last, false, true);
        this.selection.restoreSelection();
    },

    _bindEvent: function _bindEvent() {
        var onChangeTimeoutId = 0;
        var beforeChangeHtml = this.txt.html();
        var config$$1 = this.config;

        var onchangeTimeout = config$$1.onchangeTimeout;
        onchangeTimeout = parseInt(onchangeTimeout, 10);
        if (!onchangeTimeout || onchangeTimeout <= 0) {
            onchangeTimeout = 200;
        }

        var onchange = config$$1.onchange;
        if (onchange && typeof onchange === 'function') {
            this.change = function () {
                var currentHtml = this.txt.html();

                if (currentHtml.length === beforeChangeHtml.length) {
                    if (currentHtml === beforeChangeHtml) {
                        return;
                    }
                }

                if (onChangeTimeoutId) {
                    clearTimeout(onChangeTimeoutId);
                }
                onChangeTimeoutId = setTimeout(function () {
                    onchange(currentHtml);
                    beforeChangeHtml = currentHtml;
                }, onchangeTimeout);
            };
        }

        var onblur = config$$1.onblur;
        if (onblur && typeof onblur === 'function') {
            this.onblur = function () {
                var currentHtml = this.txt.html();
                onblur(currentHtml);
            };
        }

        var onfocus = config$$1.onfocus;
        if (onfocus && typeof onfocus === 'function') {
            this.onfocus = function () {
                onfocus();
            };
        }
    },

    create: function create() {
        this._initConfig();

        this._initDom();

        this._initCommand();

        this._initSelectionAPI();

        this._initText();

        this._initMenus();

        this._initUploadImg();

        this.initSelection(true);

        this._bindEvent();
    },
    _offAllEvent: function _offAllEvent() {
        $.offAll();
    }
};

try {
    document;
} catch (ex) {
    throw new Error('Error');
}

polyfill();

var inlinecss = '.w-e-toolbar,.w-e-text-container,.w-e-menu-panel {  padding: 0;  margin: 0;  box-sizing: border-box;}.w-e-toolbar *,.w-e-text-container *,.w-e-menu-panel * {  padding: 0;  margin: 0;  box-sizing: border-box;}.w-e-clear-fix:after {  content: "";  display: table;  clear: both;}.w-e-toolbar .w-e-droplist {  position: absolute;  left: 0;  top: 0;  background-color: #fff;  border: 1px solid #f1f1f1;  border-right-color: #ccc;  border-bottom-color: #ccc;}.w-e-toolbar .w-e-droplist .w-e-dp-title {  text-align: center;  color: #999;  line-height: 2;  border-bottom: 1px solid #f1f1f1;  font-size: 13px;}.w-e-toolbar .w-e-droplist ul.w-e-list {  list-style: none;  line-height: 1;}.w-e-toolbar .w-e-droplist ul.w-e-list li.w-e-item {  color: #333;  padding: 5px 0;}.w-e-toolbar .w-e-droplist ul.w-e-list li.w-e-item:hover {  background-color: #f1f1f1;}.w-e-toolbar .w-e-droplist ul.w-e-block {  list-style: none;  text-align: left;  padding: 5px;}.w-e-toolbar .w-e-droplist ul.w-e-block li.w-e-item {  display: inline-block;  *display: inline;  *zoom: 1;  padding: 3px 5px;}.w-e-toolbar .w-e-droplist ul.w-e-block li.w-e-item:hover {  background-color: #f1f1f1;}@font-face {  font-family: \'w-e-icon\';  src: url(data:application/x-font-woff;charset=utf-8;base64,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) format(\'truetype\');  font-weight: normal;  font-style: normal;}[class^="w-e-icon-"],[class*=" w-e-icon-"] {  /* use !important to prevent issues with browser extensions that change fonts */  font-family: \'w-e-icon\' !important;  speak: none;  font-style: normal;  font-weight: normal;  font-variant: normal;  text-transform: none;  line-height: 1;  /* Better Font Rendering =========== */  -webkit-font-smoothing: antialiased;  -moz-osx-font-smoothing: grayscale;}.w-e-icon-close:before {  content: "\\f00d";}.w-e-icon-upload2:before {  content: "\\e9c6";}.w-e-icon-trash-o:before {  content: "\\f014";}.w-e-icon-header:before {  content: "\\f1dc";}.w-e-icon-pencil2:before {  content: "\\e906";}.w-e-icon-paint-brush:before {  content: "\\f1fc";}.w-e-icon-image:before {  content: "\\e90d";}.w-e-icon-play:before {  content: "\\e912";}.w-e-icon-location:before {  content: "\\e947";}.w-e-icon-undo:before {  content: "\\e965";}.w-e-icon-redo:before {  content: "\\e966";}.w-e-icon-quotes-left:before {  content: "\\e977";}.w-e-icon-list-numbered:before {  content: "\\e9b9";}.w-e-icon-list2:before {  content: "\\e9bb";}.w-e-icon-link:before {  content: "\\e9cb";}.w-e-icon-happy:before {  content: "\\e9df";}.w-e-icon-bold:before {  content: "\\ea62";}.w-e-icon-underline:before {  content: "\\ea63";}.w-e-icon-italic:before {  content: "\\ea64";}.w-e-icon-strikethrough:before {  content: "\\ea65";}.w-e-icon-table2:before {  content: "\\ea71";}.w-e-icon-paragraph-left:before {  content: "\\ea77";}.w-e-icon-paragraph-center:before {  content: "\\ea78";}.w-e-icon-paragraph-right:before {  content: "\\ea79";}.w-e-icon-terminal:before {  content: "\\f120";}.w-e-icon-page-break:before {  content: "\\ea68";}.w-e-icon-cancel-circle:before {  content: "\\ea0d";}.w-e-icon-font:before {  content: "\\ea5c";}.w-e-icon-text-heigh:before {  content: "\\ea5f";}.w-e-toolbar {  display: -webkit-box;  display: -ms-flexbox;  display: flex;  padding: 0 5px;  /* flex-wrap: wrap; */  /* 单个菜单 */}.w-e-toolbar .w-e-menu {  position: relative;  text-align: center;  padding: 5px 10px;  cursor: pointer;}.w-e-toolbar .w-e-menu i {  color: #999;}.w-e-toolbar .w-e-menu:hover i {  color: #333;}.w-e-toolbar .w-e-active i {  color: #1e88e5;}.w-e-toolbar .w-e-active:hover i {  color: #1e88e5;}.w-e-text-container .w-e-panel-container {  position: absolute;  top: 0;  left: 50%;  border: 1px solid #ccc;  border-top: 0;  box-shadow: 1px 1px 2px #ccc;  color: #333;  background-color: #fff;  /* 为 emotion panel 定制的样式 */  /* 上传图片的 panel 定制样式 */}.w-e-text-container .w-e-panel-container .w-e-panel-close {  position: absolute;  right: 0;  top: 0;  padding: 5px;  margin: 2px 5px 0 0;  cursor: pointer;  color: #999;}.w-e-text-container .w-e-panel-container .w-e-panel-close:hover {  color: #333;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-title {  list-style: none;  display: -webkit-box;  display: -ms-flexbox;  display: flex;  font-size: 14px;  margin: 2px 10px 0 10px;  border-bottom: 1px solid #f1f1f1;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-title .w-e-item {  padding: 3px 5px;  color: #999;  cursor: pointer;  margin: 0 3px;  position: relative;  top: 1px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-title .w-e-active {  color: #333;  border-bottom: 1px solid #333;  cursor: default;  font-weight: 700;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content {  padding: 10px 15px 10px 15px;  font-size: 16px;  /* 输入框的样式 */  /* 按钮的样式 */}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input:focus,.w-e-text-container .w-e-panel-container .w-e-panel-tab-content textarea:focus,.w-e-text-container .w-e-panel-container .w-e-panel-tab-content button:focus {  outline: none;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content textarea {  width: 100%;  border: 1px solid #ccc;  padding: 5px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content textarea:focus {  border-color: #1e88e5;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text] {  border: none;  border-bottom: 1px solid #ccc;  font-size: 14px;  height: 20px;  color: #333;  text-align: left;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text].small {  width: 30px;  text-align: center;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text].block {  display: block;  width: 100%;  margin: 10px 0;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content input[type=text]:focus {  border-bottom: 2px solid #1e88e5;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button {  font-size: 14px;  color: #1e88e5;  border: none;  padding: 5px 10px;  background-color: #fff;  cursor: pointer;  border-radius: 3px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.left {  float: left;  margin-right: 10px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.right {  float: right;  margin-left: 10px;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.gray {  color: #999;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button.red {  color: #c24f4a;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container button:hover {  background-color: #f1f1f1;}.w-e-text-container .w-e-panel-container .w-e-panel-tab-content .w-e-button-container:after {  content: "";  display: table;  clear: both;}.w-e-text-container .w-e-panel-container .w-e-emoticon-container .w-e-item {  cursor: pointer;  font-size: 18px;  padding: 0 3px;  display: inline-block;  *display: inline;  *zoom: 1;}.w-e-text-container .w-e-panel-container .w-e-up-img-container {  text-align: center;}.w-e-text-container .w-e-panel-container .w-e-up-img-container .w-e-up-btn {  display: inline-block;  *display: inline;  *zoom: 1;  color: #999;  cursor: pointer;  font-size: 60px;  line-height: 1;}.w-e-text-container .w-e-panel-container .w-e-up-img-container .w-e-up-btn:hover {  color: #333;}.w-e-text-container {  position: relative;}.w-e-text-container .w-e-progress {  position: absolute;  background-color: #1e88e5;  bottom: 0;  left: 0;  height: 1px;}.w-e-text {  padding: 0 10px;  overflow-y: scroll;}.w-e-text p,.w-e-text h1,.w-e-text h2,.w-e-text h3,.w-e-text h4,.w-e-text h5,.w-e-text table,.w-e-text pre {  margin: 10px 0;  line-height: 1.5;}.w-e-text ul,.w-e-text ol {  margin: 10px 0 10px 20px;}.w-e-text blockquote {  display: block;  border-left: 8px solid #d0e5f2;  padding: 5px 10px;  margin: 10px 0;  line-height: 1.4;  font-size: 100%;  background-color: #f1f1f1;}.w-e-text code {  display: inline-block;  *display: inline;  *zoom: 1;  background-color: #f1f1f1;  border-radius: 3px;  padding: 3px 5px;  margin: 0 3px;}.w-e-text pre code {  display: block;}.w-e-text table {  border-top: 1px solid #ccc;  border-left: 1px solid #ccc;}.w-e-text table td,.w-e-text table th {  border-bottom: 1px solid #ccc;  border-right: 1px solid #ccc;  padding: 3px 5px;}.w-e-text table th {  border-bottom: 2px solid #ccc;  text-align: center;}.w-e-text:focus {  outline: none;}.w-e-text img {  cursor: pointer;}.w-e-text img:hover {  box-shadow: 0 0 5px #333;}';

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = inlinecss;
document.getElementsByTagName('HEAD').item(0).appendChild(style);

var index = window.wangEditor || Editor;

return index;

})));

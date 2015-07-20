var customSpellchecker = "custom_spellchecker";


function unwrapbogus(node) {
    node.outerHTML = node.innerHTML;
}

var caret_marker = String.fromCharCode(8) + String.fromCharCode(127) + String.fromCharCode(1);

function putCursor(editor) {
    if (editor.status === 'destroyed') {
        return null;
    }
    var sel = editor.window.$.getSelection();
    if (!sel) {
        return null;
    }
    if (sel.getRangeAt && sel.rangeCount) {
        var range = sel.getRangeAt(0);
        range.insertNode(editor.document.$.createTextNode(caret_marker));
    }
}

function isCDATA(elem) {
    var n = elem.nodeName.toLowerCase();
    if (n == "script") {
        return true;
    }
    if (n == "style") {
        return true;
    }
    if (n == "textarea") {
        return true;
    }
    return false;
}

function FindTextNodes(elem) {
    // recursive but asynchronous so it can not choke
    var textNodes = [];
    FindTextNodes_r(elem);

    function FindTextNodes_r(elem) {
        for (var i = 0; i < elem.childNodes.length; i++) {
            var child = elem.childNodes[i];
            if (child.nodeType == 3) {
                textNodes.push(child)
            } else if (!isCDATA(child) && child.childNodes) {
                FindTextNodes_r(child);
            }
        }
    }
    return textNodes;
}


function getCaret(editor) {
    if (!editor.window.$.getSelection) {
        return null
    }
    var allTextNodes = FindTextNodes(editor.document.$.body);
    var caretpos = null
    var caretnode = null
    for (var i = 0; i < allTextNodes.length; i++) {
        if (allTextNodes[i].data.indexOf(caret_marker) > -1) {
            caretnode = allTextNodes[i];
            caretpos = allTextNodes[i].data.indexOf(caret_marker);
            allTextNodes[i].data = allTextNodes[i].data.replace(caret_marker, "");
            return {
                node: caretnode,
                offset: caretpos
            };
        }
    }
}

function setCaret(editor, bookmark) {
    if (!bookmark) {
        return;
    }
    if (!editor.window.$.getSelection) {
        return null;
    }
    var nodeIndex = null;
    var allTextNodes = FindTextNodes(editor.document.$.body);
    var caretnode = bookmark.node;
    var caretpos = bookmark.offset;
    for (var i = 0; i < allTextNodes.length; i++) {
        if (allTextNodes[i] == caretnode) {
            nodeIndex = i;
        }
    }
    if (nodeIndex === null) {
        return;
    }
    for (var i = nodeIndex; i < allTextNodes.length - 1; i++) {
        if (caretpos <= allTextNodes[i].data.length) {
            break;
        }
        caretpos -= allTextNodes[i].data.length;
        caretnode = allTextNodes[i + 1];
    }
    var textNode = caretnode;
    var sel = editor.window.$.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
        var range = sel.getRangeAt(0);
        range.collapse(true);
        range.setStart(textNode, caretpos);
        range.setEnd(textNode, caretpos);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function clearAllSpellCheckingSpans(editor) {
    if (editor.status === 'destroyed') {
        return;
    }
    putCursor(editor);
    var caret = getCaret(editor);
    var node, nodes;
    var finished = false;
    while (!finished) {
        finished = true;
        nodes = editor.document.$.getElementsByTagName("span");
        var i = nodes.length;
        while (i--) {
            node = nodes[i];
            if (node.className == ('js-spell-error')) {
                unwrapbogus(node);
                finished = false;
            }
        }
    }

    setCaret(editor, caret);
}

function getSpellcheckerOptions(editor) {
    return {
        getText: function () {
            var ref;
            ref = editor.getSnapshot();
            return ref === true ? '' : ref.replace(/(<([^>]+)>)/ig," ").replace(/&nbsp;/g," ");
        },
        onStop: function () {
            editor.getCommand('change_state').setState(CKEDITOR.TRISTATE_OFF);
        },
        onStart: function () {
            editor.getCommand('change_state').setState(CKEDITOR.TRISTATE_ON);
        },
        clearSpans: function (force) {
            var _ref, _ref2;
            if (force === true) {
                clearAllSpellCheckingSpans(editor);
                return;
            }
            if (_ref2 = editor.getSelection() && editor.getSelection().getSelectedText()) {
                return;
            }
            if (_ref2 == null) {
                return;
            }
            if ((_ref = editor.getSelection().getStartElement()) != null && _ref.hasClass('js-spell-error')) {
                return;
            }
            clearAllSpellCheckingSpans(editor);
        },
        replaceWords: function (words) {
            if (editor.getSelection().getSelectedText()) {
                return;
            }

            if (editor.getSelection().getStartElement().hasClass('js-spell-error')) {
                return;
            }

            editor.getWin = function() {
                return editor.window.$;
            };
            editor.getDoc = function() {
                return editor.document.$;
            };
            editor.getBody = function() {
                return editor.document.$.body;
            };

            function MarkAllTypos(body) {
                var allTextNodes = FindTextNodes(body) ;
                for (var i = 0; i < allTextNodes.length; i++) {
                    MarkTypos(allTextNodes[i], words);
                }
            }


            function MarkTypos(textNode, words) {
                var currentNode = textNode;
                var newNodes = [textNode];
                $.each(words, function (i, word) {

                    function replaceWord(index, word) {
                        var newNode = currentNode.splitText(index);
                        var span = editor.getDoc().createElement('span');
                        span.className = "js-spell-error";
                        var middle = editor.getDoc().createTextNode(word);
                        span.appendChild(middle);

                        currentNode.parentNode.insertBefore(span, newNode);
                        newNode.data = newNode.data.substr(word.length);

                        newNodes.push(middle);
                        newNodes.push(newNode);
                        MarkTypos(newNode, words);
                    }

                    var match, matches = [];
                    var regexp = new RegExp('([^а-яА-Я]|^)(' + word + ')([^а-яА-Я]|$)', 'g');
                        while ((match = regexp.exec(currentNode.data)) != null) {
                            if (match.length > 1) {
                                replaceWord(match.index + match[0].indexOf(word), word);
                            }
                    }
                });

            }

            editor.getBody().normalize();
            putCursor(editor);
            var caret = getCaret(editor);
            MarkAllTypos(editor.getBody());
            setCaret(editor, caret);
        }
    };
}


CKEDITOR.plugins.add(customSpellchecker, {
    icons: customSpellchecker,
    init: function(editor) {

        editor.on("instanceReady", function() {
            editor.getCommand('change_state').exec();
        });

        editor.addCommand('change_state', {
            exec: function (editor) {
                if (this.state === CKEDITOR.TRISTATE_ON) {
                    // stop spellchecker
                    $(editor.element.$).spellchecker('stop');
                    this.setState(CKEDITOR.TRISTATE_OFF);
                } else {
                    // start spellchecker
                    $(editor.element.$).spellchecker(getSpellcheckerOptions(editor));
                    function textChanged() {
                        $(editor.element.$).spellchecker("changed");
                    }

                    editor.on("beforeGetData", textChanged);
                    editor.on("insertHtml", textChanged);
                    editor.on("insertText", textChanged);
                    editor.on("insertElement", textChanged);

                    this.setState(CKEDITOR.TRISTATE_ON);
                }
            }
        });

        editor.ui.addButton(customSpellchecker, {
            label: 'Проверка правописания',
            command: 'change_state',
            toolbar: customSpellchecker
        });

        if (editor.contextMenu) {
            var hidden = true;

            function hideContextMenu(selector) {
                if (hidden === true) {
                    return;
                }
                $(selector).hide();
                $(selector).empty();
                //$(".cke_maximized").css("z-index", 9993);
                hidden = true;
            }

            var oneShot = function (contextMenuSelector) {
                $(document.body).on('click', function (e) {
                    if (e.originalEvent.button === 0) {
                        hideContextMenu(contextMenuSelector);
                    }
                });

                editor.window.on("click", function (e) {
                    if (e.data.$.button === 0) {
                        hideContextMenu(contextMenuSelector);
                    }
                });

                oneShot = function(){};
            };

            /**/

            editor.contextMenu.addListener(function (startElement, selection, path) {
                var x = 0;
                var y  = 0;
                var contextMenuId = "contextMenu";
                var contextMenuSelector = "#" + contextMenuId;

                document.body.appendChild(document.getElementById(contextMenuId));

                if (!startElement.hasClass('js-spell-error')) {
                    if (hidden === true) {
                        return;
                    }
                    hideContextMenu(contextMenuSelector);
                    return;
                }

                editor.contextMenu.removeAll();

                var obj = startElement.$;

                // Ищем асболютные координаты меню в зависимости от нахождения элемента
                //// Get offSetPos from IFrame-->Up
                var el = editor.window.getFrame().$;
                x += el.offsetLeft;
                y += el.offsetTop;
                el = el.offsetParent;
                while (el){
                    x += el.offsetLeft - el.scrollLeft;
                    y += el.offsetTop - el.scrollTop;
                    el = el.offsetParent;
                }

                // Get offSetPos from IFrame-->Down[/b]
                while (obj.offsetParent){
                    x += obj.offsetLeft;
                    y += obj.offsetTop;
                    obj = obj.offsetParent;
                }

                var scroll = editor.window.getScrollPosition();

                x += obj.offsetLeft - scroll.x || 0;
                y += obj.offsetTop - scroll.y || 0;

                // если редактор открыт в модальном окне, то к позиции меню применяется
                // более сложная математика: у нас есть скрол основной страницы (окна) и скролл
                // у модального окна и они должны друг друга компенсировать
                var $modal = $(editor.element.$).parents('.modal:visible');
                if ($modal.length) {
                    x += $(window).scrollLeft() - $modal.scrollLeft();
                    y += $(window).scrollTop() - $modal.scrollTop();
                }

                // TODO: меню может вылезти за границы экрана, это нужно проверять
                oneShot(contextMenuSelector);

                //$(".cke_maximized").css("z-index", 11);
                $(contextMenuSelector)
                    .data("invokedOn", $(startElement.$))
                    .show()
                    .css({
                         "position": "absolute",
                         "left": x - 20,
                         "top": y + 20,
                         "z-index": 10012
                     })
                    .off('click')
                    .on('click', function (e) {
                        hideContextMenu(contextMenuSelector);
                        //var $invokedOn = $(this).data("invokedOn");
                        var $selectedMenu = $(e.target);
                        if ($selectedMenu.prop("id")) {
                            editor.execCommand($selectedMenu.prop("id"));
                        }
                    });

                hidden = false;

                var misspelledWord = startElement.getHtml();

                var onGetCorrectVariantsCallback = function(variants) {
                    $(contextMenuSelector).empty();
                    if (!variants.variants.length) {
                        $(contextMenuSelector).append('<li><a>Совпадений не найдено</a></li>');
                        return
                    }
                    $.each(variants.variants, function (n, word) {

                        editor.addCommand('change_selected_' + n, {
                            exec: function (editor) {
                                    var node, nodes;
                                    var finished = false;
                                    while (!finished) {
                                        finished = true;
                                        nodes = editor.getDoc().getElementsByTagName("span")
                                        var i = nodes.length;
                                        while (i--) {
                                            node = nodes[i];
                                            if (node.className == ('js-spell-error') && node.innerHTML == misspelledWord) {
                                                node.outerHTML = word;
                                            }
                                        }
                                    }
                            }
                        });
                        var li, a, t;
                        li = document.createElement("li");
                        a = document.createElement("a");
                        a.tabindex = -1;
                        a.id = "change_selected_" + n;
                        t = document.createTextNode(word);
                        li.appendChild(a);
                        a.appendChild(t);
                        document.getElementById(contextMenuId).appendChild(li);
                    });
                };

                $(editor.element.$).spellchecker(
                    'get_variants', misspelledWord, onGetCorrectVariantsCallback
                );
            });

        }
    }
});
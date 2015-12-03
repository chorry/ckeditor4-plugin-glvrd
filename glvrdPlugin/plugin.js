var glvrdPlugin_url = 'https://api.glvrd.ru/v1/glvrd.js';



function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ((sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}


var glvrdPlugin =
{
    editor: '',
    name: "glvrdPlugin",
    title: "glvrdPlugin",
    tooltip: "glvrdPlugin",
    toolbar: 'glvrdPlugin',
    icon: "glvrdPlugin",
    targetWnd: {
        "id": "glvrd_results",
        "name": "glvrd_name",
        "description": "glvrd_description"
    },
    tagStart: function (r) {
        return '<em class="glvrd-underline" data-rule="' + r + '">'
    },
    tagClose: '</em>',

    context_title: "glvrdPlugin",
    markupState: true, // 0 - next call will add markup, 1 - next call will remove it
    exec: function (editor) {
        this.editor = editor;
        this.ruleset = {};
        var data = editor.getSnapshot();
        editor.element.data("text", data);

        glvrd.getStatus(function (r) {
            if (r !== undefined && r.status == 'ok') {
                if (glvrdPlugin.markupState) {
                    glvrdPlugin.proofRead(data);
                } else {
                    glvrdPlugin.setText(glvrdPlugin.removeGlvrdMarkup(data));
                }
                glvrdPlugin.markupState = !glvrdPlugin.markupState;
            } else {
                var msg = '';
                if (r !== undefined && r.hasOwnProperty('status')) {
                    msg = '\nStatus is ' + r.status + ", msg: " + r.message + "(" + r.code +")";
                }
                alert('Sorry, glvr API is currently unavalable :( ' + msg);
                //TODO: alert sucks, gotta use something more pretty
            }
        });
    },

    addGlvrdMarkup: function (text, v, offset, ruleName) {
        var t = text.substring(0, v.start + offset)
            + glvrdPlugin.tagStart(ruleName) + text.substring(v.start + offset, v.end + offset)
            + glvrdPlugin.tagClose + text.substring(v.end + offset, text.length);
        return t;
    },

    removeGlvrdMarkup: function (data) {
        console.debug(data);
        var t=glvrdPlugin.stripRuleTags(data);
        console.debug(t);
        return t;
    },

    setText: function (text) {
        this.editor.loadSnapshot(text);
    },

    stripRuleTags: function (data) {
        data = data.replace(/(\<em)([ a-zA-Z\=\"\-0-9]+(\>))/g, "");
        data = data.replace(/(\<\/em\>)/g, "");
        return data;
    },

    proofRead: function (data) {
        window.glvrd.proofread(
            glvrdPlugin.stripRuleTags(data),
            function (result) {
                var offset = 0;
                $.each(result.fragments, function (k, v) {
                    var ruleName = 'r' + k;
                    data = glvrdPlugin.addGlvrdMarkup(data, v, offset, ruleName);
                    offset += glvrdPlugin.tagStart(ruleName).length + glvrdPlugin.tagClose.length;
                    glvrdPlugin.ruleset[ruleName] = v.hint;
                });
                glvrdPlugin.setText(data);
                glvrdPlugin.registerHover(glvrdPlugin.ruleset);
            });
    },

    registerHover: function (ruleset) {
        var ckTextFrameName = CKEDITOR.instances[Object.keys(CKEDITOR.instances)[0]].id + '_contents iframe';
        var target = $('#' + ckTextFrameName).contents();
        $.each(ruleset, function (k, v) {
            var emTarget = target.find('em').filter('[data-rule="' + k + '"]');
            emTarget.on('mouseenter', function (e) {
                $('#' + glvrdPlugin.targetWnd.name).html(ruleset[k].name);
                $('#' + glvrdPlugin.targetWnd.description).html(ruleset[k].description);
                $(this).addClass('glvrd-underline-active');
            }).on('mouseleave', function (e) {
                $(this).removeClass('glvrd-underline-active');
            });
            //glvrdPlugin.trackChanges(emTarget,v);
        });
    },

    trackChanges: function (target, ruleItem) {
        target.on('DOMSubtreeModified', function (e) {
        });
    },

    // todo: fire partial text update if no changes has been made to specified target within X seconds
    textTimeUpdate: function (time, position) {

    },
    inlineHints: function (target, data) {

    }
};


CKEDITOR.plugins.add('glvrdPlugin', {
    icons: 'glvrdPlugin',
    init: function (editor) {
        console.log('glvrd loaded');
        editor.addContentsCss(CKEDITOR.plugins.getPath('glvrdPlugin') + 'styles/glvrd.css');
        editor.addCommand('glvrdPlugin', {
            exec: function (editor) {
                glvrdPlugin.exec(editor);
            }
        });
        editor.ui.addButton(glvrdPlugin.name, {
            label: glvrdPlugin.title,
            command: glvrdPlugin.name,
            toolbar: glvrdPlugin.toolbar
        });

    }
});
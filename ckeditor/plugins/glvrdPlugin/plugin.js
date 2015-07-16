var glvrdPlugin_url = 'http://api.glvrd.ru/v1/glvrd.js';

$.getScript(glvrdPlugin_url, function () {
    console.log("Script loaded but not necessarily executed.");
});

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
        "name" : "glvrd_name",
        "description": "glvrd_description"
    },
    context_title: "glvrdPlugin",
    exec: function (editor) {
        this.editor = editor;
        this.ruleset = {};
        var data = editor.getSnapshot();
        editor.element.data("text", data);

        glvrd.getStatus(function(r) {
            if ( r!== undefined && r.status =='ok')
            {
                result = glvrdPlugin.proofRead(data);
            }
        });
    },
    setEditor: function(editor){
        this.editor = editor;
    },
    setText: function(text) {
        this.editor.loadSnapshot(text);
    },

    proofRead: function(data) {
        window.glvrd.proofread(data, function (result) {
            var offset = 0;
            $.each(result.fragments, function (k, v) {
                var ruleName = 'r' + k;
                var tagStart = '<em class="glvrd-underline" data-rule="' + ruleName + '">';
                var tagClose = '</em>';

                var offsetLen = tagStart.length + tagClose.length;

                data = data.substring(0,v.start+offset)
                    + tagStart + data.substring(v.start+offset, v.end+offset)
                    + tagClose + data.substring(v.end+offset, data.length);
                offset += offsetLen;
                glvrdPlugin.ruleset[ruleName] = v.hint;
            });
            glvrdPlugin.setText(data);
            glvrdPlugin.registerHover(glvrdPlugin.ruleset);
        });
    },

    registerHover: function(ruleset) {
        var ckTextFrameName = CKEDITOR.instances[Object.keys(CKEDITOR.instances)[0]].id + '_contents iframe';
        var target = $('#' + ckTextFrameName).contents();
        $.each(ruleset, function(k,v){
            target.find('em').filter('[data-rule="'+ k + '"]').on('mouseenter', function(e){
                $('#'+glvrdPlugin.targetWnd.name).html( ruleset[k].name );
                $('#'+glvrdPlugin.targetWnd.description).html( ruleset[k].description );
                $(this).addClass('glvrd-underline-active');
            }).on('mouseleave', function(e) {
                $(this).removeClass('glvrd-underline-active');
            });
            glvrdPlugin.trackChanges(target,v);
        });
    },
    trackChanges: function(target,item) {
        target.find('body').on('input', function(e){
            console.log('tracking text change..');
        });
    },
    inlineHints: function (target, data) {

    }
};


CKEDITOR.plugins.add('glvrdPlugin', {
    icons: 'glvrdPlugin',
    init: function (editor) {
        console.log('glvrd loaded');
        editor.addContentsCss( CKEDITOR.plugins.getPath( 'glvrdPlugin' ) + 'styles/glvrd.css' );
        editor.addCommand('glvrdPlugin', {
            exec: function (editor) {
                glvrdPlugin.exec(editor);
                //var now = new Date();
                //editor.insertHtml('The current date and time is: <em>' + now.toString() + '</em>');
            }
        });
        editor.ui.addButton(glvrdPlugin.name, {
            label: glvrdPlugin.title,
            command: glvrdPlugin.name,
            toolbar: glvrdPlugin.toolbar
        });

    }
});
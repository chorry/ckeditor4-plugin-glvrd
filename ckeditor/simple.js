/* global CKEDITOR: true */
$(document).ready(function () {
    CKEDITOR.initializers = CKEDITOR.initializers || {};
    CKEDITOR.initializers.simple = function(el) {
        var elId = $(el).attr('id');
        var editor = CKEDITOR.instances[elId];
        if (!editor) {
            var conf = {
                extraPlugins: 'onchange,custom_typograf,custom_spellchecker'
            };
            var height = $(el).data('height');
            if (height) {
                conf.height = height;
            }
            CKEDITOR.replace(elId, conf);
        }
    };
    $.each($('.ckeditor-simple'), function (index, el) {
        CKEDITOR.initializers.simple(el);
    });
});
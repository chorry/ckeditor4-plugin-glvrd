/* global CKEDITOR: true */
$(document).ready(function () {
    $.each($('.ckeditor'), function (index, el) {
        var elId = $(el).attr('id');
        var ckeditor = CKEDITOR.instances[elId];
        var extraPlugins = $(el).data('plugins') || 'onchange,custom,custom_images,custom_typograf,custom_spellchecker,custom_inlines';
        if (!ckeditor) {
            CKEDITOR.replace(elId, {extraPlugins: extraPlugins,
                                    minimumChangeMilliseconds: 100});
            ckeditor = CKEDITOR.instances[elId];
        }
    });
    // http://stackoverflow.com/questions/9741620/ckeditor-unwanted-nbsp-characters
    // https://jira.rbc.ru/browse/TASK-2529
    CKEDITOR.on('instanceReady', function (ev) {
        ev.editor.on('paste', function (ev) {
            ev.data.dataValue = ev.data.dataValue.replace(/&nbsp;/gi,' ');
        });
    });
});
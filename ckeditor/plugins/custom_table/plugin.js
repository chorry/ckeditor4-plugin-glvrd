

function createCustomElement(editor, name) {
    // создаем новый элемент в текущей позиции курсора
    var selection = editor.getSelection();
    var startElement = selection.getStartElement();
    var element;

    if (!startElement || startElement.getName() !== name) {
        element = editor.document.createElement(name);
        editor.insertElement(element);
    } else {
        element = startElement.getAscendant(name, true);
    }
    element.setAttribute('style', 'color: #8441a5;');
    return element;
}


var tablePlugins = [
    {
        name: "inline_table",
        title: "Таблица",
        tooltip: "Вставить таблицу",
        context_title: "Редактировать таблицу",
        icon: "inline_table",
        itemContainerClass: "single-table-container",
        exec: function (plugin, editor) {
            $(editor.document.$).find('inline_table').remove();
            var element = createCustomElement(editor, 'inline_table');
            element.appendHtml('Inline Table');
        }
    }
];


CKEDITOR.plugins.add('custom_table', {
    icons: 'inline_table',
    init: function(editor) {
        $.each(tablePlugins, function (index, plugin) {
            editor.addCommand('edit' + plugin.name, {
                exec: function (editor) { plugin.exec(plugin, editor); }
            });
            var toolbar = 'custom';
            if (plugin.toolbar) {
                toolbar = plugin.toolbar;
            }
            if (plugin.icon) {
                editor.ui.addButton(plugin.icon, {
                    label: plugin.tooltip,
                    command: 'edit' + plugin.name,
                    toolbar: toolbar
                });
            } else {
                editor.ui.add("button" + plugin.name, CKEDITOR.UI_BUTTON, {
                    label: plugin.title,
                    command: 'edit' + plugin.name,
                    toolbar: toolbar
                });
            }
        });
    }
});

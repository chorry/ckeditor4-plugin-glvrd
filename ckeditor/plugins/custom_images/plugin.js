var CkeditorModalTitleIdPrefix = "ckeditor-modal-title-";


function collectItemsFromPageExec(plugin, editor) {
    var $modal = $("#" + plugin.name + "-modal");
    $modal.on("hide.bs.modal", function () {
        $modal.find("." + plugin.name + "-ckeditor:not([data-position=''])").remove();
    });
    $.each($("." + plugin.itemContainerClass), function () {
        var tmpl = $("." + plugin.name + "-ckeditor").first();
        var clone = tmpl.clone();

        if ($(this).is(':visible')) {
            var index = $(this).data('index');
            clone.css("display", "");
            clone.attr("data-position", index);
            plugin.fillGeneratedItem(clone, this);
            clone.appendTo(tmpl.parent());
        }
    });
    $("." + plugin.name + "-ckeditor").hover(
        function () { $(this).addClass("ckeditor-focus"); },
        function () { $(this).removeClass("ckeditor-focus"); }
    );
    $("." + plugin.name + "-ckeditor").on("click", function () {
        var selection = editor.getSelection();
        var startElement = selection.getStartElement();
        var element;
        if (!startElement || startElement.getName() !== plugin.name) {
            element = editor.document.createElement(plugin.name);
            editor.insertElement(element);
        } else {
            element = startElement.getAscendant(plugin.name, true);
        }
        element.setAttribute('style', 'color: #8441a5;');
        element.setAttribute('n', $(this).data("position"));
        element.setHtml($.trim($(this).html()));
        $modal.modal("hide");
        $(".cke_maximized").css("z-index", 9995);
        $modal.find("." + plugin.name + "-ckeditor:not([data-position=''])").remove();
        $("." + plugin.name + "-ckeditor").off("click");
    });
    $("#" + CkeditorModalTitleIdPrefix + plugin.name).text(plugin.title);
    $(".cke_maximized").css("z-index", 11);
    $modal.modal("show");
}


var imagePlugins = [
    {
        name: "picture",
        title: "Изображение",
        tooltip: "Добавить изображение",
        context_title: "Редактировать изображение",
        icon: "image",
        itemContainerClass: "single-image-container",
        fillGeneratedItem: function (img, item) {
            img.find("img").attr("src", $(item).find("img").attr("src"));
        },
        exec: collectItemsFromPageExec
    },
    {
        name: "inline_picture",
        title: "Изображение c обтеканием",
        tooltip: "Добавить изображение c обтеканием",
        context_title: "Редактировать изображение c обтеканием",
        icon: "inline_picture",
        itemContainerClass: "single-image-container",
        fillGeneratedItem: function (img, item) {
            img.find("img").attr("src", $(item).find("img").attr("src"));
        },
        exec: collectItemsFromPageExec
    },
];


CKEDITOR.plugins.add('custom_images', {
    icons: 'image,inline_picture',
    init: function(editor) {
        $.each(imagePlugins, function (index, plugin) {
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

var CkeditorSelectIdPrefix = "ckeditor-select-";
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


function Select2CkeditorExec(plugin, editor) {
    var $modal = $("#" + plugin.name + "-modal");
    var $select = $("#" + CkeditorSelectIdPrefix + plugin.name);
    var selection = editor.getSelection();
    var startElement = selection.getStartElement();
    var element;
    $select.select2({
        formatResult: select2FormatResult,
        multiple: false,
        allowClear: false,
        width: 'off',
        placeholder: plugin.title,
        ajax: {
            type: 'POST',
            url: $select.attr("autocomplete_url"),
            dataType: 'json',
            data: function (term, page) { return {"term": term}; },
            results: function (data) { return {results: data}; }
        }
    });
    if (!startElement || startElement.getName() !== plugin.name) {
        element = editor.document.createElement(plugin.name);
        editor.insertElement(element);
    } else {
        element = startElement.getAscendant(plugin.name, true);
        $select.select2("data", {id: element.getAttribute("id"), text: element.getText()});
    }
    $select.on("select2-selecting", function (event) {
        element.setAttribute('style', 'color: #8441a5;');
        element.setAttribute('id', event.object.id);
        element.setHtml(event.object.text);
        $modal.modal("hide");
        $(".cke_maximized").css("z-index", 9995);
        $select.off();
    });
    $("#" + CkeditorModalTitleIdPrefix + plugin.name).text(plugin.title);
    $(".cke_maximized").css("z-index", 11);
    $modal.modal("show");
}

function socialEmbedGetPreviewRemote(btn, editor, element, plugin, $modal) {
    var url = $modal.find("." + plugin.name + "-input").val();
    $.get($(btn).data("url"), {url: url}, function (data) {
        if(!data.html) {
            $("#" + plugin.name + "-modal").modal("hide");
            // bootbox.alert(data.errors[0]);
            return;
        }
        //url = url.replace('http://', '').replace('https://', '');
        $modal.find("." + plugin.name + "-preview-container").html(data.html);
        $modal.find("." + plugin.name + "-body-container").css("display", "none");
        $modal.find("." + plugin.name + "-buttons-container").css("display", "block");
        element.setHtml(plugin.name + ": " + url);//data);
        element.setAttribute('style', 'color: #8441a5;');
        element.setAttribute('data-url', url);
    });
}


function socialEmbedExec(plugin, editor) {
    var $modal = $("#" + plugin.name + "-modal");

    var selection = editor.getSelection();
    var startElement = selection.getStartElement();
    var element;

    if (!startElement || startElement.getName() !== plugin.name) {
        element = editor.document.createElement(plugin.name);
        editor.insertElement(element);
    } else {
        element = startElement.getAscendant(plugin.name, true);
    }
    $modal.on("hide.bs.modal", function () {
        $modal.find("." + plugin.name + "-input").val("").html("");
    });
    $("#" + plugin.name + "-save").off("click");
    $("." + plugin.name + "-search-url").off("click");
    $modal.off("hidden.bs.modal");

    $("." + plugin.name + "-search-url").on("click", function() {
        plugin.socialEmbedGetPreview(this, editor, element, plugin, $modal);
        $(".cke_maximized").css("z-index", 11);
    });
    $("." + plugin.name + "-save").on("click", function () {
        $modal.find("." + plugin.name + "-body-container").data("save", "true");
        $modal.modal("hide");
    });
    $modal.on("hidden.bs.modal", function () {
        if (!$modal.find("." + plugin.name + "-body-container").data("save")) {
            element.remove(false);
        }
        $modal.find("." + plugin.name + "-body-container").removeData("save")
        $modal.find("." + plugin.name + "-preview-container").html("");
        $modal.find("." + plugin.name + "-body-container").css("display", "block");
        $modal.find("." + plugin.name + "-input").val("");
        $modal.find("." + plugin.name + "-buttons-container").css("display", "none");
        $modal.find("." + plugin.name + "-body-container").removeAttr("data-save");
    });

    $("#" + CkeditorModalTitleIdPrefix + plugin.name).text(plugin.context_title);
    $(".cke_maximized").css("z-index", 11);
    $modal.modal("show");
}

function isParseError(parsedDocument) {
    // parser and parsererrorNS could be cached on startup for efficiency
    var parser = new DOMParser(),
        errorneousParse = parser.parseFromString('<', 'text/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

    if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
        return parsedDocument.getElementsByTagName("parsererror").length > 0;
    }

    return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
};

function parseVKId(input) {
//CodeExample: <div id="vk_post_-30022666_131432"></div><script type="text/javascript"> (function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = "//vk.com/js/api/openapi.js?116"; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'vk_openapi_js')); (function() { if (!window.VK || !VK.Widgets || !VK.Widgets.Post || !VK.Widgets.Post("vk_post_-30022666_131432", -30022666, 131432, 'XkjGu9zk6qaZv01UKTLJIxg', {width: 500})) setTimeout(arguments.callee, 50); }());</script>
    var parser = new DOMParser();
    var xml = "<body>"+input+"</body>";
    try {
        var doc = parser.parseFromString(xml, "text/xml");
        if (isParseError(doc)) {
            return '';
        }
        var divs = doc.getElementsByTagName("div");
        if (0 == divs.length) {
            return '';
        }
        var id = divs[0].getAttribute('id', '');
        if (id) {
            return id;
        }
    } catch (e) {
        console.log(e.name);
        return '';
    }
    return '';
}

function checkVKDuplication(post_id, editor) {
//CodeExample <p><vk data-text="&lt;div id=&quot;vk_post_-30022666_131432&quot;&gt;&lt;/div&gt;&lt;script type=&quot;text/javascript&quot;&gt;  (function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = &quot;//vk.com/js/api/openapi.js?116&quot;; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'vk_openapi_js'));  (function() {    if (!window.VK || !VK.Widgets || !VK.Widgets.Post || !VK.Widgets.Post(&quot;vk_post_-30022666_131432&quot;, -30022666, 131432, 'XkjGu9zk6qaZv01UKTLJIxg', {width: 500})) setTimeout(arguments.callee, 50);  }());&lt;/script&gt;" style="color: #8441a5;">vk</vk></p>
    var body = editor.document.$; // getParentWithTagName(selectednode, "BODY"); // ckDocument.$;
    try {
        var vks = body.getElementsByTagName("VK");
        for (var i = 0, l = vks.length; i < l; i++) {
            var attr = vks[i].getAttribute("DATA-TEXT", '');
            if (attr && '' != attr) {
                if ('' != post_id && post_id == parseVKId(attr)) {
                    return false;
                }
            }
        }
    } catch(e) {
        console.log(e.name);
        return true;
    }
    return true;
}

var baseCustomPlugins = [
    {
        name: "person",
        title: "Карточка персоны",
        tooltip: "Добавить карточку персоны",
        context_title: "Редактировать карточку",
        icon: "user",
        exec: Select2CkeditorExec
    },
    {
        name: "company",
        title: "Карточка компании",
        tooltip: "Добавить карточку компании",
        context_title: "Редактировать карточку",
        icon: "company",
        exec: Select2CkeditorExec
    },
    {
        name: "photoreport",
        title: "Фоторепортаж",
        tooltip: "Добавить фоторепортаж",
        context_title: "Редактировать Фоторепортаж",
        icon: "photoreport",
        exec: Select2CkeditorExec
    },
    {
        name: "inline_video",
        title: "Видео",
        tooltip: "Добавить видео",
        context_title: "Редактировать видео",
        icon: "inline_video",
        itemContainerClass: "js-video_container",
        fillGeneratedItem: function (video, item) {
            video.html($(item).find(".video_title").html());
        },
        exec: collectItemsFromPageExec
    },
    {
        name: "container",
        title: "Контейнер",
        tooltip: "Добавить контейнер",
        icon: 'container_add',
        context_title: "Редактирование контейнера",
        exec: function (plugin, editor) {
            var $modal = $("#" + plugin.name + "-modal");
            var selection = editor.getSelection();
            var startElement = selection.getStartElement();
            var element;
            if (!startElement || startElement.getName() !== plugin.name) {
                element = editor.document.createElement(plugin.name);
                editor.insertElement(element);

            } else {
                element = startElement.getAscendant(plugin.name, true);
                $modal.find("." + plugin.name + "-ckeditor").val(element.getText());
            }
            $modal.on("hide.bs.modal", function () {
                $modal.find("." + plugin.name + "-ckeditor").val("").html("");
            });
            $("#" + plugin.name + "-ckeditor-save").off("click");
            $("#" + plugin.name + "-ckeditor-save").on("click", function() {

                element.setAttribute('style', 'color: #8441a5;');
                element.setHtml($modal.find("." + plugin.name + "-ckeditor").val());

                // нам необходимо вставить новый элемент сразу после потомка контейнера body
                var body = startElement,
                    root = null;

                while ((body !== null) && body.getName() !== 'body') {
                    root = body;
                    body = body.getParent();
                }

                if (root !== null) {
                    // непустой контейнер
                    element.insertAfter(root);
                }

                // если мы вставляли в пустой элемент - удалим его
                if (startElement.getText().trim() === '') {
                    startElement.remove();
                }

                $modal.modal("hide");
                $(".cke_maximized").css("z-index", 9995);
                $modal.find("." + plugin.name + "-ckeditor").val("").html("");
            });
            $("#" + CkeditorModalTitleIdPrefix + plugin.name).text(plugin.context_title);
            $(".cke_maximized").css("z-index", 11);
            $modal.modal("show");
        }
    },/*,
    {
        name: "insert-inline",
        title: "Врез",
        tooltip: "Вставить врез",
        icon: "insert_section",
        context_title: "Вставить врез",
        exec: function (plugin, editor) {
            var $modal = $('#modal-' + plugin.name);
            var $inserts = $('.' + plugin.name).filter(function() {
                return ($(this).find('.inserts-deleted-field').val() === 'false' &&
                        $(this).find('.inserts-index-field').val() !== '')
                }
            );

            if (!$inserts.length) {
                GlobalNotifications.info('Сначала добавьте врез');
                return;
            }

            $modal.find('.modal-body').empty();

            $inserts.each(function () {
                var $insert = $(this),
                    title = $insert.find('input.inserts-title-field').val(),
                    index = $insert.find('input.inserts-index-field').val(),
                    $button = $(
                        '<button type="button" class="btn btn-default btn-lg btn-block">'
                        + title +
                        '</button>'
                    );

                $button.on('click', function () {
                    var element = createCustomElement(editor, 'inline_insert');
                    element.setAttribute('n', index);
                    element.setText(title);
                    $modal.modal('hide');
                });

                $button.appendTo($modal.find('.modal-body'))
            });

            $modal.modal('show');
        }
    }*/
    {
        name: "twitter",
        title: "Twitter",
        tooltip: "Добавить публикацию из Twitter",
        context_title: "Twitter",
        icon: "twitter",
        exec: socialEmbedExec,
        socialEmbedGetPreview: socialEmbedGetPreviewRemote
    },
    {
        name: "facebook",
        tooltip: "Добавить публикацию из Facebook",
        title: "Facebook",
        context_title: "Facebook",
        icon: "facebook",
        exec: socialEmbedExec,
        socialEmbedGetPreview: socialEmbedGetPreviewRemote
    },
    {
        name: "vk",
        tooltip: "Добавить публикацию из Вконтакте",
        title: "VK",
        context_title: "VK",
        icon: "vk",
        exec: socialEmbedExec,
        socialEmbedGetPreview: function (btn, editor, element, plugin, $modal) {
            var data = $modal.find("." + plugin.name + "-input").val();
            var id = parseVKId(data);
            if ('' == id) {
               bootbox.alert("Запись из VKontakte не распознана редактором! Код должен быть вставлен целиком.");
               return;
            }
            if (!checkVKDuplication(id, editor)) {
               bootbox.alert("В тексте уже существует такая запись из VKontakte! Повторное добавление приведет к ошибкам.");
               return;
            }
            $modal.find("." + plugin.name + "-preview-container").html(data);
            $modal.find("." + plugin.name + "-body-container").css("display", "none");
            $modal.find("." + plugin.name + "-buttons-container").css("display", "block");
            element.setHtml(plugin.name );
            element.setAttribute('data-text', data);
            element.setAttribute('style', 'color: #8441a5;');
        }
    }

];


CKEDITOR.plugins.add('custom', {
    icons: 'user,company,photoreport,inline_video,twitter,facebook,vk,ajax_save,container_add',
    init: function(editor) {
        $.each(baseCustomPlugins, function (index, plugin) {
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
        editor.addCommand("ajax_save", {
            exec: function (editor) {
                var url = $("#ckeditor-body-save").data("url");
                if (!url) {
                    alert("Необходимо сохранить материал!");
                    return
                }
                var viewPerm = $(".permission_required__article_form").data("permission");

                $(editor.element.$).spellchecker('stop');

                $.post(url, {body: editor.getData(), view_permissions: viewPerm}).done(function(data) {
                    if (!data.result) {
                        GlobalNotifications.error("Не удалось сохранить!");
                    }
                    $(editor.element.$).spellchecker('start');

                    if (data.changed) {
                        // заменить кнопки "удалить" на "восстановить"
                        $.each($(".status-buttons").find("[value$='2'][name$='status']"), function () {
                            $(this).removeClass("btn-danger");
                            $(this).addClass("btn-default");
                            $(this).val("revert");
                            $(this).text("Отменить изменения");
                            $(this).removeAttr("disabled");
                        });
                        // заменить клонировать на предпросмотр
                        $.each($(".btn-clone"), function () {
                            $(this).removeClass("btn-clone");
                            $(this).addClass("btn-preview");
                            $(this).attr("target", "_blank");
                            $(this).attr("href", "#");
                            $(this).html("Предпросмотр");
                        });
                        // текущий статус меняется на изменен
                        $("#text-status-button").removeClass("btn-success");
                        $("#text-status-button").addClass("btn-warning");
                        $("#text-status-button").text("Изменен");
                    }
                });
                $(".cke_maximized").css("z-index", 11);
            }
        });
        editor.ui.addButton("ajax_save", {
            label: "Сохранить",
            command: "ajax_save",
            toolbar: 'custom'
        });

    }
});

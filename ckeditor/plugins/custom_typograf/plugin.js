var TypoGraf;


function runTypografTests() {
    // выполните эту функцию в консоли чтобы прогнать тесты
    // \u00A0 (&nbsp;) - неразрывный пробел

    var before = [
        'Из за леса <p>Из за гор</p> показал мужик топор <p>из под скамейки</p>',
        '<p>Кое-кто у нас порой честно жить не хочет. Верно-таки говорят.</p>',
        'Ссылка http://rbc.ru работает',
        'Война в 1941-1945 г.г.',
        '<p>вроде лето но как же холодно а хотелось бы жару</p>',
        '<p>Абзац 1</p><p></p><p>Абзац 2</p><p></p><p></p>',
        '250 +- 5 вольт -> слово.... <- дело.. && @@ a+-',
        'дефис -дефис => дефис- дефис',
        '<p>&quot;Рога и копыта&quot;</p>, копыта "и" рога <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>',
        'двойная пунктуация--дада ―― ――',
        'из- за из -за из за из- под из -под из под верно- таки верно -таки верно таки',
        '- Прямая речь?',
        ' - Да, прямая речь!',
        'Я но не ты. Ты а не я. I но не ты. You а не я. (Я) но не ты. [Ты] а не я. {Я} но не ты. "Ты" а не я. «Я» но не ты. “Ты” а не я. Я но не ты. „Ты“ а не я.',
        'Представляете, вы сидите в тюрьме - а потом выходите на поселение',
        '<p>http://google.com/</p><p>следующий абзац</p>'
    ];

    var after = [
        'Из-за леса <p>Из-за гор</p> показал мужик топор <p>из-под скамейки</p>',
        '<p>Кое-кто у\u00A0нас порой честно жить не\u00A0хочет. Верно-таки говорят.</p>',
        'Ссылка <a href="http://rbc.ru">rbc.ru</a> работает',
        'Война в\u00A01941-1945\u00A0гг.',
        '<p>вроде лето, но\u00A0как\u00A0же холодно, а\u00A0хотелось\u00A0бы жару</p>',
        '<p>Абзац 1</p><p>Абзац 2</p>',
        '250 ± 5\u00A0вольт → слово... ← дело. & @ a+-',
        'дефис-дефис => дефис— дефис',
        '<p>«Рога и\u00A0копыта»</p>, копыта «и» рога',
        'двойная пунктуация-дада ― ―',
        'из-за из-за из-за из-под из-под из-под верно-таки верно-таки верно-таки',
        '— Прямая речь?',
        '— Да, прямая речь!',
        'Я, но не ты. Ты, а не я. I, но не ты. You, а не я. (Я),  но не ты. [Ты], а не я. {Я}, но не ты. «Ты», а не я. «Я», но не ты. «Ты», а не я. Я, но не ты. «Ты», а не я.',
        'Представляете, вы сидите в тюрьме — а потом выходите на поселение',
        '<p><a href="http://google.com/">google.com</a></p><p>следующий абзац</p>'
    ];

    function repr(text) {
        return $('<div/>').append(text).html()
    }

    var failed = 0,
        passed = 0;

    for (var i = 0, l = before.length; i < l; i++) {
        var before_string = applyTypografToText(before[i]),
            after_string = after[i];

        if (before_string === after_string) {
            passed++;
        } else {
            failed++;
            console.log('"' + repr(before_string) + '" !== "' + repr(after_string) + '"');
        }
    }
    console.log('Tests done: failed=' + failed + ' passed=' + passed);
}


function addTypografCustomRules() {
    var before = '(^| |\\n|>)'
        , after = '( |,|\\.|\\?|\\:|\\!|<|$)'
        ;


    Typograf.rule({
        title: 'ё -> е',
        name: 'ru/other/yo',
        sortIndex: 2000,
        func: function (_text) {
            return _text.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
        }
    });

    // Дорабатываем правило обработки дефисов:
    // дефис -дефис => дефис-дефис
    // дефис- дефис => тире— тире
    Typograf.rule({
        title: 'Дефис на тире 2',
        name: 'ru/dash/main2',
        sortIndex: 621,
        func: function(text) {
            var dashes = '(-|--|–|—)',
                // дефис -дефис => дефис-дефис
                re1 = new RegExp('([a-zA-Zа-яА-ЯёЁ])( |\u00A0)' + dashes + '([a-zA-Zа-яА-ЯёЁ])', 'g'),
                // дефис- дефис => тире— тире
                re2 = new RegExp('([a-zA-Zа-яА-ЯёЁ])' + dashes + '( |\u00A0)([a-zA-Zа-яА-ЯёЁ])', 'g'),
                // - Дефис? => — Тире!
                re3 = new RegExp('(^|\>\u200B?)' + dashes + '( |\u00A0)([a-zA-Zа-яА-ЯёЁ])', 'g');

            return text
                .replace(re1, '$1$3$4')
                .replace(re2, '$1' + this.setting('ru/dash/main2', 'dash') + '$3$4')
                .replace(re3, '$1' + this.setting('ru/dash/main2', 'dash') + '$3$4');
        },
        settings: {
            dash: '\u2014' // &mdash;
        }
    });

    // удаляем пустые абзацы <p></p>
    Typograf.rule({
        title: 'Удаляем пустые абзацы <p></p>',
        name: 'common/html/removep',
        sortIndex: 4,
        func: function(text) {
            var re = new RegExp('<p>(?:<br>)?</p>', 'g');
            return text.replace(re, '')
        }
    });

    // заменяем на ± в выражениях вида " +- "
    Typograf.rule({
        title: '_+-_ → ±',
        name: 'common/sym/plusMinusWithSpaces',
        sortIndex: 1011,
        func: function(text) {
            var re = new RegExp('(^| |\\>|\u00A0)\\+-($| |\u00A0)', 'g');
            return text.replace(re, '$1±$2')
        }
    });

    // удаление двойной пунктуации для большего количества символов
    Typograf.rule({
        title: 'Удаление двойной пунктуации 2',
        name: 'common/delDoublePunctiation2',
        sortIndex: 5000,
        func: function(text) {
            return text.replace(/("|’|'|‒|…|\‐|\„|\”|\‘|\’|\‹|\›|\·|\&|\@|\•|\°|\~|¦|\||-|―){2,}/g, '$1');
        }
    });

    Typograf.rule({
        title: 'Удаление лишних точек',
        name: 'common/delDoublePunctiation3',
        sortIndex: 5000,
        func: function(text) {
            return text.replace(/(\.){3,}/g, '...').replace(/([^\.\s]|^)\.\.(?!\.)/g, '$1.');
        }
    });

    Typograf.rule({
        title: 'Дефис между из-за',
        name: 'ru/dash/izza_custom',
        sortIndex: 33,
        func: function(text) {
            var re = new RegExp(before + '(И|и)з-? -?за' + after, 'g');
            return text.replace(re, '$1$2з-за$3');
        }
    });

    Typograf.rule({
        title: 'Дефис между из-под',
        name: 'ru/dash/izpod_custom',
        sortIndex: 35,
        func: function(text) {
            var re = new RegExp(before + '(И|и)з-? -?под' + after, 'g');
            return text.replace(re, '$1$2з-под$3');
        }
    });

    Typograf.rule({
        title: 'Дефис между верно-таки и т.д.',
        name: 'ru/dash/taki_custom',
        sortIndex: 39,
        func: function(text) {
            var re = new RegExp('(верно|довольно|опять|прямо|так|всё|действительно|неужели)-?\\s-?(таки)' + after, 'gi');
            return text.replace(re, '$1-$2$3');
        }
    });

    Typograf.rule({
        title: 'Расстановка запятых и неразрывного пробела перед а и но',
        name: 'ru/nbsp/but2',
        sortIndex: 1110,
        func: function(text) {
            // после скобки почему-то добавляется дополнительный пробел, если это исправить, то можно упростить и этот паттерн:
            var re = new RegExp('([а-яА-ЯёЁa-zA-Z\\)\\]\\}»])([,])?( |\u00A0|\n|>)( |\u00A0|\n|>)?(а|но)( |\u00A0|\n)', 'g');
            return text.replace(re, '$1,$3$4$5$6');
        }
    });

    Typograf.rule({
        title: 'Удаление пробела, после последнего знака препинания в кавычках',
        name: 'ru/quot/removespace',
        sortIndex: 5555,
        func: function (text) {
            return text.replace(/\s»/g,"»");
        }
    });

    Typograf.rule({
        title: 'Расстановка ссылок',
        name: 'common/html/url_fixed',
        sortIndex: 2000, // правило должно идти самым последним
        func: function(text) {
            var prefix = '(http|https|ftp|telnet|news|gopher|file|wais)://',
                pureUrl = '([a-zA-Z0-9\/\\n+\\-=%&:_.~?]+[a-zA-Z0-9#+]*)',
                re = new RegExp(prefix + pureUrl, 'g');

            return text.replace(re, function($0, $1, $2) {
                var url = $2,
                    fullUrl = $1 + '://' + $2,
                    firstPart = '<a href="' + fullUrl + '">';

                if($1 === 'http') {
                    url = url
                        .replace(/^www\./, '')
                        .replace(/^([^\/]+)\/$/, '$1');

                    return firstPart + url + '</a>';
                }

                return firstPart + fullUrl + '</a>';
            });
        }
    });

}


$(function setupGlobalTypograf() {
    // добавляем свои собственные правила
    addTypografCustomRules();

    TypoGraf = new Typograf({lang: 'ru'});

    TypoGraf.disable('ru/dash/izza');
    TypoGraf.disable('ru/dash/izpod');
    TypoGraf.disable('ru/dash/taki');

    TypoGraf.disable('ru/dash/to');
    TypoGraf.disable('ru/dash/koe');
    TypoGraf.disable('common/sym/hellip');
    TypoGraf.disable('ru/money/dollar');
    TypoGraf.disable('ru/money/euro');
    TypoGraf.disable('common/sym/times');
    TypoGraf.disable('common/sym/fraction');
    TypoGraf.disable('ru/nbsp/m');
    TypoGraf.disable('ru/nbsp/but');
    TypoGraf.disable('common/html/url');

    // Измененное правило для кавычек:
    // текст "кавычки "внутри" кавычек" текст => текст «кавычки «внутри» кавычек»
    // текст "кавычки "внутри"" текст => текст «кавычки «внутри»
    TypoGraf.setting('ru/quot', 'lquot2', '«');
    TypoGraf.setting('ru/quot', 'rquot2', '»');

});


function CustomTextProcessor() {
    this.hideSafeTags = function(text) {
        this._hiddenSafeTags = {};

        var that = this,
            re = '',
            tags = [
            'twitter',
            'facebook',
            'vk',
            'picture',
            'photoreport',
            'person',
            'company',
            'container',
            'inline_video',
            'inline_table'
        ];

        tags.forEach(function(tag) {
            re += '(<' + tag + '[^>]*>(.|\\n)*?<\\/' + tag + '>)|';
        }, this);

        var i = 0;
        text = text.replace(new RegExp('(' + re + '<[^-][^>]*[\\s][^>]*>)', 'gim'), function(match) {
            var key = '__custom_typograf' + i + '__';
            that._hiddenSafeTags[key] = match;
            i++;

            return key;
        });

        return text;
    };

    this.showSafeTags = function(text) {
        Object.keys(this._hiddenSafeTags).forEach(function(key) {
            text = text.replace(new RegExp(key, 'gim'), this._hiddenSafeTags[key]);
        }, this);

        delete this._hiddenSafeTags;

        return text;
    };
}


function applyTypografToText(text) {

    var textProc = new CustomTextProcessor();
    text = textProc.hideSafeTags(text);
    // unescape HTML entities
    // TODO: оформить как правило
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'");

    text = TypoGraf.execute(text);
    text = textProc.showSafeTags(text);
    return text;
}

var typografPlugins = [
    {
        name: "typograf",
        title: "Типограф",
        tooltip: "Типографирование",
        icon: "typograf",
        context_title: "Типографирование",
        exec: function (plugin, editor) {
            var data = editor.getSnapshot();
            editor.element.data("text", data);
            var tpText = applyTypografToText(data);
            editor.loadSnapshot(tpText);
            editor.element.data("tp_text", editor.getSnapshot());
        }
    },
    {
        name: "typograf_revert",
        title: "Отменить типографирование",
        tooltip: "Отменить типографирование",
        icon: "typograf_revert",
        context_title: "Отменить типографирование",
        exec: function (plugin, editor) {
            var savedText = editor.element.data("text");
            if (savedText) {
//                if (editor.element.data("tp_text") != editor.getSnapshot() && !confirm("Изменения после типографирования будут утеряны. Продолжить?")) {
//                    return false;
//                }
                editor.loadSnapshot(editor.element.data("text"));
                editor.element.data("text", "");
                editor.element.data("changed", "");
            }
        }
    },
    /*{
        name: "typograf_settings",
        title: "Настройки типографирования",
        tooltip: "Настройки типографирования",
        icon: "typograf_settings",
        toolbar: "typograf",
        context_title: "Настройки типографирования",
        exec: function (plugin, editor) {

        }
    },*/
];


CKEDITOR.plugins.add('custom_typograf', {
    icons: 'typograf,typograf_revert,typograf_settings',
    init: function(editor) {
        $.each(typografPlugins, function (index, plugin) {
            editor.addCommand('edit' + plugin.name, {
                exec: function (editor) { plugin.exec(plugin, editor); }
            });
            var toolbar = 'typograf';
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
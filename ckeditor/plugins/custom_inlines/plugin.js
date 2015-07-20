
CKEDITOR.plugins.add('custom_inlines', {
    init: function(editor) {

      // https://jira.rbc.ru/browse/TASK-2961
      // список наших элементов с придуманными именами, необходимо обучить CKEditor как с ними
      // работать, возьмем несколько свойств отсюда: http://docs.ckeditor.com/#!/api/CKEDITOR.dtd
      // (element_tag, is_inline?)
      var customElements = [
          ['inline_insert', true],
          ['picture', true],
          ['inline_picture', true],
          ['container', false], // контейнер у нас блочный элемент
          ['company', true],
          ['person', true],
          ['inline_video', true],
          ['photoreport', true]
      ];

      function getBody(node) {
          if (node && node.tagName && node.tagName != "BODY" && node.parentNode) {
              return getBody(node.parentNode);
          }
          return node;
      }

      // Идея взята из http://stackoverflow.com/a/2474742/4574981
      function serializeHTML(node, notdeep) {
          if(!node || !node.tagName) return '';
          var txt, ax, el= document.createElement("div");
          el.appendChild(node.cloneNode(false));
          txt = el.innerHTML;
          if(!notdeep) {
              ax= txt.indexOf('>')+1;
              txt= txt.substring(0, ax)+node.innerHTML+ txt.substring(ax);
          }
          el= null;
          return txt;
      }


      // https://jira.rbc.ru/browse/TASK-3444
      // иногда требуются правки работы CKEditor в реальном времени
      // каждый наш элемент имеет соответствие тегу, который он обязан содержать (и только его)
      // Документация по onchange плагину: http://alfonsoml.blogspot.com.br/2011/03/onchange-event-for-ckeditor.html
      // Документация по js навигации по DOM документу http://web.izjum.com/javascript-dom-navigation
      function fixCustomTag(deep, what) {
          // Идея взята из http://dev.ckeditor.com/ticket/9998#comment:27
          var node = what;
          if (!what) {
              var selectednode=editor.getSelection().getRanges()[0].endContainer.$;
              if (selectednode && selectednode.parentNode) {
                  node = selectednode.parentNode;
                  if (node.tagName == "P" || node.tagName == "BODY") {
                     node = selectednode;
                  }
              }
          }
          var inlineTagNames = ["PICTURE", "INLINE_PICTURE"];
          for (var j=0; j<inlineTagNames.length; j++) {
              var intlineTagName = inlineTagNames[j];
              if (node && node.tagName == intlineTagName) {
                  var body = getBody(node); // ckDocument.$;
                  var xtags = body.getElementsByTagName(intlineTagName);
                  var itags = node.getElementsByTagName("IMG");
                  var dtags = node.getElementsByTagName(intlineTagName);

                  // Используем глубокий анализ на случай разрыва тега клавишей ENTER
                  // Анализируем один элемент слева и один элемент справа
                  if (xtags && deep) {
                      for (var i = 0, l = xtags.length; i < l; i++) {
                          if (xtags[i] == node) {
                             fixCustomTag(false, xtags[i]);
                             if (i >= 1) {
                                 fixCustomTag(false, xtags[i-1]);
                             }
                             if (i + 1 < l) {
                                 fixCustomTag(false, xtags[i+1]);
                             }
                          }
                      }
                      return;
                  }
                  // Идея взята из http://stackoverflow.com/questions/18716323/get-selected-html-in-ckeditor#comment27609748_18723133
                  var bookmarks = editor.getSelection().createBookmarks();

                  // Action #0: delete tag <PICTURE>, if there is no tag <IMG> inside
                  // Problem: append "TEXT" before tag <PICTURE> and press ENTER
                  // Whats wrong: "TEXT" will also have tag <PICTURE> => problems on frontend
                  if (0 == itags.length) {
                      // Идея взята из http://stackoverflow.com/a/170230/4574981
                      var uppernode = node.parentNode;
                      while (node.firstChild) {
                          uppernode.insertBefore(node.firstChild, node);
                      }
                      uppernode.removeChild(node);
                  }

                  // Action #1: remove internal <PICTURE> tag dublicate
                  // Problem: insert <PICTURE> tag and then try to change the picture
                  // Whats wrong: there are 2 tags <PICTURE> one inside other one => problems
                  if (0 != dtags.length) {
                      for (var d = 0, m = dtags.length; d < m; d++) {
                          if (dtags[d] != node) {
                              // Идея взята из http://stackoverflow.com/a/170230/4574981
                              var uppernode = dtags[d].parentNode;
                              while (dtags[d].firstChild) {
                                  uppernode.insertBefore(dtags[d].firstChild, dtags[d]);
                              }
                              uppernode.removeChild(dtags[d]);
                          }
                      }
                  }

                  // Action #2: move all before/after tag <IMG> out of tag <PICTURE>
                  // Problem: append "TEXT" before tag <PICTURE> and press ENTER
                  // Whats wrong: "TEXT" will also have tag <PICTURE> => problems on frontend
                  if (1 == itags.length) {
                      // Идея взята из http://stackoverflow.com/a/170230/4574981
                      var uppernode = node.parentNode;
                      var newnode = node.cloneNode(false);
                      var newchild = itags[0].cloneNode(true);
                      newnode.appendChild(newchild);

                      var found = false;
                      var closed = false;
                      while (node.firstChild) {
                          if (node.firstChild == itags[0]) {
                              found = true;
                              uppernode.insertBefore(newnode, node);
                              node.removeChild(node.firstChild);
                          } else {
                              if (1 == node.firstChild.nodeType) {
                                  closed = true;
                              }
                              if (!found) {
                                  uppernode.insertBefore(node.firstChild, node);
                              } else
                              if (closed) {
                                  // Документация http://learn.javascript.ru/modifying-document
                                  // Вместо nextSibling может быть null, тогда insertBefore работает как appendChild.
                                  uppernode.insertBefore(node.firstChild, node.nextSibling);
                              } else {
                                  node.removeChild(node.firstChild);
                              }
                          }
                      }
                      uppernode.removeChild(node);
                  }

                  // RESTORE SELECTION
                  editor.getSelection().selectBookmarks( bookmarks );
              }
          }
      }
      var timer;
      function somethingChanged() {

          // Avoid firing the event too often
          if (timer)
              return;
          timer = setTimeout( function() {
              timer = 0;
              editor.fire( 'change' );
              fixCustomTag(true);
          }, editor.config.minimumChangeMilliseconds || 100);
      }

      editor.on( 'change', function(e) {
          if (!editor || !editor.document) {
              return;
          }

          editor.document.on( 'keyup', function( event )
          {
              // Do not capture CTRL hotkeys.
              if ( !event.data.$.ctrlKey && !event.data.$.metaKey )
                  somethingChanged();
          });

          // Firefox OK
          editor.document.on( 'drag', function()
          {
              somethingChanged();
          });
          // IE OK
          editor.document.getBody().on( 'drag', function()
          {
              somethingChanged();
          });
      });

      customElements.forEach(function (elementInfo) {
          var element = elementInfo[0],
              isInline = elementInfo[1];

          CKEDITOR.dtd.$object[element] = 1;
          CKEDITOR.dtd.body[element] = 1;

          if (isInline) {
              CKEDITOR.dtd.$inline[element] = 1;
              // если пустой - то удаляем его
              CKEDITOR.dtd.$removeEmpty[element] = 1;
          }
      })

    }
});

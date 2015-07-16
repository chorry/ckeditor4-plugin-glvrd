/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
    config.toolbarGroups = [
        { name: 'glvrd',    groups: [ 'glvrdPlugin' ]  }
    ];
    config.forcePasteAsPlainText = true;
    config.allowedContent = true;
    config.fillEmptyBlocks = false;
    config.wordcount = {

        // Whether or not you want to show the Word Count
        showWordCount: false,

        // Whether or not you want to show the Char Count
        showCharCount: true,

        // Whether or not to include Html chars in the Char Count
        countHTML: false,
        countSpacesAsChars: true
    };
    config.removeButtons = 'Cut,Copy,Paste,PageBreak,ShowBlocks,NewPage,Preview,Templates,Strike,Outdent,Indent,Styles,Format,Font,JustifyBlock';
    config.removePlugins = "youtube,image,table,tabletools,scayt";
    config.autoParagraph = false;

    config.height = '500px';

    config.extraPlugins = 'glvrdPlugin';

};
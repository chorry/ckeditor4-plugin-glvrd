# Installation
* Put 'glvrdPlugin' folder into ckeditor plugins folder (e.g. ckeditor/plugins - just like in this repo)  
* Adjust your ckeditor config.js:
** Enable plugin: config.extraPlugins = 'glvrdPlugin';
** Add plugin toolbar:     

    config.toolbarGroups = [
        { name: 'glvrd',    groups: [ 'glvrdPlugin' ]  }
    ];

# Requirements
jQuery

# Demo
Follow [this](http://chorry.github.io/ckeditor4-plugin-glvrd/) link, press "T" on the toolbar to view checked text.

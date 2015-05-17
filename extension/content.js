/**
 * (c) 2015 Mike North <michael.l.north@gmail.com>
 * MIT License
 */

(function () {

  'use strict';

  var serviceUrls = {
    npm: 'https://www.npmjs.org/package/'
  };

  start ();

  function start () {
    
    function run() {
      if (!$(document.body).hasClass('boxcutter-processed')) {
        switch(getManifestType()) {
          case 'js':
            enhanceJSModules();
            $(document.body).addClass('boxcutter-processed');
            return;
          case 'rb':
            enhanceRBModules();
            $(document.body).addClass('boxcutter-processed');
            return;
          default:
            /* do nothing */
            return;
        }
      }
    }
    
    $(document.body).click(function (evt) {
      var tries = 0;

      var task = setInterval(function() {
        if (getManifestType()) {
          run();
          clearInterval(task);
        }
        else {
          if (tries >= 20) {
            clearInterval(task);
          }
          tries++;
        }
      }, 100);
    });

    run();
  }

  function getManifestType() {
    var fileName = $('.final-path').text();
    switch(fileName) {
      case 'package.json':
      case 'bower.json':
        return 'js';
      case 'Gemfile':
        return 'rb';
      default:
        return null;
    }
  }

  function handleRBClick(jqevt) {
    var $target = $(jqevt.target);
    $.ajax("https://rubygems.org/api/v1/gems/" + $target.data('pkg-name') + ".json").then(function(data) {
      window.open(data.homepage_uri);
    });
  }

  function enhanceRBModules() {
    var $gemRows = $('.type-ruby tbody tr:contains("gem \'"), .type-ruby tbody tr:contains("gem ")');
    for (var i = 0; i < $gemRows.length; i += 1) {
      var $row = $($gemRows[i]);

      var rowText = $row.text().trim();
      var regexResult = /^gem\s+([\'\"]{1})([\w\-\_]+)\1/.exec(rowText);
      if (regexResult) {
        var gemName = regexResult[2];
      
        var $pkgName = $row.find('.pl-s:contains("' + gemName + '"), .pl-s:contains(\'' + gemName + '\')');
        var $quot = $pkgName.children()[0];
        var quot = $quot.innerText;

        var $lnk = $('<a data-pkg-name="' + gemName + '"></a>');
        $lnk.click(handleRBClick);
        $lnk[0].innerHTML = '<span class="pl-pds">' + quot + '</span>' + gemName + '<span class="pl-pds">' + quot + '</span>';

        $pkgName[0].innerHTML = '';
        $pkgName.append($lnk);

        
      }
    }
  }

  function handleJSClick(jqevt) {
    var $target = $(jqevt.target);
    var npmUrl = serviceUrls.npm + $target.data('pkg-name');
    $.ajax("https://registry.npmjs.org/" + $target.data('pkg-name')).then(function(data) {
      window.open(data.homepage);
    });
  }

  function enhanceJSModules() {
    var json = JSON.parse($('.js-file-line-container tbody').text());

    function enhanceLinkSection (section) {
      for(var k in section) {
        var pkgName = k;
        var pkgVersion = section[k];
        if (/^[0-9\.\~\^\-A-Za-z\*\>\<\=\s]+$/.test(pkgVersion)) {
          var lineSelector = '.js-file-line:contains(\'\'' + pkgName + '\'\'):contains(' + pkgVersion + '), .js-file-line:contains(\'\"' + pkgName + '\"\'):contains(' + pkgVersion + ')';
          var $line = $(lineSelector).first();
          var $pkg = $line.find(".pl-s:contains('" + pkgName + "'), .pl-s:contains(\"" + pkgName + "\")");
        
           var $quot = $pkg.children()[0];
          var quot = $quot.innerText;
          
          var $ver = $line.find(".pl-s:contains('" + pkgVersion + "'), .pl-s:contains(\"" + pkgVersion + "\")");
          var $lnk = $('<a data-pkg-name="' + pkgName + '" data-pkg-ver="' + pkgVersion + '"></a>');
          $lnk.click(handleJSClick);
          $lnk[0].innerHTML = '<span class="pl-pds">' + quot + '</span>' + pkgName + '<span class="pl-pds">' + quot + '</span>';
          $pkg[0].innerHTML = '';
          $pkg.append($lnk);
        }
      }
    }
    enhanceLinkSection(json.devDependencies);
    enhanceLinkSection(json.dependencies);
  }

}());

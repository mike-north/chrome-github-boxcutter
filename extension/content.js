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
      switch(getManifestType()) {
        case 'js':
          enhanceJSModules();
          return;
        default:
          /* do nothing */
          return;
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
      default:
        return null;
    }
  }

  function handleJSClick(jqevt) {
    var $target = $(jqevt.target);
    var npmUrl = serviceUrls.npm + $target.data('pkg-name');
    $.ajax("https://registry.npmjs.org/" + $target.data('pkg-name')).then(function(data) {
      window.open(data.homepage || npmUrl);
    });
  }


  function enhanceJSModules() {
    var json = JSON.parse($('.js-file-line-container tbody').text());

    function enhanceLinkSection (section) {
      for(var k in section) {
        var pkgName = k;
        var pkgVersion = section[k];
        if (/^[0-9\.\~\^\-A-Za-z\*]+$/.test(pkgVersion)) {
          var $line = $('.js-file-line:contains(' + pkgName + '):contains(' + pkgVersion + ')').first();
          var $pkg = $line.find(".pl-s:contains('" + pkgName + "')");
          var $ver = $line.find(".pl-s:contains('" + pkgVersion + "')");
          var $lnk = $('<a data-pkg-name="' + pkgName + '" data-pkg-ver="' + pkgVersion + '"></a>');
          $lnk.click(handleJSClick);
          $lnk[0].innerHTML = '<span class="pl-pds">"</span>' + pkgName + '<span class="pl-pds">"</span>';
          $pkg[0].innerHTML = '';
          $pkg.append($lnk);
        }
      }
    }
    enhanceLinkSection(json.devDependencies);
    enhanceLinkSection(json.dependencies);
  }

}());

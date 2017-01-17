/**
 * (c) 2015 Mike North <michael.l.north@gmail.com>
 * MIT License
 */

(function () {

  'use strict';

  var serviceUrls = {
    npm: 'https://www.npmjs.org/package/',
    bower: 'https://bower.herokuapp.com/packages/search/',
    composer: 'https://packagist.org/packages/'
  };

  $('head').append('<style type="text/css">a[data-pkg-name]{cursor:pointer}</style>');
  start ();

  function start () {
    
    function run() {
      if (!$(document.body).hasClass('boxcutter-processed')) {
        switch(getManifestType()) {
          case 'npm':
            enhanceJSModules('npm');
            $(document.body).addClass('boxcutter-processed');
            return;
          case 'bower':
            enhanceJSModules('bower');
            $(document.body).addClass('boxcutter-processed');
            return;
          case 'rb':
            enhanceRBModules();
            $(document.body).addClass('boxcutter-processed');
            return;
          case 'elixir':
            enhanceElixirModules();
            $(document.body).addClass('boxcutter-processed');
          case 'composer':
            enhanceComposerModules();
            $('body').addClass('boxcutter-processed');
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
          if (tries >= 100) {
            clearInterval(task);
          }
          tries++;
        }
      }, 200);
    });

    run();
  }

  function getManifestType() {
    var fileName = $('.final-path').text();
    switch(fileName) {
      case 'package.json':
        return 'npm';
      case 'bower.json':
        return 'bower';
      case 'Gemfile':
        return 'rb';
      case 'mix.exs':
        return 'elixir';
      case 'composer.json':
        return 'composer';
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
  
  function handleElixirClick(elem) {
    var pkgName = elem.target.attributes['data-pkg-name'].value;
    var hexUrl = 'https://hex.pm/packages/' + pkgName;
    $.get(hexUrl).then(function(data) {
      var ghurl = $(data).find('ul.links li a[href*="github"]').attr('href');
      window.open(ghurl || hexUrl);
    });
  }
  
  function enhanceElixirModules() {
    var codeRows = $('.type-elixir tbody tr td.blob-code-inner');
    var inDeps = false;
    for (var i = 0; i < codeRows.length; i+= 1) {
      var rowElem = codeRows[i];
      if (rowElem.innerText.trim() === 'defp deps do') {
        inDeps = true;
      } else {
        if (inDeps) {
          if (rowElem.innerText.trim() === 'end') {
            inDeps = false;
          } else {
            var r = /[\[]*\{\:([\w]+)[\,\s]*\"[\~\>\=]+[\s]*([0-9\.\w\-]+)/g;
            var parts = r.exec(rowElem.innerText.trim());
            var lib = parts[1];
            var vers = parts[2];
            var $pkgSymbol = $(rowElem).find('.pl-c1')[0]; 
            var existingText = $pkgSymbol.innerText;
            var newText = ":<a data-pkg-name=\"" + existingText.substring(1) + "\">" + existingText.substring(1) + "</a>"
            $($pkgSymbol).click(handleElixirClick);
            $pkgSymbol.innerHTML = newText;
          }
        }
      }
    }
  }

  function handleJSClick(jqevt) {
    var $target = $(jqevt.target);
    var packageName = $target.data('pkg-name');
    switch($target.data('pkg-type')) {
      case 'npm':
        var npmUrl = serviceUrls.npm + packageName;
        $.ajax("https://registry.npmjs.org/" + packageName).then(function(data) {
          window.open(data.homepage || npmUrl);
        });
        break;
      case 'bower':
        var bowerUrl = serviceUrls.bower + packageName;
        $.ajax(bowerUrl).then(function(data) {
          var pageUrl = (data[0] && data[0].url) ? data[0].url.replace("git://", "https://") : ("http://bower.io/search/?q=" + packageName);
          window.open(pageUrl);
        });
        break;
    }
  }

  function enhanceJSModules(moduleType) {
    var json = JSON.parse($('.js-file-line-container tbody').text());

    function enhanceLinkSection (section) {
      for(var k in section) {
        var pkgName = k;
        var pkgVersion = section[k];
        if (/^[0-9\.\~\^\-A-Za-z\*\>\<\=\s]+$/.test(pkgVersion)) {
          var lineSelector = '.js-file-line:contains(\'\'' + pkgName + '\'\'):contains(' + pkgVersion + '), .js-file-line:contains(\'\"' + pkgName + '\"\'):contains(' + pkgVersion + ')';
          var $line = $(lineSelector).first();
          var $pkg = $line.find(".pl-s:contains(''" + pkgName + "''), .pl-s:contains('\"" + pkgName + "\"')");
        
           var $quot = $pkg.children()[0];
          var quot = $quot.innerText;
          
          var $ver = $line.find(".pl-s:contains(''" + pkgVersion + "''), .pl-s:contains('\"" + pkgVersion + "\"')");
          var $lnk = $('<a data-pkg-type="' + moduleType + '" data-pkg-name="' + pkgName + '" data-pkg-ver="' + pkgVersion + '"></a>');
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

  function handleComposerClick(jqevt) {
    var $target = $(jqevt.target);
    var packageName = $target.data('pkg-name');
    var packagistUrl = serviceUrls.composer + packageName;
    $.ajax("https://packagist.org/p/" + packageName + '.json').then(function(data) {
      window.open(data['packages'][$target.data('pkg-name')]['dev-master']['homepage'] || packagistUrl);
    });
  }

  function enhanceComposerModules() {
    var json = JSON.parse($('.js-file-line-container tbody').text());

    function enhanceLinkSection (section) {
      for(var k in section) {
        var pkgName = k;
        var pkgVersion = section[k];
        if (/^[0-9\.\~\@\^\-a-z\*\>\<\=\/\s]+$/i.test(pkgVersion)) {
          var lineSelector = '.js-file-line:contains(\'\'' + pkgName + '\'\'):contains(' + pkgVersion + '), .js-file-line:contains(\'\"' + pkgName + '\"\'):contains(' + pkgVersion + ')';
          var $line = $(lineSelector).first();
          var $pkg = $line.find(".pl-s:contains(''" + pkgName + "''), .pl-s:contains('\"" + pkgName + "\"')");

          var $quot = $pkg.children()[0];
          var quot = $quot.innerText;

          var $ver = $line.find(".pl-s:contains(''" + pkgVersion + "''), .pl-s:contains('\"" + pkgVersion + "\"')");
          var $lnk = $('<a data-pkg-type="composer" data-pkg-name="' + pkgName + '" data-pkg-ver="' + pkgVersion + '"></a>');
          $lnk.click(handleComposerClick);
          $lnk[0].innerHTML = '<span class="pl-pds">' + quot + '</span>' + pkgName + '<span class="pl-pds">' + quot + '</span>';
          $pkg[0].innerHTML = '';
          $pkg.append($lnk);
        }
      }
    }

	if (typeof json['require'] != undefined) {
      enhanceLinkSection(json['require']);
	}
	if (typeof json['require-dev'] != undefined) {
      enhanceLinkSection(json['require-dev']);
	}
  }

}());

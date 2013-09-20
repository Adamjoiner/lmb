module.exports = function prepare ($, location) {
  var commandline = ['<form id=command><label><span class="cmd-prompt"></span>',
                     '<input autofocus autocapitalize=off spellcheck=false autocorrect=off contenteditable id="cmd-input">',
                     '<span class=wait id="cmd-cursor">&nbsp;</span></label></form>',
                     '<script src=/js/blocker.js></script>',
                     '<script src=/js/keyboardSounds.js></script>',
                     '<script src=/js/commandline.js></script>'].join('');

  // strip particular elements
  $('style,iframe,frame,frameset,img,hr,br').remove();
  $('link[rel=stylesheet]').remove();
  $('[style]').each(function () {
    $(this).removeAttr('style');
  });


  // expose the content of scripts
  $('script').each(function () {
    $(this).attr('type', 'text/plain');
  });


  // all documents have an [END] at the...
  // TODO parser question?
  $('body').append('<pre id=lmb-footer>\n\n     [End]</pre>');


  // insert command prompt
  $('body').append(commandline);


  // styles (early to attempt to avoid FOUC)
  $('body').prepend('<link class=ignore rel=stylesheet href=/css/linemode.css type=text/css>');


  // link numbering
  $('a').each(function (i) {
    var $el = $(this);
    $el.append('[' + (i+1) + ']');

    if (location) {

      var href = $el.attr('href') || '';
      // href = '/about/foo/foobar'
      var url = require('querystring').parse(location)['/proxy?url'] // brian.io/whatever/whatevers
      var host = require('url').parse(url).hostname                  // brian.io
      var protocol = require('url').parse(url).protocol

      // FIXME this is the href munging code. it is brittle. should be own, tested, module. bl
      // order important here
      if (href === '/') href = protocol + '//' + host
      if (href.toString().slice(0, 2) === '//') href = protocol + href;
      if (href.slice(0, 1) === '/') href = protocol + '//' +  host + href
      if (href.slice(0, protocol.length) != protocol) href = protocol + '//' + host + '/' +  href

      // set the proper rewritten url
      $el.attr('href', '/www/proxy?url=' + href);
    }
  });

  purge($('body'))
  // node compat
  return $;
}

function purge(d) {
    var a = d.attributes, i, l, n;
    if (a) {
        l = a.length;
        for (i = 0; i < l; i += 1) {
            n = a[i].name;
            if (typeof d[n] === 'function') {
                d[n] = null;
            }
        }
    }
    a = d.childNodes;
    if (a) {
        l = a.length;
        for (i = 0; i < l; i += 1) {
            purge(d.childNodes[i]);
        }
    }
}

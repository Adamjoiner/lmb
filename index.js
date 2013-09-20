var request = require('request'),
    connect = require('connect'),
    cheerio = require('cheerio'),
    parse = require('url').parse,
    path = require('path'),
    urlparse = require('url'),
    prepare = require('./prepare'),
    serve = require('./serve');

function inject(body, base) {
  if (body.toUpperCase().indexOf('<BODY') === -1) { // damn bodyless things...
    body = '<body>' + body + '</body>';
  }

  $ = cheerio.load(body);
  $ = prepare($, base ? '/proxy?url=' + base : '', require('url'));
  // FIXME escape & but don't bork the command line

  return $.html();
}

function proxy(req, res, next) {
  var url = parse(req.url, true);

  if (url.pathname === '/www/proxy') {
    var url = url.query.url;

    if (!url) {
      return next();
    }
    var base = urlparse.parse(url).protocol + '//' + urlparse.parse(url).hostname

    request(url, function (error, response, body) {
      base = response.request.uri.href;
      if (!error && response.statusCode == 200) {
        var html = inject(body.replace(/&/g, '&amp;'), base);
        res.write(html);
        res.end();
      } else if (response) {
        res.end(JSON.stringify({ error: error, status: response.statusCode }));
      } else {
        res.end(err.toString('utf8'))
      }
    })
  } else {
    next();
  }
}

connect()
  .use(function (req, res, next) {
    if ((req.url === '/www/referer' || req.url === '/www/referrer') && req.headers.referer) {
      res.writeHead(302, { location: '/www/proxy?url=' + req.headers.referer });
      res.end();
    } else {
      // TODO send a explanation page
    }
    next();
  })
  .use(serve('/www/', 'public', inject))
  .use(connect.static('public'))
  .use(proxy)
  .listen(process.env.PORT || 8000);

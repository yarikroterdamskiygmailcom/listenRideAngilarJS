var helmet = require('helmet');
var express = require('express');
var expressEnforcesSSL = require('express-enforces-ssl');
var prerender = require('prerender-node');
var app = express();
var logger = function (req, res, next) {
  next();
};

// prerender
app.use(require('prerender-node').set('prerenderToken', 'W8S4Xn73eAaf8GssvVEw'));

// setting proper http headers
app.use(helmet());

// redirect to https
app.enable('trust proxy');
app.use(expressEnforcesSSL());

// get port from env
app.set('port', (process.env.PORT || 9003));

// see all transactions through server
app.use(logger);

var determineHostname = function(subdomains, hostname) {
  var domainPrefix = "www.";
  var domainEnding = retrieveTld(hostname);
  for (var i = 0; i < subdomains.length; i++) {
    switch (subdomains[i]) {
      case "en": domainEnding = ".com"; break;
      case "de": domainEnding = ".de"; break;
      case "nl": domainEnding = ".nl"; break;
      case "it": domainEnding = ".it"; break;
    }
    if (subdomains[i] === "staging") {
      domainPrefix = "www.staging.";
    } 
  }
  return domainPrefix + "listnride" + domainEnding;
};

var stripTrailingSlash = function(url) {
  return url.replace(/\/+$/, ""); 
}

var retrieveTld = function(hostname) {
  return hostname.replace(/^(.*?)\listnride/, "");
}

var redirectUrl = function (req, res, next) {
  var correctHostname = stripTrailingSlash(determineHostname(req.subdomains, req.hostname));
  var correctOriginalUrl = stripTrailingSlash(req.originalUrl);
  if (req.hostname === correctHostname && req.originalUrl === correctOriginalUrl) {
  } else {
    res.redirect(301, 'https://www.staging.listnride.de'); // "https://" + correctHostname + correctOriginalUrl
  }
  return next();
};

// proper redirects
app.all('/', function(req, res, next) {redirectUrl(req, res, next)});

// by default serves index.html
// http://expressjs.com/en/4x/api.html#express.static
app.use(express.static(__dirname.concat('/listnride/dist'), {index: 'index.html'}));

app.listen(app.get('port'), function () {
});

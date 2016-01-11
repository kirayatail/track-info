'use strict';
var express = require('express');
var request = require('request');
var app = express();

// IP for the media player. Make sure it's a string (surrounded with quotes).
var host = '192.168.1.67';


app.route('/track')
  .get(function(req, res) {
    var response = {};
    var uri = 'http://'+host+'/Ds/Info/control';
    var options = {
      uri: uri,
      method: 'POST',

      headers: {
        SOAPAction: 'urn:av-openhome.org:service:Info:1#Track',
        'content-type': 'text/xml'
      },
      body: '<?xml version="1.0"?><s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><u:Track xmlns:u="urn:av-openhome.org:service:Info:1"></u:Track></s:Body></s:Envelope>'
    };

    request(options, function(error, r, body) {
      if(!error && body) {
        var albumart = '',
        album = '',
        artist = '',
        title = '';

        if(body.indexOf('upnp:albumArtURI') !== -1) {
          albumart = resizeTidal(
            deescape(
              body.split('upnp:albumArtURI')[1]
              .split('&gt;')[1]
              .split('&lt;')[0]
            )
          );
        }

        if(body.indexOf('upnp:album ') !== -1) {
          album = deescape(
            body.split('upnp:album ')[1]
            .split('&gt;')[1]
            .split('&lt;/upnp:album')[0]
          );
        }

        if(body.indexOf('upnp:artist') !== -1) {
          artist = deescape(
            body.split('&lt;upnp:artist')[1].split('&gt;')[1].split('&lt;/upnp:artist')[0]
          );
        }

        if(body.indexOf('&lt;dc:title') !== -1) {
          title = deescape(
            body.split('&lt;dc:title')[1].split('&gt;')[1].split('&lt;/dc:title')[0]
          );
        }

        response = {
          albumArtURI: albumart,
          title: title,
          artist: artist,
          album: album
        }

      } else {
        response.albumArtURI = 'http://images.tidalhifi.com/im/im?w=750&h=750&albumid=14089987';
        response.artist = 'Bonnie Raitt';
        response.album = 'Slipstream';
        response.title = 'Million Miles [Dummy Data]';
      }
      res.status(200).send(response);

    });

  });

app.use(express.static('app'));

var resizeTidal = function(url) {
  if(url.indexOf('tidalhifi') !== -1) {
    return url.split('w=250&h=250').join('w=700&h=700');
  } else {
    return url;
  }
}

var deescape = function(a) {
  while(a.split('&amp;').length > 1) {
    a = a.replace('&amp;', '&');
  }
  while(a.split('&apos;').length > 1) {
    a = a.replace('&apos;', '\'');
  }
  return a;
}
console.log("App running on port "+(process.env.PORT || 3000));
app.listen(process.env.PORT || 3000);

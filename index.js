'use strict';
var express = require('express');
var request = require('request');
var odm = require('openhome-devices-manager');
var app = express();

// Edit this value to point to your device name
var deviceName = 'Main Room'

var device = {};

app.route('/track')
  .get(function(req, res) {

    if(!device.name && !findDevice()) {

      return res.status(200).send({
        albumArtURI: '',
        title: '',
        artist: '',
        album: ''
      });
    }

    device.ds.currentTrackDetails(function(error, result) {
      var response = {};
      var body = result.metadata || null;
      if(!error && body) {
        var albumart = '',
        album = '',
        artist = '',
        title = '';

        if(body.indexOf('upnp:albumArtURI') !== -1) {
          albumart = resizeTidal(
            deescape(
              body.split('upnp:albumArtURI')[1]
              .split('>')[1]
              .split('<')[0]
            )
          );
        }

        if(body.indexOf('upnp:album ') !== -1) {
          album = deescape(
            body.split('upnp:album ')[1]
            .split('>')[1]
            .split('</upnp:album')[0]
          );
        }

        if(body.indexOf('upnp:artist') !== -1) {
          artist = deescape(
            body.split('<upnp:artist')[1].split('>')[1].split('</upnp:artist')[0]
          );
        }

        if(body.indexOf('<dc:title') !== -1) {
          title = deescape(
            body.split('<dc:title')[1].split('>')[1].split('</dc:title')[0]
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

var findDevice = function() {
  var dev;
  var devs = odm.getDevices();
  while(!(dev = devs.next()).done) {
    if(dev.value) {
      if(odm.getDevice(dev.value).name.indexOf(deviceName) > -1) {
        device = odm.getDevice(dev.value);
        return true;
      }
    }
  }
  return false;
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

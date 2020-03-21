'use strict';
var express = require('express');
var request = require('request');
var odm = require('openhome-devices-manager');
var app = express();
var util  = require('util');

// Edit this value to point to your device name
var deviceName = 'Main room:Akurate DSM'

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
      var response = {
        albumArtURI: '',
        title: '',
        artist: '',
        album: ''
      };
      var body = result && result.metadata ? result.metadata : null;
      if(!error && body) {
        if(body.indexOf('upnp:albumArtURI') !== -1) {
          response.albumArtURI = resizeTidal(
            deescape(
              body.split('upnp:albumArtURI')[1]
              .split('>')[1]
              .split('<')[0]
            )
          );
        }

        if(/upnp:album[ >]/.test(body)) {
          response.album = deescape(
            body.split(/<upnp:album(>| [^>]*>)/)[2]
            .split('</upnp:album')[0]
          );
        }

        if(body.indexOf('upnp:artist') !== -1) {
          response.artist = deescape(
            body.split('<upnp:artist')[1].split('>')[1].split('</upnp:artist')[0]
          );
        }

        if(body.indexOf('<dc:title') !== -1) {
          response.title = deescape(
            body.split('<dc:title')[1].split('>')[1].split('</dc:title')[0]
          );
        }

      }
      res.status(200).send(response);
    });
  });

app.use(express.static('app'));

var resizeTidal = function(url) {
  if(url.indexOf('tidalhifi') !== -1) {
    return url.split('w=250&h=250').join('w=600&h=600');
  } else {
    return url;
  }
}

var insensitiveEquals = function(a, b) {
  return a.toLowerCase().indexOf(b.toLowerCase()) !== -1;
}

var findDevice = function() {
  var dev;
  var devs = odm.getDevices();
  while(!(dev = devs.next()).done) {
    if(dev.value) {
      var d = odm.getDevice(dev.value);
      console.log("Found device: " + odm.getDevice(dev.value).name);
      if (insensitiveEquals(odm.getDevice(dev.value).name, deviceName)) {
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

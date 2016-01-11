var track = {};
function fetch() {
  $.ajax('/track', {success: function(data) {
    if(!equals(data, track)) {
      update(data);
    }
  }});
}

function equals(a,b) {
  for(var p in a) {
    if(a.hasOwnProperty(p)) {
      if(!b.hasOwnProperty(p) || a[p] !== b[p])
        return false;
    }
  }
  return true;
}

function update(data) {
  track = data;
  moveOut();
  if(data && (data.albumArtURI || data.album || data.artist || data.title)) {
    setTimeout(function() {
      $('#albumart').attr('src', data.albumArtURI);
      $('#title').text(data.title);
      $('#artist').text(data.artist);
      $('#album').text(data.album);
      moveIn();
    },2010);
  }
}

function moveOut() {
  $('.columns-container').addClass('animate');
  setTimeout(function() {
    $('.columns-container').addClass('out');
    setTimeout(function() {
      $('.columns-container').removeClass('animate');
    }, 2000);
  }, 10);
}

function moveIn() {
  $('.columns-container').addClass('in');
  $('.columns-container').removeClass('out');
  setTimeout(function() {
    $('.columns-container').addClass('animate');
    setTimeout(function() {
      $('.columns-container').removeClass('in');
      setTimeout(function() {
        $('.columns-container').removeClass('animate');
      }, 2000);
    }, 10);
  }, 10);
}

fetch();
setInterval(fetch, 1000);

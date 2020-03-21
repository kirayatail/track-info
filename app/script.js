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
  $('.columns-container').addClass('hide');
  if(data && (data.albumArtURI || data.album || data.artist || data.title)) {
    setTimeout(function() {
      $('#albumart').attr('src', data.albumArtURI);
      $('#title').text(data.title);
      $('#artist').text(data.artist);
      $('#album').text(data.album);
      setTimeout(function() {
        $('.columns-container').removeClass('hide');
      }, 10);
    },1510);
  }
}

fetch();
setInterval(fetch, 1000);

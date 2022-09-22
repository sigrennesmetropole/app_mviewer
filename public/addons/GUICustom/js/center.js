var _map = mviewer.getMap();
var originalCenter = _map.getView().getCenter();

_map.on('click', function (event) {
    if(!document.getElementById("right-panel").classList.contains("active")){
      const myTimeout = setTimeout(function(){
        var newCenter = _map.getCoordinateFromPixel(event.pixel);
        newCenter[1] = originalCenter[1];
        _map.getView().setCenter(newCenter);
      }, 1000);
  }else{
    _map.getView().setCenter(originalCenter);
  }

});

$("#right-panel")[0].childNodes[1].childNodes[2].addEventListener("click",function(){
  const myTimeout = setTimeout(function(){
    _map.getView().setCenter(originalCenter);
  }, 500);
});

$("#right-panel").removeClass("active");

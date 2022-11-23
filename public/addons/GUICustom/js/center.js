var _map = mviewer.getMap();
var originalCenter = _map.getView().getCenter();
var wasPanelOpen = false;

_map.on('click', function (event) {
  const myTimeout = setTimeout(function(){
    if(document.getElementById("right-panel").classList.contains("active") && !wasPanelOpen){
        var newCenter = _map.getCoordinateFromPixel(event.pixel);
        newCenter[1] = originalCenter[1];
        _map.getView().setCenter(newCenter);
        wasPanelOpen = true;
    }
    if(!document.getElementById("right-panel").classList.contains("active") && wasPanelOpen){
      _map.getView().setCenter(originalCenter);
      wasPanelOpen = false;
    }
  }, 1000);

});

$("#right-panel")[0].childNodes[1].childNodes[2].addEventListener("click",function(){
  const myTimeout = setTimeout(function(){
    _map.getView().setCenter(originalCenter);
    wasPanelOpen = false;
  }, 500);
});

$("#right-panel").removeClass("active");

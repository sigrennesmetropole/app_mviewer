var _map = mviewer.getMap();
var originalCenter = _map.getView().getCenter();

_map.on('click', function (event) {
  // console.log(event);
  const myTimeout = setTimeout(function(){
    console.log(document.getElementById("right-panel").classList.contains("active"));
    if(document.getElementById("right-panel").classList.contains("active")){
        var newCenter = _map.getCoordinateFromPixel(event.pixel);
        newCenter[1] = originalCenter[1];
        // _map.getView().setCenter([76,0]);
        console.log(newCenter);
        _map.getView().setCenter(newCenter);
    }else{
      _map.getView().setCenter(originalCenter);
    }
  }, 1000);

});

$("#right-panel")[0].childNodes[1].childNodes[2].addEventListener("click",function(){
  const myTimeout = setTimeout(function(){
    _map.getView().setCenter(originalCenter);
  }, 500);
});

$("#right-panel").removeClass("active");

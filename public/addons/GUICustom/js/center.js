var _map = mviewer.getMap();
var originalCenter = _map.getView().getCenter();
var wasPanelOpen = false;
var rightPanelWidth;
var screenWidth = screen.width;

_map.on('click', function (event) {
  const myTimeout = setTimeout(function(){
    if(document.getElementById("right-panel").classList.contains("active") && !wasPanelOpen){
      rightPanelWidth = document.getElementById("right-panel").offsetWidth;
      _map.getView().animate({
        center : [originalCenter[0] + (rightPanelWidth*screenWidth)/30, originalCenter[1]],
        duration: 500,
      });
      wasPanelOpen = true;
    }
    if(!document.getElementById("right-panel").classList.contains("active") && wasPanelOpen){
      _map.getView().animate({
        center : originalCenter,
        duration: 500,
      });
      wasPanelOpen = false;
    }
  }, 650);
});


$("#right-panel")[0].childNodes[1].childNodes[2].addEventListener("click",function(){
  const myTimeout = setTimeout(function(){
    _map.getView().animate({
      center : originalCenter,
      duration: 500,
    });
    wasPanelOpen = false;
  }, 500);
});

$("#right-panel").removeClass("active");

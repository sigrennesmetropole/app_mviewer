var _popup = null;
var overlays = [];
var coordinate;
var fired = false;

$("#page-content-wrapper").prepend("<div id='popup-number-results'></div>");
_popup = new ol.Overlay({ positioning: 'center', element: $("#popup-number-results")[0], stopEvent: false})
mviewer.getMap().addOverlay(_popup);
rmOptionsManager.init();

_map.on('singleclick', function (evt) {
  // info.queryMap(evt);
  setTimeout(function(){
    coordinate = evt.coordinate;
    showLocation('EPSG:4326');
  },300);
});

_map.on('pointermove', function(evt){
  if(fired === true){
    showLocation('EPSG:4326');
  }
});

function showLocation(projection) {
  var ptResult = ol.proj.transform(coordinate, projection, mviewer.getProjection().getCode());
  mviewer.getMarker().setPosition(ptResult);
  $("#mv_marker").show();
  var nbItems = rmOptionsManager.getClickNbItems();
  if(nbItems > 1 && rmOptionsManager.getApplicationConfiguration().showClickNbItems !== "false") {
    fired = true;
    var pixelledPosition = _map.getPixelFromCoordinate(coordinate);
    pixelledPosition[2] = (pixelledPosition[0] - 15) + 'px';
    pixelledPosition[3] = (pixelledPosition[1] - 35) + 'px';
    pixelledPosition[0] = pixelledPosition[0] + 'px';
    pixelledPosition[1] = pixelledPosition[1] + 'px';
    $("#popup-number-results").css({'transform':'translate(' + pixelledPosition[0] + ',' + pixelledPosition[1] + ')','position':'relative'});
    $("#mv_marker").css({'transform':'translate(' + pixelledPosition[2] + ',' + pixelledPosition[3] + ')','position':'relative'});
    $('.ol-overlay-container').css({'transform':'translate(0px,0px)'});
    $("#popup-number-results").html(rmOptionsManager.getClickNbItems() + ' résultats');
    $("#popup-number-results").parent().show();
  }else {
    fired = false;
    $("#popup-number-results").parent().hide();
  }
  _map.render();
}

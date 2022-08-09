var coordinate;
var nbResultats = 0;
var fired = false;


$("#page-content-wrapper").prepend("<div id='popup-number-results'></div>");
var _popup = new ol.Overlay({ positioning: 'center', element: $("#popup-number-results")[0], stopEvent: false})
mviewer.getMap().addOverlay(_popup);


_map.on('singleclick', function (evt) {
    document.addEventListener('infopanel-ready', () => {
            coordinate = evt.coordinate;
            nbResultats = info.getQueriedFeatures().length;
            showLocation('EPSG:4326');
            document.dispatchEvent(new CustomEvent('clickedNbFeaturesEvt', { detail: {'nbfeatures': nbResultats, 'position': evt.coordinate}}));
        }, { once: true });
});



_map.on('movestart', function (evt) {
  $("#popup-number-results").parent().hide();
});


function showLocation(projection) {
  if(info.getQueriedFeatures().length > 1 && configuration.getConfiguration().application.showClickNbItems !== "false") {
    var pixelledPosition = _map.getPixelFromCoordinate(coordinate);
    pixelledPosition[2] = (pixelledPosition[0] - 15) + 'px';
    pixelledPosition[3] = (pixelledPosition[1] - 35) + 'px';
    pixelledPosition[0] = pixelledPosition[0] + 'px';
    pixelledPosition[1] = pixelledPosition[1] + 'px';
    $("#popup-number-results").css({'transform':'translate(' + pixelledPosition[0] + ',' + pixelledPosition[1] + ')','position':'relative'});
    $("#popup-number-results").html(info.getQueriedFeatures().length + ' résultats');
    $("#popup-number-results").parent().show();
  }else {
    $("#popup-number-results").parent().hide();
  }
  _map.render();
}

function refreshResultsNumber(){
    if ($("#popup-number-results")) {
        document.addEventListener('infopanel-ready', () => {
            $("#popup-number-results").html(info.getQueriedFeatures().length + ' résultats');
            setTimeout(function(){ $("#mv_marker").show(); },250);
          }, { once: true });
    }
}

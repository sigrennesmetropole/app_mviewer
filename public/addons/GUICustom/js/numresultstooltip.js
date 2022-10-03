var coordinate = _map.getView().getCenter();


$("#page-content-wrapper").prepend("<div id='popup-number-results'></div>");
var _popup = new ol.Overlay({ positioning: 'center', element: $("#popup-number-results")[0], stopEvent: false})
mviewer.getMap().addOverlay(_popup);


_map.on('singleclick', function (evt) {
    $("#popup-number-results").parent().hide();
    coordinate = evt.coordinate;
});

_map.on('movestart', function (evt) {
  $("#popup-number-results").parent().hide();
});

document.addEventListener('infopanel-ready', () => {showLocation();});

document.addEventListener('refresh-panels', () => {refreshResultsNumber();});


function showLocation() {
    setTimeout(function(){ // laisser le temps de mise à jour des coordonnées au clic
        if(info.getQueriedFeatures().length > 1 && configuration.getConfiguration().application.showClickNbItems !== "false") {
            _popup.setPosition(coordinate);
            $("#popup-number-results").html(info.getQueriedFeatures().length + ' résultats');
            $("#popup-number-results").parent().show();
        }else {
            $("#popup-number-results").parent().hide();
        }
        document.dispatchEvent(new CustomEvent('clickedNbFeaturesEvt', { detail: {'nbfeatures': info.getQueriedFeatures().length, 'position': coordinate}}));
    },250);
}

function refreshResultsNumber(){
    if ($("#popup-number-results")) {
        if (info.getQueriedFeatures().length > 0) {
            $("#popup-number-results").html(info.getQueriedFeatures().length + ' résultats');
            setTimeout(function(){ $("#mv_marker").show(); },250);
        } else {$("#popup-number-results").parent().hide();}
    }
}

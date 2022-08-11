var coordinate;
var nbResultats = 0;
var fired = false;


$("#page-content-wrapper").prepend("<div id='popup-number-results'></div>");
var _popup = new ol.Overlay({ positioning: 'center', element: $("#popup-number-results")[0], stopEvent: false})
mviewer.getMap().addOverlay(_popup);


_map.on('singleclick', function (evt) {
    if ($('.popup-content ul.nav-tabs>li').length > 0 ){
        showLocation(evt.coordinate);
    } else {
        document.addEventListener('infopanel-ready', () => {
            showLocation(evt.coordinate);
        }, { once: true });
    }
});



_map.on('movestart', function (evt) {
  $("#popup-number-results").parent().hide();
});


function showLocation(coordinates, ) {
    if(info.getQueriedFeatures().length > 1 && configuration.getConfiguration().application.showClickNbItems !== "false") {
        _popup.setPosition(coordinates);
        $("#popup-number-results").html(info.getQueriedFeatures().length + ' résultats');
        $("#popup-number-results").parent().show();
    }else {
        $("#popup-number-results").parent().hide();
    }
    document.dispatchEvent(new CustomEvent('clickedNbFeaturesEvt', { detail: {'nbfeatures': info.getQueriedFeatures().length, 'position': coordinates}}));
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

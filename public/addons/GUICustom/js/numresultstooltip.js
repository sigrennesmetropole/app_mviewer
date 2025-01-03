
var showNbFeatures = false;
var coordinate = _map.getView().getCenter();

var openedInfoPanel = false;

function _init() {
    showNbFeatures = configuration.getConfiguration().application.showClickNbItems !== "false";
    var nbPan = document.getElementById('popup-number-results');
    if (showNbFeatures && nbPan == null){
        $("#page-content-wrapper").prepend("<div id='popup-number-results'></div>");
        var _popup = new ol.Overlay({ positioning: 'center', element: $("#popup-number-results")[0], stopEvent: false})
        mviewer.getMap().addOverlay(_popup);
        $("#popup-number-results").parent().hide();

        _map.on('singleclick', function (evt) {
            coordinate = evt.coordinate;
            _popup.setPosition(coordinate);
            refreshResultsNumber();
        });

        document.addEventListener('markerdisplayEvent', (e) => {
            if (e.detail.display === 'none'){
                $("#popup-number-results").parent().hide();
            } else {
                setTimeout(refreshResultsNumber ,250);
            }
        });

        document.addEventListener('infopanel-ready', () => {refreshResultsNumber();});
    }
}

function refreshResultsNumber(){
    if (showNbFeatures && info.getQueriedFeatures() != undefined && info.getQueriedFeatures().length > 1) {
        $("#popup-number-results").html(info.getQueriedFeatures().length + ' résultats');
        $("#popup-number-results").parent().show();
    } else {
        $("#popup-number-results").parent().hide();
    }
}


_map.once('postcompose', _init);


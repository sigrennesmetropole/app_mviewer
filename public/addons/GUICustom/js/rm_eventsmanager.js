var observedElem = {
    'mv_marker':'markerdisplayEvent',
    'right-panel':'rightpanelEvent',
    'bottom-panel' : 'bottompanelEvent'
};


for (const elem in observedElem) {
    let observer = new MutationObserver(function(mutations) {
        let targetId = mutations[0].target.id;
        //console.log("TARGET = " + targetId);
        const markerDisplayEvent = new CustomEvent(observedElem[targetId], {
            detail: {
              display: window.getComputedStyle(document.querySelector('#'+targetId)).display,
              classList: document.querySelector('#'+targetId).classList
            }
        });
        document.dispatchEvent(markerDisplayEvent);
    });

    observer.observe(document.querySelector('#'+elem), { attributes: true, characterData:true} );
}

document.addEventListener('infopanel-ready', () => {
    setTimeout( function() {
        if (window.getComputedStyle(document.querySelector('#mv_marker')).display == 'none') {
             $("#mv_marker").show();
        }
    },100);
});

var _coordinates;
_map.on('singleclick', function (evt) {
    _coordinates = evt.coordinate;
});

function simulateClick(layer){
    if(_coordinates && _coordinates !== 'undefined') {
        var _event = {
                coordinate: _coordinates,
                pixel: _map.getPixelFromCoordinate(_coordinates)
            };
        if (!layer || layer=='undefined'){
            //console.log("disparition de couche");
            setTimeout( function() { info.queryMap(_event);}, 300);
            //info.queryMap(_event);
        } else{
            //console.log("apparition de couche");
            layer.once('postrender', function() { info.queryMap(_event);});
        }
        return Promise.resolve("Success");
    }
}

function initLayerListeners(){
    var layers = mviewer.getLayers();
    for (index in layers){
        let layer = mviewer.getLayer(index).layer;
        layer.on('change:visible', (e) => {
            if (e.oldValue==true) {
                simulateClick(null);
            }else{ 
                simulateClick(layer);
            }
        });
    }
}

_map.once('postcompose', initLayerListeners);
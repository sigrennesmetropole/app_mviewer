
mviewer.customLayers.dircove_biodiv= (function() {
    
    var data = 'apps/fondsconcours/customlayers/data/dircove_biodiversite.geojson';
    var markercolor = '#f78b12';
    
    var _style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: markercolor,
            }),
            stroke: new ol.style.Stroke({
                color: '#FFFFFF',
                width: 0.2
            })
        })
    });
    
    
    let _layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data,
            format: new ol.format.GeoJSON(),
        }),
        style: _style,
    });
    
    function filterdata() {
        var features = _layer.getSource().getFeatures();
        
        for (f in features) {
            if (features[f].get('année') != annee) {
                _layer.getSource().removeFeature(features[f]);
            }
        }
    }
    
    //_layer.on('prerender',() =>{
    //    filterdata();
    //});
    _layer.getSource().on('change',() =>{
        if (_layer.getSource().getFeatures().length > 0) {
            console.log("Modification features couche BIODIV :" + _layer.getSource().getFeatures().length);
        }
    });
    
    return {
        layer: _layer,
    }
}());



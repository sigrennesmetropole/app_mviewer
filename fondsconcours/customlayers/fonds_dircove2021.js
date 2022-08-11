
mviewer.customLayers.dircove2021= (function() {
    
    var data = 'apps/fondsconcours/customlayers/data/dircove2021.geojson';
    //var annee = '2021-2022';
    
    var _style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({
                color: '#b22496',
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
    
    return {
        layer: _layer,
    }
}());



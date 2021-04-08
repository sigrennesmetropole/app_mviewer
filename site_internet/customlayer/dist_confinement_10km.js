mviewer.customLayers.distconfinement_10km = (function() {
    function featureStyle10km() {
        let style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgb(63, 209, 238,0.3)',
            }),
            stroke: new ol.style.Stroke({
                color: '#3FD1EE',
                width: 0.5
            })
        });
        return [style];
    }
    
    let confLayer10km = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON()
        }),
        style: featureStyle10km,
    });
    

    
    return {
        layer: confLayer10km,
    }
}());
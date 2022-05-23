
mviewer.customLayers.lignes_metro= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=trp_coll:metro_trace_axe&outputFormat=application/json&srsName=EPSG:4326';
    
    
    function markerStyle(feature) {
        let type = feature.get('ligne');
        
        if (type == "a") {
            return featureMarker('#000000');
        } else {
            return featureMarker('#757575');
        }
    }
    
    function featureMarker(color) {
        return [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 2
                  })
            })
        ];
    }
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_url,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());



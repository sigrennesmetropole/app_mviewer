
mviewer.customLayers.stat_payant= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=trp_statio:stationnement_payant&outputFormat=application/json&srsName=EPSG:4326';
    
    
    function markerStyle(feature) {
        let type = feature.get('zone_tarif');
        
        if (type == "Rouge") {
            return featureMarker('#eb5046');
        } else {
            return featureMarker('#95c351');
        }
    }
    
    function featureMarker(color) {
        return [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: color,
                    width: 3
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



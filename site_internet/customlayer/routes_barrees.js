
mviewer.customLayers.routes_barrees= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/ressources/donnees/sec_risnat/inondations_2025/routes_barrees.geojson';
    
    
    function markerStyle(feature) {
        
        let etat = feature.get('etat');
        
        if (etat == "En cours") {
            return featureMarker('#e81a2c');
        } else {
            return featureMarker('#02d128');
        }
    }
    
    function featureMarker(color) {
        return [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                    color: "#000000",
                    lineCap: "round",
                    width: 7
                    })
                }),
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                    color: color,
                    lineCap: "round",
                    width: 5,
                    })
                })
            ];
    }
    
    
    
    
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_url,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle
    });
    
    
        
    return {
        layer: dataLayer,
    }
}());



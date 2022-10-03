
mviewer.customLayers.artville= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=ptou_lois:v_art_ville&outputFormat=application/json&srsName=EPSG:4326';
    

    
    function markerStyle(feature) {
        let type = feature.get('type');
        let etat = feature.get('etat');
        
        if (etat == "Pour mémoire") {
            return featureMarker('#8f9169');
        } else if (type == "Œuvre sur l'espace public") {
            return featureMarker('#e45e52');
        } else if (type == "Œuvre dans un bâtiment") {
            return featureMarker('#33919d');
        } else if (type == "Street art") {
            return featureMarker('#f9a241');
        }
    }
    
    function featureMarker(couleur) {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: couleur, 
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
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



mviewer.customLayers.projurbains = (function() {
    let data_proj = "apps/story/data/projets_urba_mviewer.geojson";
    /*
    function markerStyle(feature) {
        let categ = feature.get('categorie');
        
        if (categ == "Projet d'aménagement") {
            return featureMarker('https://public.sig.rennesmetropole.fr/ressources/img/mviewer/marker_bleu.png');
        } 
        else if (categ == "Espace public") {
            return featureMarker('https://public.sig.rennesmetropole.fr/ressources/img/mviewer/marker_vert.png');
        }
    }
    
    function featureMarker(url) {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    scale:0.25,
                    src: url,
                  })
            })
        ];
    }
    */
    
    function markerStyle(feature) {
        let categ = feature.get('categorie');
        
        if (categ == "Projet d'aménagement") {
            return featureMarker('#33919d');
        } 
        else if (categ == "Espace public") {
            return featureMarker('#8f9169');
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
    
    let projetLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_proj,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    
    
    return {
        layer: projetLayer,
    }
}());
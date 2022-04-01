
mviewer.customLayers.dae_rennes= (function() {
    //var dae_data_url = 'https://datacarto.atlasante.fr/wfs/87d621bd-fc7b-4b51-92b7-7515ac1c66c7?service=WFS&request=GetFeature&version=2.0.0&typename=ms:geodae_publique&outputFormat=geojson&srsName=EPSG:3857&FILTER%3D%3CFilter%3E%3CPropertyIsEqualTo%3E%3CValueReference%3Ec_com_insee%3C%2FValueReference%3E%3CLiteral%3E35238%3C%2FLiteral%3E%3C%2FPropertyIsEqualTo%3E%3C%2FFilter%3E';
    var dae_data_url = 'https://datacarto.atlasante.fr/wfs/87d621bd-fc7b-4b51-92b7-7515ac1c66c7?service=WFS&request=GetFeature&version=2.0.0&typename=ms:geodae_publique&outputFormat=geojson&srsName=EPSG:3857&FILTER%3D%3CFilter%3E%3CPropertyIsEqualTo%3E%3CValueReference%3Ec_expt_siren%3C%2FValueReference%3E%3CLiteral%3E213502388%3C%2FLiteral%3E%3C%2FPropertyIsEqualTo%3E%3C%2FFilter%3E';
    
   
    
    function daeStyle(feature) {
        let acces = feature.get('c_disp_h');
        
        if (acces == "{24h\/24}") {
            return featureMarker('#f89629');
        } else {
            return featureMarker('#e04a3c');
        } 
    }
    
    function featureMarker(color) {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: color,  
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    let daeLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: dae_data_url,
            format: new ol.format.GeoJSON(),
            //crossOrigin: 'anonymous',
        }),
        style: daeStyle,
    });
    
    
    return {
        layer: daeLayer,
    }
}());



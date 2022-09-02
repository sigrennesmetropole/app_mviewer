
mviewer.customLayers.conseilquartier= (function() {
    let bureau_perim_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=ladm_terri:v_conseil_quartier&outputFormat=application/json&srsName=EPSG:4326';
    
    
    
    function markerStyle(feature) {
        let label = 'N°' + feature.get('nuconseil') + ' - ' + feature.get('nomconseil');
        let fontFamily = "Arial, Verdana, Courier New";
        //console.log(label);
        
        let style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#CE4257', 
                  lineDash: [4,8],
                  lineDashOffset: 8,
                  width: 2,
                }),
                fill: new ol.style.Fill({
                  color: '#FFFFFF60'
                }),
                text: new ol.style.Text({
                    text: label,
                    overflow: true,
                    fill : new ol.style.Fill({
                        color: '#4F000B',
                    }),
                    font: 'bold 13px ' + fontFamily,
                    backgroundFill: new ol.style.Fill({
                        color: '#FFFFFF25',
                    }),
                    
                    padding: [2, 2, 2, 2], 
                }),
              });
        return [style];
    }
    
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: bureau_perim_url,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());



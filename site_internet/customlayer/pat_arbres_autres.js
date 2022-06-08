
mviewer.customLayers.arbresautres= (function() {
    let daterefmin = new Date().getFullYear()-50;
    let daterefmax = new Date().getFullYear();
    let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:gev_aali&CQL_FILTER=date_plant>='+ daterefmin +' AND date_plant<'+ daterefmax +'&outputFormat=application/json&srsName=EPSG:4326';
    
    
    function rondStyle() {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#5DADE2',
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: 0.5,
                    opacity: '80%',
                })
            })
        });
        return [style];
    }
    
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_url,
            format: new ol.format.GeoJSON()
        }),
        style: rondStyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());



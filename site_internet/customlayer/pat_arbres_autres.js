mviewer.customLayers.arbresautres= (function() {
    let daterefmin = new Date().getFullYear()-50;
    let daterefmax = new Date().getFullYear();
    let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:gev_aali&CQL_FILTER=date_plant>='+ daterefmin +' AND date_plant<'+ daterefmax +'&outputFormat=application/json&srsName=EPSG:4326';
    
    function markerStyle() {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#BBDE91', 
                  crossOrigin: 'anonymous',
                  //scale:0.1,
                  //anchor:[0.5,1],
                  //src: 'apps/site_internet/customlayer/picture/arbre.svg',
                  src: 'apps/site_internet/customlayer/picture/rond_default.svg',
                }),
              })
        ];
    }
    
    
    function rondStyle() {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#BBDE91',
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
        style: markerStyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());

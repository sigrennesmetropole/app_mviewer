mviewer.customLayers.arbresanciens= (function() {
    let age_ancien = 50;
    let dateref = new Date().getFullYear() - age_ancien;
    let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:v_gev_aali&CQL_FILTER=date_plant<='+ dateref +'&outputFormat=application/json&srsName=EPSG:4326';
    let datacolor = '#628A31'
    
    
    function markerStyle() {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: datacolor, 
                  crossOrigin: 'anonymous',
                  //scale:0.1,
                  //anchor:[0.5,1],
                  //src: 'apps/site_internet/customlayer/picture/arbre.svg',
                  src: 'apps/site_internet/customlayer/picture/rond_default.svg',
                }),
              })
        ];
    }
    
/*    function rondStyle() {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#407403',
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
*/
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_url,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    
    // 02/01/2023 : demande de retrait de la phrase de complément
    /*
    dataLayer.once('prerender', function() {
        console.log("COMPLEMENT ARBRES ANCIENS");
        let features = dataLayer.getSource().getFeatures();
        features.forEach(function(feature){
            feature.set("complement", "Un arbre ancien a été planté il y a plus de " + age_ancien + " ans");
        });
    });
    */
    return {
        layer: dataLayer,
    }
}());

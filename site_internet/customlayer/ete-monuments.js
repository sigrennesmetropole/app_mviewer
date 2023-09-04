
mviewer.customLayers.ete_monuments= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_organisme&outputFormat=application/json&srsname=EPSG:3857';
    let l_id_org=[5120,319,659,50,5434,245,4705, 1217,4849,4780,5084, 6804];
    let markercolor='#d9762b';
    
    function pctStyle() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: markercolor,
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: () => {// permet d'éviter les features chargées en double
                const urlData = data_url + '&CQL_FILTER=id_organisme%20IN%20%28' + l_id_org.join('%2C') + '%29';
                fetch(urlData)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features ete_monuments"); // ==> Exécuté 2x rarement !
                        // nettoie la layer
                        mviewer.getLayer("ete_monuments").layer.getSource().clear();
                        // charge les features
                        let features = dataLayer.getSource().getFormat().readFeatures(r)
                        dataLayer.getSource().addFeatures(features);   
                    })
                }
        }),
        style: pctStyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());



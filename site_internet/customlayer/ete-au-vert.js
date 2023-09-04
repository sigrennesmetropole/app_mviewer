
mviewer.customLayers.ete_au_vert= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_organisme&outputFormat=application/json&srsname=EPSG:3857';
    let l_id_org=[6798,6623,386,299,6800,6801,6802,6803];
    let markercolor='#439147';
    
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
            loader: () => { // permet d'éviter le bug de features chargées en double 
                const urlData = data_url + '&CQL_FILTER=id_organisme%20IN%20%28' + l_id_org.join('%2C') + '%29';
                fetch(urlData)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features ete_au_vert"); // ==> Exécuté 2x parfois
                        // nettoie la layer
                        mviewer.getLayer("ete_au_vert").layer.getSource().clear();
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



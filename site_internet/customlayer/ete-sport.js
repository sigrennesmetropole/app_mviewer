
mviewer.customLayers.ete_sport= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_organisme&outputFormat=application/json&srsname=EPSG:3857';
    let l_id_org=[6792,1025,4699,98,857,966,4795,4954,4798,1477,5562,914,383,6245,6795,6796, 993, 5067,4883];
    let markercolor='#62bcf5';
    
    
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
            loader: () => { // permet d'éviter les features chargées en double
                const urlData = data_url + '&CQL_FILTER=id_organisme%20IN%20%28' + l_id_org.join('%2C') + '%29';
                fetch(urlData)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features ete_sport"); // ==> Exécuté 2x rarement !
                        // nettoie la layer
                        mviewer.getLayer("ete_sport").layer.getSource().clear();
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



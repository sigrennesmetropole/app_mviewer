
mviewer.customLayers.ete_equipements= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_organisme&outputFormat=application/json&srsname=EPSG:3857';
    let l_id_org=[377,5025,357,5061,286,1429,88,1506,121,484,335,6397,5611,6786,5127, 5171, 5121, 6371, 48990, 948, 6812, 261, 4990, 6969, 93, 5163, 6972, 5070];
    let markercolor='#faca50';
    
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
console.log(urlData);
                fetch(urlData)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features ete_equipements"); // ==> Exécuté 2x rarement !
                        // nettoie la layer
                        mviewer.getLayer("ete_equipements").layer.getSource().clear();
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



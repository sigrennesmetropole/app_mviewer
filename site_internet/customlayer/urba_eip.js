mviewer.customLayers.urba_eip= (function() {
    const fillcolor='#A84C94';
    let stylesrc='apps/site_internet/customlayer/picture/EIP.svg';
    
    const nb_logements_min=10;
    let data_url="https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_organisme&outputFormat=application/json&srsName=EPSG:3857";
    let filter = "etat_organisme='actif' and (code_nomenclature_principale = '1.1.1' OR code_nomenclature_secondaire LIKE '% 1.1.1 %') AND (nom_usage like '%Direction de quartier%' OR nom_usage like '%Droits des sols%')";
    
    let complete_url = data_url + '&CQL_FILTER='+ encodeURIComponent(filter);
    
    /* - STYLE ------------------------------------- */
    function _markerstyle() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: fillcolor,
                  crossOrigin: 'anonymous',
                  anchor:[0.5,0.5],
                  src: stylesrc,
                })
              });

        return [style];
    }
    
    /* - DATA -------------------------------------- */
    
    function cleanData(){
        // suppression des programmes qui n'ont pas de descriptif
        dataLayer.getSource().forEachFeature((feature) => {
            if (!feature.get("description") || feature.get("description") == 'undefined' || feature.get("description").replace(/ [\s\r\n]+/gm, "").trim() == '' ) {
                dataLayer.getSource().removeFeature(feature);
            }
        });
    }
    
    let dataLayer = new ol.layer.Vector({
        visible: false,
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: () => { // permet d'éviter le bug de features chargées en double 
                fetch(complete_url)
                    .then(r => r.json())
                    .then(r => {
                        // nettoie la layer
                        mviewer.getLayer("urba_eip").layer.getSource().clear();
                        // charge les features
                        let features = dataLayer.getSource().getFormat().readFeatures(r)
                        dataLayer.getSource().addFeatures(features);
                    })
            }
        }),
        style: _markerstyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());



mviewer.customLayers.urbadiffus_en_projet= (function() {
    const fillcolor='#3FB3CD';
    const nb_logements_min=10;
    let data_url="https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=app:tabou_v_oa_programme&outputFormat=application/json&srsName=EPSG:3857";
    let filter = "commune='Rennes' AND nature = 'En diffus' AND diffusion_restreinte=false AND etape='En projet' AND (nb_logements >= " + nb_logements_min + " OR nb_logements IS NULL)";
    //let filter = "commune='Rennes' AND nature = 'En diffus' AND diffusion_restreinte=false AND etape='En projet' AND (nb_logements >= " + nb_logements_min + ")";
    
    let complete_url = data_url + '&CQL_FILTER='+ encodeURIComponent(filter);

    
    function cleanData(){
        // suppression des programmes qui n'ont pas de descriptif
        dataLayer.getSource().forEachFeature((feature) => {
            if (!feature.get("description") || feature.get("description") == 'undefined' || feature.get("description").replace(/ [\s\r\n]+/gm, "").trim() == '' ) {
                dataLayer.getSource().removeFeature(feature);
            } 
        });
        // mise à jour du style
        dataLayer.setStyle(
            new ol.style.Style({
                fill:new ol.style.Fill({
                   color: fillcolor,
                 }),
                stroke: new ol.style.Stroke({
                    color: '#000000',
                    width: 2
                  })
            })
        );
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
                        mviewer.getLayer("urbadiffus_en_projet").layer.getSource().clear();
                        // charge les features
                        let features = dataLayer.getSource().getFormat().readFeatures(r)
                        dataLayer.getSource().addFeatures(features);
                    }).then(r => {cleanData();})
            }
        }),
        style: new ol.style.Style({
                fill:new ol.style.Fill({
                   color: '#ffffff00',
                 })
            }),
    });
    
    
    return {
        layer: dataLayer,
    }
}());



mviewer.customLayers.urbadiffus_en_chantier= (function() {
    const fillcolor='#cc8db2';
    const nb_logements_min=15;
    let data_url="https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=app:tabou_v_oa_programme&outputFormat=application/json&srsName=EPSG:3857";
    let filter = "commune='Rennes' AND nature = 'En diffus' AND diffusion_restreinte=false AND etape='En chantier'";
    
    let complete_url = data_url + '&CQL_FILTER='+ encodeURIComponent(filter);

    /**
    * Requete http avec header (API S&O qui nécessite une clé en header)
    **/
    function ads_data(requestUrl, principal=false) {
        return new Promise(resolve => {
            $.ajax({
                url: requestUrl,
                context: document.body,
            }).done(function (res) {
                resolve({'response': res});
            });
        });
    };
    
    /**
    * Données agglomérées programmes/ADS
    **/
    function getADSData(){
        let programmes = dataLayer.getSource().getFeatures();
        let l_ads=[];
        for (pg in programmes) {
            pg_data = programmes[pg];
            //si num_ads existe alors aller chercher les infos complémentaires des ADS + geom ==> faire cette action pour tous les cas
            // Recherche du numads dans la table v_ads_ddc (liste de num ads pour un seul appel complémentaire ?)
            if (pg_data.get('num_ads') != undefined && pg_data.get('num_ads').trim() != ''){
                l_ads.push(pg_data.get('num_ads'));
            } 
        }
        //on récupère les données ADS
        let filter_ads = "nature_op='Construction' AND num_ads IN ('" + l_ads.join("','") + "')";
        ads_data('https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=app:tabou_v_ads_ddc&outputFormat=application/json&srsName=EPSG:3857' + '&CQL_FILTER='+ encodeURIComponent(filter_ads)).then(function(result_ads){
             let grp_features = [];
             for (feat in result_ads.response.features){
                 grp_features[result_ads.response.features[feat].properties.num_ads] = [];
                 // verifier le nombre de logements 
                 if (result_ads.response.features[feat].properties.nb_logements > nb_logements_min){
                     // besoin de garder shape + nb_logements + nb_niveau_max + aire_geo
                     grp_features[result_ads.response.features[feat].properties.num_ads].push(result_ads.response.features[feat]);
                 } 
             }
             for (ads in grp_features){
                 console.log(grp_features[ads]);
                 if (grp_features[ads].length > 1){
                    // si plusieurs entrées, fusionner le shape
                    let nb_niv=0;
                    let aire_totale=0;
                    let nb_log = 0;
                    let geom = new ol.geom.MultiPolygon();
                    for (feat in grp_features[ads]) {
                        if (nb_niv < grp_features[ads][feat].properties.nb_niv){ nb_niv=grp_features[ads][feat].properties.nb_niv;}
                        if (nb_log < grp_features[ads][feat].properties.nb_logements){ nb_log=grp_features[ads][feat].properties.nb_logements;}
                        aire_totale += grp_features[ads][feat].properties.aire_geo;
                        geom.union(new ol.geom.MultiPolygon(grp_features[ads][feat].geometry.coordinates));
                    }
                    grp_features[ads][0].properties.nb_logements = nb_log;
                    grp_features[ads][0].properties.nb_niv = nb_niv;
                    grp_features[ads][0].properties.aire_geo = aire_totale;
                    grp_features[ads][0].geom = geom;
                 } else {
                     grp_features[ads][0].geom = new ol.geom.MultiPolygon(grp_features[ads][0].geometry.coordinates);
                 }
                 //MAJ Layer feature
                 let ft_data = grp_features[ads][0];
                 updateFeatureData(ft_data.properties.num_ads, ft_data.properties.nb_logements, ft_data.properties.nb_niv, ft_data.properties.aire_geo, ft_data.geom);
             }
             cleanData();
             dataLayer.getSource().changed();
        });
    }
    
    function updateFeatureData(numads, nb_log, niveau, aire_geo, shape){
        let programmes = dataLayer.getSource().getFeatures();
        dataLayer.getSource().forEachFeature((feature) => {
            if (feature.get('num_ads') == numads) {
                feature.set('nb_logements', nb_log);
                feature.set('niveau', niveau);
                feature.set('aire_geo', aire_geo);
                feature.setGeometry(shape);
            }
        });
    }
    
    function deleteFeature(numads){
        dataLayer.getSource().forEachFeature((feature) => {
            if (feature.get("num_ads")==numads){
                dataLayer.getSource().removeFeature(feature);
            }
        });
    }
    
    function cleanData(){
        dataLayer.getSource().forEachFeature((feature) => {
            if (feature.get("nb_logements")< nb_logements_min){
                dataLayer.getSource().removeFeature(feature);
            }
        });
    }
    

    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: complete_url,
            format: new ol.format.GeoJSON()
        }),
        style: new ol.style.Style({
                fill:new ol.style.Fill({
                   color: fillcolor,
                 }),
                stroke: new ol.style.Stroke({
                    color: '#000000',
                    width: 2
                  })
            })
    });
    

    dataLayer.getSource().once('change',() =>{
        getADSData();
    });
    
    return {
        layer: dataLayer,
    }
}());




mviewer.customLayers.bureauvote= (function() {
    let bureau_perim_url="https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_educ:v_election_perim_bureau&outputFormat=application/json&srsName=EPSG:3857";
    
    var centres_data = new Map();
    
    getHttpData("https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_educ:v_election_centre&CQL_FILTER=code_insee=35238&outputFormat=application/json");
    
    function getHttpData(request){
        return new Promise(resolve => {
            $.ajax({
                url: request,
                context: document.body,
            }).done(function (res) {
                for (idx in res.features){
                    let feat = res.features[idx];
                    centres_data[feat.properties.centre_id] = feat.properties;
                }
                resolve({'response': res, 'category': 'geoserver'});
            });
        });
    }
    
    /**
    * Données du centre de vote
    **/
    function setCentreDataInBureau(){
        let bureaux = dataLayer.getSource().getFeatures();
        for (idx in bureaux) {
            let centre_id=bureaux[idx].get('num_centre');
            bureaux[idx].set('loc_bat', centres_data[centre_id].loc_bat);
            bureaux[idx].set('loc_voie', centres_data[centre_id].loc_voie);
            bureaux[idx].set('loc_adr', centres_data[centre_id].loc_adr);
            bureaux[idx].set('loc_salle', centres_data[centre_id].loc_salle);
            bureaux[idx].set('burx_liste', centres_data[centre_id].burx_liste);
            
        }
    }
    
    function markerStyle(feature) {
        let label = 'Bureau de vote N°' + feature.get('num_bureau');
        let fontFamily = "Arial, Verdana, Courier New";
        //console.log(label);
        
        let style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#aa0c8b', 
                  lineDash: [4,8],
                  lineDashOffset: 8,
                  width: 2,
                }),
                fill: new ol.style.Fill({
                  color: '#aa0c8b05'
                }),
                text: new ol.style.Text({
                    text: label,
                    fill : new ol.style.Fill({
                        color: '#aa0c8b',
                    }),
                    font: 'bold 14px ' + fontFamily, 
                }),
              });
        return [style];
    }
    
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            //url: bureau_perim_url,
            format: new ol.format.GeoJSON(),
            
            loader: () => { // permet d'éviter les features chargées en double
                const urlData = bureau_perim_url;
                fetch(urlData)
                    .then(r => r.json())
                    .then(r => {
                        // nettoie la layer
                        dataLayer.getSource().clear();
                        // charge les features
                        let features = dataLayer.getSource().getFormat().readFeatures(r)
                        //setCentreDataInBureau();
                        dataLayer.getSource().addFeatures(features)
                    }).then(r => {
                        setCentreDataInBureau();
                    })
                    
                }
            
        }),
        style: markerStyle,
    });
    
    /*dataLayer.getSource().once('change',() =>{
        console.log("JE PASSE ICI");
        setCentreDataInBureau();
        console.log("JE PASSE PAR LA");
    });
    */
    
    
    return {
        layer: dataLayer,
    }
}());



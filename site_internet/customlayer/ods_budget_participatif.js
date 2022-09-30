
mviewer.customLayers.budget_part= (function() {
    //let data_url='https://data.rennesmetropole.fr/api/records/1.0/search?dataset=localisation-et-etat-des-projets-du-budget-participatif&outputFormat=json&refine.Réalisé=réalisé';
    let data_url='https://data.rennesmetropole.fr/api/records/1.0/search?dataset=localisation-et-etat-des-projets-du-budget-participatif&rows=5000&outputFormat=json&refine.projet_remarquable=oui';
    
    
    
    var apiKey = '';
    
    $.getJSON("apps/public/addons/env.json", function(json) {
        apiKey = json.opendatasoftKey;
    });
    
    function getFeaturesData(){
        let xhr = new XMLHttpRequest();
        xhr.open('GET', data_url);
        
        xhr.setRequestHeader ("Authorization", "Apikey " + apiKey);
        xhr.onload = function() {
            if (xhr.status === 200 && xhr.responseText) {
                var response = xhr.responseText.length ? JSON.parse(xhr.responseText).records : null;
                for (index in response){
                    if(response[index].geometry){
                        var values=response[index].fields;
                        values.geometry = new ol.geom.Point(proj4('EPSG:4326', 'EPSG:3857',response[index].geometry.coordinates));

                        values.id = response[index].recordid;
                        _layer.getSource().addFeature(new ol.Feature(values));
                    }
                }
            } else {
                console.log('fail request');
            }
        };
        xhr.send();
    }
    
    function waitForAPIKey(){
        if(apiKey !== ""){
            getFeaturesData();
        }
        else{
            setTimeout(waitForAPIKey, 100);
        }
    }
    waitForAPIKey();
    
    
    function markerStyle(feature) {
        let etat = feature.get('realise');
        
        if (etat == "Réalisé") {
            return featureMarker('#33919d');
        } else if (etat == "En travaux") {
            return featureMarker('#f9a241');
        } else {
            return featureMarker('#e45e52');
        } 
    }
    
    function featureMarker(couleur) {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: couleur, 
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              })
        ];
    }
    
    
    let _layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            //url: data_url,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    
    
    return {
        layer: _layer,
    }
}());



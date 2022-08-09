
mviewer.customLayers.observatoire_anfr= (function() {
    //var antennes_data_url = 'https://data.anfr.fr/api/records/2.0/search/resource_id=dd11fac6-4531-4a27-9c8c-a3a9e4ec2107&filters=%7B%22code_insee%22%3A%2235238%22%7D&limit=10000';
    var antennes_data_url='https://data.anfr.fr/api/records/1.0/search/dataset=dd11fac6-4531-4a27-9c8c-a3a9e4ec2107&q=%22code_insee%22%3A%2235238%22';
    
    var mesures_data_url = 'https://data.anfr.fr/api/records/2.0/search/resource_id=bba1ee58-333f-4bde-84c3-0ab14145acc3&filters=%7B%22code_insee%22%3A%2235238%22%7D&limit=10000';
    
    
    
    function getFeaturesData(){
        let xhr = new XMLHttpRequest();
            xhr.open('GET', antennes_data_url);
            xhr.onload = function() {
                if (xhr.status === 200 && xhr.responseText) {
                    var response = xhr.responseText.length ? JSON.parse(xhr.responseText) : null;
      console.log("RESULTATS : " + response);
                    allfeatures = response.records;
                    for (index in allfeatures){
                        let longlat_ = allfeatures[index].fields.coordonnees.split(",").reverse();
                        let coord = proj4('EPSG:4326', 'EPSG:3857', longlat_);
                        anfrLayer.getSource().addFeature(new ol.Feature({
                                geometry: new ol.geom.Point(coord),
                                id: allfeatures[index].fields.id,
                                operateur: allfeatures[index].fields.adm_lb_nom,
                                antenne : allfeatures[index].fields.emr_lblsysteme,
                                adresse: allfeatures[index].fields.adr_lb_add1,
                                generation: allfeatures[index].fields.generation,
                                statut: allfeatures[index].fields.statut
                                })
                            );
                    }
                } else {
                    console.log('fail request');
                }
            };
            xhr.send();
        
    }
    
    function supportRondStyle() {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: 'rgb(251, 197, 136, 1)',
                }),
                stroke: new ol.style.Stroke({
                    color: '#f78b12',
                    width: 0.2
                })
            })
        });
        return [style];
    }
    
    let anfrLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            //url: formatData,
            format: new ol.format.GeoJSON(),
            //crossOrigin: 'anonymous',
        }),
        style: supportRondStyle,
    });
    
    getFeaturesData();
    
    return {
        layer: anfrLayer,
    }
}());



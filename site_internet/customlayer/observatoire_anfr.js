
mviewer.customLayers.observatoire_anfr= (function() {
    var antennes_data_url = 'https://data.anfr.fr/api/records/2.0/search/resource_id=1a279a02-cabf-466e-b2a7-9b52af187f59&filters=%7B%22code_insee%22%3A%2235238%22%7D&limit=10000';
    
    var mesures_data_url = 'https://data.anfr.fr/api/records/2.0/search/resource_id=bba1ee58-333f-4bde-84c3-0ab14145acc3&filters=%7B%22code_insee%22%3A%2235238%22%7D&limit=10000';
    
    
    
    function getFeaturesData(){
        let xhr = new XMLHttpRequest();
            xhr.open('GET', antennes_data_url);
            xhr.onload = function() {
                if (xhr.status === 200 && xhr.responseText) {
                    var response = xhr.responseText.length ? JSON.parse(xhr.responseText) : null;                    
                    allfeatures = response.result.records;
                    for (index in allfeatures){
                        let longlat_ = allfeatures[index].coordonnees.split(",").reverse();
                        let coord = proj4('EPSG:4326', 'EPSG:3857', longlat_);
                        anfrLayer.getSource().addFeature(new ol.Feature({
                                geometry: new ol.geom.Point(coord),
                                id: allfeatures[index].id,
                                operateur: allfeatures[index].adm_lb_nom,
                                antenne : allfeatures[index].emr_lblsysteme,
                                adresse: allfeatures[index].adr_lb_add1,
                                generation: allfeatures[index].generation,
                                statut: allfeatures[index].statut
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



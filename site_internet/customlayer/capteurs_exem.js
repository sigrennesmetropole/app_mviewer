
mviewer.customLayers.capteurs_exem= (function() {
    var capteurs_data_url = 'https://external-api.exem.fr/sites?api_key=AIzaSyC80aUKhGfG9x10GWK7rm3ICyDyf1BdJKA';

    
    
    function getFeaturesData(){
        let xhr = new XMLHttpRequest();
            xhr.open('GET', capteurs_data_url);
            xhr.onload = function() {
                if (xhr.status === 200 && xhr.responseText) {
                    var response = xhr.responseText.length ? JSON.parse(xhr.responseText) : null;
                    for (index in response){
                        let longlat_ = response[index].geolocation.reverse();
                        let coord = proj4('EPSG:4326', 'EPSG:3857', longlat_);
                        exemLayer.getSource().addFeature(new ol.Feature({
                                geometry: new ol.geom.Point(coord),
                                id: response[index].id,
                                nom: response[index].name,
                                derniere_val : response[index].latest_value,
                                date_val: response[index].latest_communication,
                                statut: response[index].status
                                })
                            );
                    }
                } else {
                    console.log('fail request');
                }
            };
            xhr.send();
        
    }
    
    function capteurRondStyle() {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#8B4513',
                }),
                stroke: new ol.style.Stroke({
                    color: '#708090',
                    width: 0.2
                })
            })
        });
        return [style];
    }
    
    let exemLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            //url: formatData,
            format: new ol.format.GeoJSON(),
            //crossOrigin: 'anonymous',
        }),
        style: capteurRondStyle,
    });
    
    getFeaturesData();
    
    return {
        layer: exemLayer,
    }
}());



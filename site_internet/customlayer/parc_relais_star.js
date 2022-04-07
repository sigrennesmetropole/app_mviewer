
mviewer.customLayers.parcs_relais= (function() {
    var data_url = 'https://data.explore.star.fr/api/v2/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=100&offset=0&timezone=UTC'; 

    
    
    function getFeaturesData(){
        let xhr = new XMLHttpRequest();
            xhr.open('GET', data_url);
            //xhr.setRequestHeader ("accept", "application/json");
            xhr.onload = function() {
                if (xhr.status === 200 && xhr.responseText) {
                    var response = xhr.responseText.length ? JSON.parse(xhr.responseText).records : null;
                    console.log(response);
                    for (index in response){
                        var values=response[index].record.fields;
                        console.log(values.coordonnees);
                        
                        //let longlat_ = response[index].geolocation.reverse();
                        longlat_= [values.coordonnees.lon, values.coordonnees.lat];
                        let coord = proj4('EPSG:4326', 'EPSG:3857', longlat_);
                        _layer.getSource().addFeature(new ol.Feature({
                                geometry: new ol.geom.Point(coord),
                                id: values.idparc,
                                nom: values.nom,
                                etat : values.etatouverture,
                                remplissage: values.etatremplissage,
                                dispsoliste: values.jrdinfosoliste,
                                disppmr: values.jrdinfopmr,
                                dispelec: values.jrdinfoselectrique,
                                dispcovoit: values.jrdinfocovoiturage,
                                capacitesoliste: values.capacitesoliste,
                                capacitepmr: values.capacitepmr,
                                capaciteelec: values.capaciteve,
                                capacitecovoit: values.capacitecovoiturage,
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
                image: new ol.style.Icon({
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/parc-relais.svg',
                }),
              });
        return [style];
    }
    
    let _layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            //url: formatData,
            format: new ol.format.GeoJSON(),
            //crossOrigin: 'anonymous',
        }),
        style: capteurRondStyle,
    });
    
    getFeaturesData();
    
    return {
        layer: _layer,
    }
}());



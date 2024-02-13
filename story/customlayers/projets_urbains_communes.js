mviewer.customLayers.projurbains_communes = (function() {
    let data_communes = 'https://public.sig.rennesmetropole.fr/geoserver/ows?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typeName=v_sitorg_organisme&CQL_FILTER=code_insee%20%3C%3E%20%2735238%27%20AND%20code_nomenclature_principale%20%3D%20%271.1.4%27&outputFormat=application%2Fjson&srsname=EPSG:3857';

    function communeStyle() {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#f9a241', 
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                })
            })
        ];
    }
    
    function communeRondStyle() {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({
                    color: 'rgb(251, 197, 136, 1)',
                }),
                stroke: new ol.style.Stroke({
                    color: '#f78b12',
                    width: 0.5
                })
            })
        });
        return [style];
    }

    
    let communeLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_communes,
            format: new ol.format.GeoJSON()
        }),
        style: communeRondStyle,
    });
    
        
    return {
        layer: communeLayer,
    }
}());
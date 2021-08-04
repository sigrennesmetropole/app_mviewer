
mviewer.customLayers.observatoire_anfr= (function() {
    let data_url = 'https://data.anfr.fr/api/records/2.0/search/resource_id=1a279a02-cabf-466e-b2a7-9b52af187f59&filters=%7B%22code_insee%22%3A%2235238%22%7D&fields=%22id%22%2C%22adm_lb_nom%22%2C%22emr_lb_systeme%22%2C%22emr_dt%22%2C%22generation%22%2C%22date_maj%22%2C%22adr_lb_add1%22%2C%22coordonnees%22%2C%22statut%22';
    
    function supportRondStyle() {
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
    
    let anfrLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_url,
            format: new ol.format.GeoJSON(),
            //crossOrigin: 'anonymous',
        }),
        style: supportRondStyle,
    });
    
    return {
        layer: anfrLayer,
    }
}());



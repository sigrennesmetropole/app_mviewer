
mviewer.customLayers.balades_points= (function() {
    
    var data_poi = 'apps/balades/customlayer/data/points_3857.geojson';
    
    
    function baladeStyle_pct() {
    // style d'une couche ponctuelle
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#ba8e02',  
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    
    let POILayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_poi,
            format: new ol.format.GeoJSON(),
        }),
        style: baladeStyle_pct,
    });
    
    
    return {
        layer: POILayer,
    }
}());



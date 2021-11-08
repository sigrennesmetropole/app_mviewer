
mviewer.customLayers.vergers= (function() {
    
    var data = 'apps/site_internet/customlayer/data/vergers_existants.geojson';
    
    function vergerStyle_surf() {
        let style = new ol.style.Style({
                fill: new ol.style.Fill({
                  color: '#d485c5', 
                }),
              });
        return [style];
    }
    
    function vergerStyle_pct() {
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
    
    let vergerslayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data,
            format: new ol.format.GeoJSON(),
        }),
        style: vergerStyle_pct,
    });
    
    return {
        layer: vergerslayer,
    }
}());



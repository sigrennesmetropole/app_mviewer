
mviewer.customLayers.lieuxfrais= (function() {
    
    var data = 'apps/site_internet/customlayer/data/lieux_frais.geojson';
    
    function lieux_frais_Style_pct() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#0255BA',
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    let lieuxfraislayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data,
            format: new ol.format.GeoJSON(),
        }),
        style: lieux_frais_Style_pct,
    });
    
    return {
        layer: lieuxfraislayer,
    }
}());



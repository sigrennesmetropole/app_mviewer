
mviewer.customLayers.vergers= (function() {
    
    var data = 'apps/site_internet/customlayer/data/vergers_existants.geojson';
    
    function vergerStyle() {
        let style = new ol.style.Style({
                fill: new ol.style.Fill({
                  color: '#d485c5', 
                }),
              });
        return [style];
    }
    
    let vergerslayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data,
            format: new ol.format.GeoJSON(),
        }),
        style: vergerStyle,
    });
    
    return {
        layer: vergerslayer,
    }
}());



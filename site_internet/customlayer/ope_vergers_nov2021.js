
mviewer.customLayers.ope_vergers_nov21= (function() {
    
    var ope_nov2021 = 'apps/site_internet/customlayer/data/ope_vergers_novembre2021.geojson';
    
    function getcolor(feature) {
        let type = feature.get('type');
        
        var color = '#f78b12'; 
        if (type == 'Exposition'){
            color = '#e04a3c';
        } else if (type == 'Verger') {
            color = '#818355'; //8FBC8F
        }
        return color;
    }
    function ope21Style(feature) {
        let _color = getcolor(feature);
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: _color, 
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    let ope21layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: ope_nov2021,
            format: new ol.format.GeoJSON(),
        }),
        style: ope21Style,
    });
    
    return {
        layer: ope21layer,
    }
}());



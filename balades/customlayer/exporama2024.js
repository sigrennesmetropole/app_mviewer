
mviewer.customLayers.lieux = (function() {
    
    var data = 'apps/balades/customlayer/data/exporama/exporama_2024.geojson';
    var couleur = '#FF0000';

    
    function style_pct() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: couleur,
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    let _layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: () => { // permet d'éviter le bug de features chargées en double 
                fetch(data)
                    .then(r => r.json())
                    .then(r => {
                        // nettoie la layer
                        _layer.getSource().clear();
                        // charge les features
                        let features = _layer.getSource().getFormat().readFeatures(r);
                        _layer.getSource().addFeatures(features);
                    })
                }
        }),
        style: style_pct,
    });
    
    const _legend = {
        items: [{
            label: "Les lieux",
            geometry: "Point",
            styles: style_pct
          }]
        };
    
    return {
        layer: _layer,
        legend: _legend,
    }
}());



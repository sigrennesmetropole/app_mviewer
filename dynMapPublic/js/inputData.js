var layer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: '{}',
        format: new ol.format.GeoJSON({
            extractStyles: false
        })
    }),
});
new CustomLayer('pinDynMap', layer);

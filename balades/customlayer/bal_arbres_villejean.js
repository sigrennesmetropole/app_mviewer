
mviewer.customLayers.balades= (function() {
    
    var data_bal = 'apps/balades/customlayer/data/arbres_villejean/balade_arbres_villejean.geojson';
    
    
    function baladeStyle_lin() {
    // style d'une couche linéaire
        let style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                        color: "#E740D5",
                        lineCap: "butt",
                        width: 7,
                        }),
              });
        return [style];
    }
    
    let baladeslayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_bal,
            format: new ol.format.GeoJSON(),
        }),
        style: baladeStyle_lin,
    });
    
    
    
    return {
        layer: baladeslayer,
    }
}());



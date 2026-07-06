mviewer.customLayers.lieuxfrais = (function () {

    var data = 'apps/site_internet/customlayer/data/lieux_frais.geojson';

    function lieux_frais_Style_pct(feature) {

    var lieuxFrais = feature.get("Lieux frais");
    var climatise = feature.get("Climatisé");
    var accesLibre = feature.get("Accès libre");

    // On n'affiche que les lieux en accès libre
    if (accesLibre !== "Oui") {
       return null;
    }
        
    
    var color;
    var zIndex;

   
    if (lieuxFrais === "Oui") {
        color = "#1BE5FC";
        zIndex = 10;
    }
    else if (lieuxFrais === "Partiellement") {
        color = "#9261EB";
        zIndex = 10;
    }
    else {
        return null;
    }
        

    return new ol.style.Style({
        zIndex: zIndex,
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: color
            }),
            stroke: new ol.style.Stroke({
                color: "#333333",
                width: 1.5
            })
        })
    });
}

    var lieuxfraislayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data,
            format: new ol.format.GeoJSON()
        }),
        style: lieux_frais_Style_pct
    });

    return {
        layer: lieuxfraislayer
    };

}());
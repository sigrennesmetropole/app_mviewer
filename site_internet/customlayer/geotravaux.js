const layer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=trp_rout:v_geotravaux_evenement_01j&outputFormat=application/json&srsName=EPSG:4326',
        format: new ol.format.GeoJSON()
    }),
    style: function(feature, resolution) {
        var date_deb_split = feature.get('date_deb').split('T')[0].split('-');
        var date_fin_split = feature.get('date_fin').split('T')[0].split('-');
        var date_deb_french = date_deb_split[2] + '/' + date_deb_split[1] + '/' + date_deb_split[0];
        var date_fin_french = date_fin_split[2] + '/' + date_fin_split[1] + '/' + date_fin_split[0];
        feature.set('date_deb_french', date_deb_french);
        feature.set('date_fin_french', date_fin_french);
        var fillcolor;
        var zIndex;
        if(feature.get('niv_perturbation') === 'Secteur à éviter') {
            fillcolor = '#ff0000';
            zIndex = 400;
        } else if(feature.get('niv_perturbation') === "Circulation difficile") {
            fillcolor = '#ffff00';
            zIndex = 300;
        } else if(feature.get('niv_perturbation') === "Impact limité") {
            fillcolor = '#09ff01';
            zIndex = 200;
        } else if(feature.get('niv_perturbation') === "Travaux de nuit") {
            fillcolor = '#6565fe';
            zIndex = 100;
        }
        if (fillcolor) {
            if (resolution < 7){
                return [
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                        color: "#000",
                        lineCap: "butt",
                        width: 7
                        })
                    }),
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                          color: fillcolor,
                          lineCap: "butt",
                          width: 5,
                          lineDash: [10,4],
                        }),
                        zIndex: parseInt(zIndex)
                    })
                ];
            }else {
                return [
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                          color: fillcolor,
                          lineCap: "butt",
                          width: 3,
                        }),
                        zIndex: parseInt(zIndex)
                    })
                ];
            }
        }
    }
});


new CustomLayer('geotravaux_evenement_1j', layer);

mviewer.customLayers.lieuxfrais = (function () {

    var data = 'apps/site_internet/customlayer/data/lieux_frais.geojson';

    function lieux_frais_Style_pct(feature) {

        const lieuxFrais = feature.get("Lieux frais");
        const climatise = feature.get("Climatisé");

        // N'afficher que Oui ou Partiellement
        if (lieuxFrais !== "Oui" && lieuxFrais !== "Partiellement") {
            return null;
        }

        // Couleur du marqueur
        let color = "#8AE5FC"; // Bleu

        if (lieuxFrais === "Partiellement") {
            color = "#B185EB"; // Violet
        }

        let styles = [];

        // Contour bleu foncé si Climatisé = Oui
        if (climatise === "Oui") {
            styles.push(
                new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'apps/site_internet/customlayer/picture/rond_default.svg',
                        color: '#003B8E',
                        scale: 2,
                        anchor: [0.5, 1],
                        crossOrigin: 'anonymous'
                    })
                })
            );
        }

        // Marqueur principal
        styles.push(
            new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'apps/site_internet/customlayer/picture/rond_default.svg',
                    color: color,
                    scale: 1.5,
                    anchor: [0.5, 1],
                    crossOrigin: 'anonymous'
                })
            })
        );

        return styles;
    }

    let lieuxfraislayer = new ol.layer.Vector({
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
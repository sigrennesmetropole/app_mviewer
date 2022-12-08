// Gestion du fichier GeoJSON fourni par l'utilisateur 
document.getElementById('geojson').addEventListener('change', () => {
    const [file] = document.querySelector('#geojson').files;
    const reader = new FileReader();
    if (file) {
        reader.readAsText(file);
    }

    reader.addEventListener("load", () => {
        if (file.name.split('.').at(-1) == 'geojson') {
            var [objetConvertPoints, objetConvertLignes] = conversionJSON(reader.result);
            console.log(objetConvertPoints, objetConvertLignes);

            // Affichage du formulaire et de la carte
            const elements = document.querySelectorAll(".boutonEnvoyer, .Panneauconfiguration, #map");
            for (let element of elements) {
                if (element.classList.contains("hidden"))
                    element.classList.remove("hidden");
            }
            document.getElementById('message').innerHTML = "";
            document.querySelector(".filename").innerText = file.name;
            map.updateSize();

            // Mise en place des valeurs dans le formulaire
            map.getView().setZoom(document.getElementById('zoomDefaut').value);

            // Affichage des balades
            var vectorLayerPoints = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            var vectorLayerBalades = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            const layers = map.getLayers().getArray().slice(1)
            layers.forEach((layer) => map.removeLayer(layer))
            objetConvertPoints.features.forEach(feature => {
                var point = new ol.Feature({
                    geometry: new ol.geom.Point(feature.geometry.coordinates),
                    values: feature.properties
                });
                var pointStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1],
                        src: "librairies/pin.svg",
                        color: "black"
                    })
                });
                point.setStyle(pointStyle);
                vectorLayerPoints.getSource().addFeature(point);
            });
            objetConvertLignes.features.forEach(feature => {
                var line = new ol.Feature({
                    geometry: new ol.geom.LineString(feature.geometry.coordinates),
                    values: feature.properties
                });
                var lineStyle = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 3,
                        color: feature.properties.couleur
                    })
                });

                line.setStyle(lineStyle);
                vectorLayerBalades.getSource().addFeature(line);
            });
            map.addLayer(vectorLayerPoints);
            map.addLayer(vectorLayerBalades)

            // Attribut ID de chaque balade
            const SelectAttributIdBalade = document.querySelector('#attributIdBalade');
            while (SelectAttributIdBalade.firstChild) {
                SelectAttributIdBalade.removeChild(SelectAttributIdBalade.firstChild);
            }
            var optionSelectionnerListe = document.createElement("option");
            optionSelectionnerListe.value = "";
            optionSelectionnerListe.innerText = "Sélectionner dans la liste..";
            SelectAttributIdBalade.appendChild(optionSelectionnerListe);
            Object.keys(objetConvertLignes.features[0].properties).forEach(attribut => {
                const option = document.createElement("option");
                option.value = attribut;
                option.innerText = attribut;
                SelectAttributIdBalade.appendChild(option);
            });

            // Attribut ID de chaque point
            const SelectAttributIdPoint = document.querySelector('#attributIdPoint');
            while (SelectAttributIdPoint.firstChild) {
                SelectAttributIdPoint.removeChild(SelectAttributIdPoint.firstChild);
            }
            var optionSelectionnerListe = document.createElement("option");
            optionSelectionnerListe.value = "";
            optionSelectionnerListe.innerText = "Sélectionner dans la liste..";
            SelectAttributIdPoint.appendChild(optionSelectionnerListe);
            Object.keys(objetConvertPoints.features[0].properties).forEach(attribut => {
                const option = document.createElement("option");
                option.value = attribut;
                option.innerText = attribut;
                SelectAttributIdPoint.appendChild(option);
            });

            // Attribut Rang de chaque point
            const SelectAttributRangPoint = document.querySelector('#attributRang');
            while (SelectAttributRangPoint.firstChild) {
                SelectAttributRangPoint.removeChild(SelectAttributRangPoint.firstChild);
            }
            var optionSelectionnerListe = document.createElement("option");
            optionSelectionnerListe.value = "";
            optionSelectionnerListe.innerText = "Sélectionner dans la liste..";
            SelectAttributRangPoint.appendChild(optionSelectionnerListe);
            Object.keys(objetConvertPoints.features[0].properties).forEach(attribut => {
                const option = document.createElement("option");
                option.value = attribut;
                option.innerText = attribut;
                SelectAttributRangPoint.appendChild(option);
            });

            // Attribut de balade par défaut sélectionnée
            const SelectAttributBaladeDefaut = document.querySelector('#baladeDefautSelectionnes');
            while (SelectAttributBaladeDefaut.firstChild) {
                SelectAttributBaladeDefaut.removeChild(SelectAttributBaladeDefaut.firstChild);
            }
            var optionParametreOptionnel = document.createElement("option");
            optionParametreOptionnel.value = "";
            optionParametreOptionnel.innerText = "Paramètre optionnel..";
            SelectAttributBaladeDefaut.appendChild(optionParametreOptionnel);

        } else {
            document.getElementById('message').innerHTML = "Le fichier n'est pas sous le bon format GeoJSON.";
        }
    }, false);
});

function conversionJSON(objetTexte) {
    const objetJSON = JSON.parse(objetTexte);
    var objetConvertPoints = {
        "type": "FeatureCollection",
        "name": "points",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } },
        "features": []
    };
    var objetConvertLignes = {
        "type": "FeatureCollection",
        "name": "balades",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } },
        "features": []
    };

    objetJSON.features.forEach(feature => {
        if (feature.geometry.type == "Point") {
            feature.geometry.coordinates = convertCoordinates4326to3857(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
            feature.properties.id = parseInt(feature.properties.id);
            feature.properties.rang = parseInt(feature.properties.rang);
            feature.properties.idbalade = parseInt(feature.properties.idbalade);
            objetConvertPoints.features.push(feature);
        } else if (feature.geometry.type == "LineString") {
            feature.geometry.coordinates = feature.geometry.coordinates.map(coordinate => convertCoordinates4326to3857(coordinate[0], coordinate[1]));
            feature.properties.id = parseInt(feature.properties.id);
            objetConvertLignes.features.push(feature);
        }

    });
    // console.log(objetConvertPoints);
    // console.log(objetConvertLignes);

    // var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objetConvertPoints));
    // var dlAnchorElem = document.getElementById('downloadAnchorElem');
    // dlAnchorElem.setAttribute("href", dataStr);
    // dlAnchorElem.setAttribute("download", "points_test.json");
    // dlAnchorElem.click();
    // var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objetConvertLignes));
    // var dlAnchorElem = document.getElementById('downloadAnchorElem');
    // dlAnchorElem.setAttribute("href", dataStr);
    // dlAnchorElem.setAttribute("download", "balades_test.geojson");
    // dlAnchorElem.click();
    return [objetConvertPoints, objetConvertLignes];
}

function convertCoordinates4326to3857(lon, lat) {
    var x = (lon * 20037508.34) / 180;
    var y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
    y = (y * 20037508.34) / 180;
    return [x, y];
}

// Initialisation de la carte
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-1.67, 48.11]),
        zoom: 12
    })
});

// Gestion du zoom par défaut de la carte
document.getElementById('zoomDefaut').addEventListener('change', (e) => {
    map.getView().setZoom(e.target.value);
});

map.on('moveend', function (e) {
    var newZoom = map.getView().getZoom();
    document.getElementById('zoomDefaut').value = Math.round(newZoom * 100) / 100;
});

// Gestion de l'attribut ID de chaque point (ajustement de la couleur des pins)
document.querySelectorAll("#attributIdPoint, #attributIdBalade").forEach(element => {
    element.addEventListener('change', (e) => {
        // changer la couleur des pins en fonction de la balade 
        const vectorLayerPoints = map.getLayers().getArray()[1];
        try {
            vectorLayerPoints.getSource().forEachFeature(feature => {
                // récuperer l'entité lineaire correspondante à la balade
                var idBalade = feature.get("values")[document.querySelector("#attributIdPoint").value];
                var idNameBalade = document.querySelector("#attributIdBalade").value;
                var couleurBalade = map.getLayers().getArray()[2].getSource().getFeatures().find(feature => feature.get("values")[idNameBalade] == idBalade).get("values").couleur;
                const pointStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1],
                        src: "librairies/pin.svg",
                        color: couleurBalade
                    })
                });
                feature.setStyle(pointStyle);
            });
        } catch (error) {
            vectorLayerPoints.getSource().forEachFeature(feature => {
                // récuperer l'entité lineaire correspondante à la balade
                const pointStyle = new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 1],
                        src: "librairies/pin.svg",
                        color: "black"
                    })
                });
                feature.setStyle(pointStyle);
            });
        }
    })
});

// Gestion de la balade par défaut sélectionnée
document.querySelector("#attributIdBalade").addEventListener('change', (e) => {
    const SelectAttributBaladeDefaut = document.querySelector('#baladeDefautSelectionnes');
    while (SelectAttributBaladeDefaut.firstChild) {
        SelectAttributBaladeDefaut.removeChild(SelectAttributBaladeDefaut.firstChild);
    }
    var optionParametreOptionnel = document.createElement("option");
    optionParametreOptionnel.value = "";
    optionParametreOptionnel.innerText = "Paramètre optionnel..";
    SelectAttributBaladeDefaut.appendChild(optionParametreOptionnel);
    map.getLayers().getArray()[2].getSource().forEachFeature(feature => {
        var idBalade = feature.get("values")[document.querySelector("#attributIdBalade").value];
        const option = document.createElement("option");
        option.value = idBalade;
        option.innerText = idBalade;
        SelectAttributBaladeDefaut.appendChild(option);
    });
});
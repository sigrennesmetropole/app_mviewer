// Gestion du fichier GeoJSON fourni par l'utilisateur 
var objetConvertPoints;
var objetConvertLignes;
var lastCenter;
var lastZoom;
var animationEnCours = false;
document.getElementById('geojson').addEventListener('change', () => {
    const [file] = document.querySelector('#geojson').files;
    const reader = new FileReader();
    if (file) {
        reader.readAsText(file);
    }

    reader.addEventListener("load", () => {
        document.querySelector(".filename").innerText = file.name;
        if (file.name.split('.').at(-1) == 'geojson') {
            try {
                [objetConvertPoints, objetConvertLignes] = conversionJSON(reader.result);
                //console.log(objetConvertPoints, objetConvertLignes);
                lastZoom = map.getView().getZoom();
                lastCenter = map.getView().getCenter();

                // Affichage du formulaire et de la carte
                const elements = document.querySelectorAll(".boutonEnvoyer, .Panneauconfiguration, .messageCarte, #map");
                for (let element of elements) {
                    if (element.classList.contains("hidden"))
                        element.classList.remove("hidden");
                }
                document.getElementById('message').innerHTML = "";
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
                document.getElementById('message').style.display = 'none';
            } catch (e) {
                document.getElementById('message').style.display = 'block';
                document.getElementById('message').innerHTML = "Les données du fichier ne sont pas valides.";
                const elements = document.querySelectorAll(".boutonEnvoyer, .Panneauconfiguration, .messageCarte, #map");
                for (let element of elements) {
                    element.classList.add("hidden");
                }
            }
        } else {
            document.getElementById('message').style.display = 'block';
            document.getElementById('message').innerHTML = "Le fichier n'est pas sous le bon format GeoJSON.";
            const elements = document.querySelectorAll(".boutonEnvoyer, .Panneauconfiguration, .messageCarte, #map");
            for (let element of elements) {
                element.classList.add("hidden");
            }
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
            for (const [key, value] of Object.entries(feature.properties)) {
                if (/^\d+$/.test(value)) {
                    feature.properties[key] = parseInt(value);
                }
            }
            objetConvertPoints.features.push(feature);
        } else if (feature.geometry.type == "LineString") {
            feature.geometry.coordinates = feature.geometry.coordinates.map(coordinate => convertCoordinates4326to3857(coordinate[0], coordinate[1]));
            for (const [key, value] of Object.entries(feature.properties)) {
                if (/^\d+$/.test(value)) {
                    feature.properties[key] = parseInt(value);
                }
            }
            objetConvertLignes.features.push(feature);
        }

    });
    return [objetConvertPoints, objetConvertLignes];
}

function convertCoordinates4326to3857(lon, lat) {
    var x = (lon * 20037508.34) / 180;
    var y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
    y = (y * 20037508.34) / 180;
    return [x, y];
}

// Initialisation de la carte
const projection = new ol.proj.get('EPSG:3857');
const tileSizePixels = 256;
const tileSizeMtrs = ol.extent.getWidth(projection.getExtent()) / tileSizePixels;
const matrixIds = [];
const resolutions = [];
for (let i = 0; i <= 14; i++) {
    matrixIds[i] = i;
    resolutions[i] = tileSizeMtrs / Math.pow(2, i);
}
const tileGrid = new ol.tilegrid.WMTS({
    origin: ol.extent.getTopLeft(projection.getExtent()),
    resolutions: resolutions,
    matrixIds: matrixIds,
});

var map = new ol.Map({
    target: 'map',
    layers: [
        /* new ol.layer.Tile({
            source: new ol.source.WMTS({
                attributions: "&lt;a href=&quot;https://public.sig.rennesmetropole.fr/geonetwork/srv/fre/catalog.search#/metadata/2ff4b02a-7d1e-4e9c-a0c2-dddbb11a3168&quot; target=&quot;_blank&quot; &gt;Rennes Métropole&lt;/a&gt;",
                url: 'https://public.sig.rennesmetropole.fr/geowebcache/service/wmts?service/wmts?',
                format: 'image/png',
                layer: "ref_fonds:pvci_simple_gris",
                projection: projection,
                tileGrid: tileGrid,                
                wrapX: false,
                matrixSet: 'EPSG:3857'
            })
        }), */
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-1.67, 48.11]),
        zoom: 12,
        constrainResolution: true
    })
});

// Gestion du zoom par défaut de la carte
document.getElementById('zoomDefaut').addEventListener('change', (e) => {
    map.getView().setZoom(e.target.value);
});

map.on('moveend', function (e) {
    var newZoom = map.getView().getZoom();
    document.getElementById('zoomDefaut').value = Math.round(newZoom * 100) / 100;
    if (animationEnCours == false) {
        lastZoom = map.getView().getZoom();
        lastCenter = map.getView().getCenter();
    }
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
            couleurPointActif();
            couleurBaladeDefaut();
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

// Gestion de l'affichage des points non séléctionnés
document.querySelector("#affichagePointNonSelect").addEventListener('change', (e) => {
    const vectorLayerPoints = map.getLayers().getArray()[1];
    if (e.target.value == "Oui") {
        vectorLayerPoints.setVisible(true);
    } else {
        vectorLayerPoints.setVisible(false);
    }
});

// Gestion de la couleur du point actif
function couleurPointActif() {
    const vectorLayerPoints = map.getLayers().getArray()[1];
    vectorLayerPoints.getSource().getFeatures()[0].setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: "librairies/pin.svg",
            color: document.querySelector("#couleurPointActif").value
        })
    })
    );
}
document.querySelector("#couleurPointActif").addEventListener('change', (e) => {
    couleurPointActif();
});

// Gestion de la couleur par défaut de la balade 
function couleurBaladeDefaut() {
    const vectorLayerBalades = map.getLayers().getArray()[2];
    vectorLayerBalades.getSource().getFeatures()[0].setStyle(new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: 3,
            color: document.querySelector("#couleurBaladeDefaut").value
        })
    }));
}
document.querySelector("#couleurBaladeDefaut").addEventListener('change', (e) => {
    couleurBaladeDefaut();
})

// Gestion du zoom par défaut d'une balade active
document.querySelector("#zoomBalade").addEventListener('change', (e) => {
    // Zoom sur un point de la balade
    const vectorLayerPoints = map.getLayers().getArray()[1];
    var featurePoint = vectorLayerPoints.getSource().getFeatures()[0];
    var coord = featurePoint.getGeometry().getCoordinates();
    animationEnCours = true;
    map.getView().animate({ zoom: e.target.value, center: coord, duration: 800 });

    document.querySelector("#boutonRetourZoom").addEventListener('click', () => {
        map.getView().animate({ zoom: lastZoom, center: lastCenter, duration: 800 }, () => { animationEnCours = false; });
        document.querySelector("#boutonRetourZoom").classList.add("hidden");
    });
    document.querySelector("#boutonRetourZoom").classList.remove("hidden");
});

// Gestion du radiobouton couleurBaladeDefaut-non pour afficher l'éditeur de couleur
document.querySelector("#couleurBaladeDefaut-non").addEventListener('click', () => {
    document.querySelector("#couleurBaladeDefaut").classList.remove("hidden");
});

document.querySelector("#couleurBaladeDefaut-oui").addEventListener('click', () => {
    document.querySelector("#couleurBaladeDefaut").classList.add("hidden");
})

// Gestion des fichiers de données 
document.querySelector("#boutonEnvoyer").addEventListener('click', (e) => {
    var form = document.querySelector("#form");
    if (form.checkValidity()) {
        document.querySelector("#confirmation-modal").classList.remove("hidden");
    } else {
        form.reportValidity()
    }
});

// Gestion du modal de confirmation
document.querySelector("#envoyerFormulaireConfirm").addEventListener('click', (e) => {
    var form = document.querySelector("#form");
    var date = new Date();
    var uid = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + "_" + date.getMilliseconds();
    let fichiers = {};
    fichiers["points_" + uid + ".geojson"] = objetConvertPoints;
    fichiers["balades_" + uid + ".geojson"] = objetConvertLignes;

    fichiers["param_" + uid + ".json"] = {
        "carte": { "zoomPendantBalade": parseInt(form.elements["zoomBalade"].value) },
        "balades": { "layer_balades": "balades", "id": form.elements["attributIdBalade"].value, "couleurBalades": "couleur", "defaultColor": form.elements["couleurBaladeDefaut"].value, "baladeParDefaut": form.elements["baladeDefautSelectionnes"].value },
        "points": { "layer_points": "balades_points", "idBalade": form.elements["attributIdPoint"].value, "champRang": form.elements["attributRang"].value, "couleurPointActif": form.elements["couleurPointActif"].value, "pointsVisible": form.elements["affichagePointNonSelect"].value == "Oui" ? "true" : "false" }
    };

    fichiers["balades_" + uid + ".xml"] = "A faire"; // En JSON ? json to xml converter
    console.log(fichiers);
});

document.querySelector("#annulerConfirm").addEventListener('click', (e) => {
    document.querySelector("#confirmation-modal").classList.add("hidden");
})
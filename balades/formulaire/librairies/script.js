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
                    if (/id/i.test(attribut))
                        option.selected = true;
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
                    if (/balade/i.test(attribut))
                        option.selected = true;
                    SelectAttributIdPoint.appendChild(option);
                });
                // Essayer de mettre les couleurs des balades (donc les deux champs des id ont été auto détécté)
                setColorOnMap();

                // Sélectionner les radiobutton par défaut
                document.querySelector("#couleurBaladeDefaut-oui").checked = true;
                document.querySelector("#ouvertureBalade-non").checked = true;
                document.querySelector("#couleurBaladeDefaut").classList.add("hidden");
                document.querySelector("#baladeDefautSelectionnes").classList.add("hidden");

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
                    if (/rang|ordre/i.test(attribut))
                        option.selected = true;
                    SelectAttributRangPoint.appendChild(option);
                });

                // Attribut de balade par défaut sélectionnée
                const SelectAttributBaladeDefaut = document.querySelector('#baladeDefautSelectionnes');
                while (SelectAttributBaladeDefaut.firstChild) {
                    SelectAttributBaladeDefaut.removeChild(SelectAttributBaladeDefaut.firstChild);
                }
                var optionParametreOptionnel = document.createElement("option");
                optionParametreOptionnel.value = "";
                optionParametreOptionnel.innerText = "Sélectionnez une balade..";
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
const tileSizeMtrs = ol.extent.getWidth(projection.getExtent()) / 256;
const matrixIds = [];
const resolutions = [];
for (let i = 0; i <= 21; i++) {
    matrixIds[i] = 'EPSG:3857:' + i;
    resolutions[i] = tileSizeMtrs / Math.pow(2, i);
} 
const tileGrid = new ol.tilegrid.WMTS({
    origin: ol.extent.getTopLeft(projection.getExtent()),
    resolutions: resolutions,
    matrixIds: matrixIds,
});
var matrixset = "EPSG:3857";
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.WMTS({
                url:  "https://public.sig.rennesmetropole.fr/geowebcache/service/wmts?service/wmts?",
                crossOrigin: null,
                layer: "ref_fonds:pvci_simple_gris",
                matrixSet: matrixset,
                style: "_null",
                format: "image/png",
                attributions: "&lt;a href=&quot;https://public.sig.rennesmetropole.fr/geonetwork/srv/fre/catalog.search#/metadata/2ff4b02a-7d1e-4e9c-a0c2-dddbb11a3168&quot; target=&quot;_blank&quot; &gt;Rennes Métropole&lt;/a&gt;",
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                    origin: ol.extent.getTopLeft(projection.getExtent()),
                    resolutions: resolutions,
                    matrixIds: matrixIds
                })
            })
        }) /*
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }) */
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
    if (animationEnCours == false) {
        var newZoom = map.getView().getZoom();
        document.getElementById('zoomDefaut').value = newZoom;
        lastZoom = map.getView().getZoom();
        lastCenter = map.getView().getCenter();
    }
});

// Gestion de l'attribut ID de chaque point (ajustement de la couleur des pins)
function setColorOnMap() {
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
}

document.querySelectorAll("#attributIdPoint, #attributIdBalade").forEach(element => {
    element.addEventListener('change', setColorOnMap);
});

// Gestion de la balade par défaut sélectionnée
function setBaladeParDefaut() {
    const SelectAttributBaladeDefaut = document.querySelector('#baladeDefautSelectionnes');
    while (SelectAttributBaladeDefaut.firstChild) {
        SelectAttributBaladeDefaut.removeChild(SelectAttributBaladeDefaut.firstChild);
    }
    var optionParametreOptionnel = document.createElement("option");
    optionParametreOptionnel.value = "";
    optionParametreOptionnel.innerText = "Sélectionnez une balade..";
    SelectAttributBaladeDefaut.appendChild(optionParametreOptionnel);
    map.getLayers().getArray()[2].getSource().forEachFeature(feature => {
        var idBalade = feature.get("values")[document.querySelector("#attributIdBalade").value];
        var titre = feature.get("values")["name"];
        const option = document.createElement("option");
        option.value = idBalade;
        option.innerText = (titre != null) ? ("id : " + idBalade + " titre : " + titre) : "id : " + idBalade;
        SelectAttributBaladeDefaut.appendChild(option);
    });
}
document.querySelector("#attributIdBalade").addEventListener('change', setBaladeParDefaut);
document.querySelector("#ouvertureBalade-oui").addEventListener('change', setBaladeParDefaut);

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
document.querySelector("#couleurPointActif").addEventListener('change', () => {
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
document.querySelector("#couleurBaladeDefaut").addEventListener('change', () => {
    couleurBaladeDefaut();
});

// Gestion du zoom par défaut d'une balade active
document.querySelector("#zoomBalade").addEventListener('change', (e) => {
    // Zoom sur un point de la balade
    const vectorLayerPoints = map.getLayers().getArray()[1];
    var featurePoint = vectorLayerPoints.getSource().getFeatures()[0];
    var coord = featurePoint.getGeometry().getCoordinates();
    animationEnCours = true;
    map.getView().animate({ zoom: e.target.value, center: coord, duration: 800 });
    map.getInteractions().forEach(x => x.setActive(false));
    document.querySelector(".ol-zoom-in").disabled = true;
    document.querySelector(".ol-zoom-out").disabled = true;
    document.querySelector("#zoomDefaut").disabled = true;
    document.querySelector(".messageCarte h3").style.display = 'none';

    document.querySelector("#boutonRetourZoom").addEventListener('click', () => {
        document.querySelector("#boutonRetourZoom").classList.add("hidden");
        document.querySelector(".messageCarte h3").style.display = 'block';
        map.getView().animate({ zoom: lastZoom, center: lastCenter, duration: 800 }, () => { 
            animationEnCours = false;
            map.getInteractions().forEach(x => x.setActive(true));
            document.querySelector(".ol-zoom-in").disabled = false;
            document.querySelector(".ol-zoom-out").disabled = false;
            document.querySelector("#zoomDefaut").disabled = false;  
        });
    });
    document.querySelector("#boutonRetourZoom").classList.remove("hidden");
});

// Gestion du radiobouton couleurBaladeDefaut-non pour afficher l'éditeur de couleur
document.querySelector("#couleurBaladeDefaut-non").addEventListener('click', () => {
    document.querySelector("#couleurBaladeDefaut").classList.remove("hidden");
    document.querySelector("#labelCouleurBaladeDefaut").classList.remove("hidden");
});
document.querySelector("#couleurBaladeDefaut-oui").addEventListener('click', () => {
    document.querySelector("#couleurBaladeDefaut").classList.add("hidden");
    document.querySelector("#labelCouleurBaladeDefaut").classList.add("hidden");
});

// Gestion du radiobouton ouvertureBalade-non pour afficher la liste des balades par défaut
document.querySelector("#ouvertureBalade-non").addEventListener('click', () => {
    document.querySelector("#baladeDefautSelectionnes").classList.add("hidden");
    document.querySelector("#baladeDefautSelectionnes").removeAttribute("required");
});
document.querySelector("#ouvertureBalade-oui").addEventListener('click', () => {
    document.querySelector("#baladeDefautSelectionnes").classList.remove("hidden");
    document.querySelector("#baladeDefautSelectionnes").setAttribute("required", "");
});

// Gestion des fichiers de données 
document.querySelector("#boutonEnvoyer").addEventListener('click', () => {
    var formDonnees = document.querySelector("#form");
    if (formDonnees.checkValidity()) {
        document.querySelector("#confirmation-modal").classList.remove("hidden");
    } else {
        formDonnees.reportValidity();
    }
});

// Gestion validité formulaire de gestion de projet
document.querySelectorAll("#nom, #mail").forEach(element => {
    element.addEventListener('input', () => {
        if (formProjet.checkValidity()) {
            document.querySelector("#envoyerFormulaireConfirm").style.backgroundColor = "#CC3333";
        } else {
            document.querySelector("#envoyerFormulaireConfirm").style.backgroundColor = "#374151";
        }
    });
});

// Gestion du modal de confirmation
document.querySelector("#envoyerFormulaireConfirm").addEventListener('click', () => {
    var formProjet = document.querySelector("#formProjet");
    if (formProjet.checkValidity()) {
        var form = document.querySelector("#form");
        var date = new Date();
        var uid = date.getFullYear().toString() + (date.getMonth() + 1).toString() + date.getDate().toString() + "_" + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds().toString() + "_" + date.getMilliseconds().toString();
        let fichiers = {};
        fichiers["points_" + uid + ".geojson"] = objetConvertPoints;
        fichiers["balades_" + uid + ".geojson"] = objetConvertLignes;
        var mail = document.querySelector("#mail").value;
        var nom = document.querySelector("#nom").value;
        var defaultColor = "#000000";
        var baladeParDefaut = "";
        var center = map.getView().getCenter().join(',');
        if (document.querySelector("#couleurBaladeDefaut-non").checked)
            defaultColor = document.querySelector("#couleurBaladeDefaut").value;
        if (document.querySelector("#ouvertureBalade-oui").checked)
            baladeParDefaut = document.querySelector("#baladeDefautSelectionnes").value;

        fichiers["param_" + uid + ".json"] = {
            "carte": { "zoomPendantBalade": parseInt(form.elements["zoomBalade"].value) },
            "balades": { "layer_balades": "balades", "id": form.elements["attributIdBalade"].value, "couleurBalades": "couleur", "defaultColor": defaultColor, "baladeParDefaut": baladeParDefaut },
            "points": { "layer_points": "balades_points", "idBalade": form.elements["attributIdPoint"].value, "champRang": form.elements["attributRang"].value, "couleurPointActif": form.elements["couleurPointActif"].value, "pointsVisible": form.elements["affichagePointNonSelect"].value == "Oui" ? "true" : "false" }
        };

        var xmlString = `<?xml version="1.0" encoding="UTF-8"?>
                    <config><application title="${document.querySelector("#titre").value}" logo="apps/public/img/logo/logo_mviewer_transp.png" 
                        favicon="https://public.sig.rennesmetropole.fr/ressources/img/mviewer/favicon_gris.png" titlehelp="À propos des cartes thématiques"
                        help="apps/site_internet/html/site_internet_help.html" showhelp="false" exportpng="false" style="apps/site_internet/css/art_ville.css"
                        measuretools="false" togglealllayersfromtheme="false" showClickNbItems="false" templaterightinfopanel="allintabs" sortlayersinfopanel="toc"/>

                        <mapoptions maxzoom="20" minzoom="11" projection="EPSG:3857" center="${center}" zoom="${document.querySelector("#zoomDefaut").value}" />

                        <baselayers style="default"><!-- style="default"||gallery" -->
                            <baselayer visible="true" id="pvcisimple" thumbgallery="apps/public/img/basemap/pvcisimple.jpg" title="Rennes Metropole" label="Plan de ville" type="WMTS" url="https://public.sig.rennesmetropole.fr/geowebcache/service/wmts?service/wmts?" layers="ref_fonds:pvci_simple_gris" format="image/png" style="_null" matrixset="EPSG:3857" fromcapacity="false" attribution="&lt;a href=&quot;https://public.sig.rennesmetropole.fr/geonetwork/srv/fre/catalog.search#/metadata/2ff4b02a-7d1e-4e9c-a0c2-dddbb11a3168&quot; target=&quot;_blank&quot; &gt;Rennes Métropole&lt;/a&gt;" maxzoom="22"  maxscale="1000" ></baselayer>
                            <baselayer visible="false" id="ortho2020" thumbgallery="apps/public/img/basemap/ortho2014.jpg" title="Rennes Metropole" label="Vue aérienne" type="WMTS" url="https://public.sig.rennesmetropole.fr/geowebcache/service/wmts?" layers="raster:ortho2020" format="image/jpeg" style="_null" matrixset="EPSG:3857" fromcapacity="false" attribution="&lt;a href=&quot;https://public.sig.rennesmetropole.fr/geonetwork/srv/fre/catalog.search#/metadata/2ff4b02a-7d1e-4e9c-a0c2-dddbb11a3168&quot; target=&quot;_blank&quot; &gt;Rennes Métropole&lt;/a&gt;" maxzoom="22"  maxscale="1000" ></baselayer>
                        </baselayers>

                        <extensions>
                            <extension type="component" id="GUICustom" path="apps/public/addons"/>
                            <extension type="component" id="balades" path="apps/balades/addons" configFile="/apps/balades/parametrage/param_${uid}.json" />
                        </extensions>
                        
                        <themes mini="true" legendmini="false">
                            <theme id="theme-202201280956" name="Points" collapsed="true" icon="fas fa-map-marker-alt">
                                <layer
                                    id="balades_points"
                                    name="Points d'intérêt"
                                    type="customlayer"
                                    url="apps/balades/customlayer/balades_points.js"
                                    geojson="apps/balades/customlayer/data/points_${uid}.geojson"
                                    visible="true"
                                    tooltip="false"
                                    tooltipenabled="false"
                                    tooltipcontent="&lt;span class=&apos;rm-tooltip-title&apos;&gt;{{label}}&lt;/span&gt;"
                                    metadata="undefined"
                                    queryable="true"
                                    featurecount="3"
                                    infopanel="right-panel">
                                    <template url="apps/balades/templates/point.mst"></template>
                                </layer>
                            </theme>
                            <theme id="theme-202201280955" name="Balades" collapsed="true" icon="fas fa-route">
                                <layer
                                    id="balades"
                                    name="Données de balades"
                                    type="customlayer"
                                    url="apps/balades/customlayer/balades.js"
                                    geojson="apps/balades/customlayer/data/balades_${uid}.geojson"
                                    visible="true"
                                    tooltip="false"
                                    tooltipenabled="false"
                                    tooltipcontent="&lt;span class=&apos;rm-tooltip-title&apos;&gt;{{label}}&lt;/span&gt;"
                                    metadata="undefined"
                                    queryable="true"
                                    featurecount="3"
                                    infopanel="right-panel">
                                    <template url="apps/balades/templates/balade.mst"></template>
                                </layer>
                            </theme>
                        </themes>
                    </config>`;
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlString, "text/xml");
        fichiers["balades_" + uid + ".xml"] = xmlDoc;
        console.log(fichiers);
        fetch('envoiMail.php', {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: "name=salut"
        }).then(() => {
            window.location.href = window.location.href.split('?')[0] + "?mail=" + mail;
        });
    } else {
        formProjet.reportValidity();
    }
});

// Gestion du bouton annuler sur le modal de confirmation
document.querySelector("#annulerConfirm").addEventListener('click', () => {
    document.querySelector("#confirmation-modal").classList.add("hidden");
});

// Gestion du message de confirmation d'envoi du formulaire
window.onload=function() {
    var url = new URL(window.location.href);
    var mail = url.searchParams.get("mail");
    if (mail) {
        document.querySelector("#messageConfirmationText").innerHTML += ("<span class='font-medium text-gray-900'>" + mail + "</span>");
        document.querySelector("#messageConfirmation").classList.remove("hidden");
        document.querySelector("#buttonCloseMessageConfirmation").addEventListener('click', () => {
            document.querySelector("#messageConfirmation").classList.add("hidden");
        });
    }
};
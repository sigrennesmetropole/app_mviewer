var baladesAddon = (function () {

    var configFile; // fichier de configuration
    var layer_balades; // nom du customlayer des balades
    var layer_points; // nom du customlayer des points
    var zoomPendantBalade = 16; // zoom appliqué à la carte pendant la balade

    var baladeId; // id de chaque balade
    var couleurBalades; // nom de l'attribut couleur sur chaque balade
    var idBalade; // id de la balade sur chaque point
    var champRang = 'rang'; // rang de chaque point
    var defaultColor; // couleur de base des points si la couleur n'est pas valide
    var couleurPointActif; // couleur du point actif de la balade
    var highlightLayer; // Layer highlight du point actif

    var featuresBalades; // liste des balades
    var featuresPoints; // liste des points
    var opacity = 0.4; // opacité des points des balades non actifs
    var currentIdBalade = -1; // id de la balade visible dans le pannel
    var currentPointBalade = -1; // point courant lors de la balade
    var pointsVisible = true; // option d'affichage des points d'arrêt
    var baladeParDefaut; // option de balade par défaut
    var _map = mviewer.getMap();

    var init = function () {
        configFile = _getConfigPerso();
        _setConfigVariable(configFile, styleBalades);
        // changement d'opacité des balades
        mviewer.getMap().on('click', changeOpacityOnClick);
        mviewer.setInfoPanelTitle = setInfoPanelTitleFunction;

        $('#prevButton').click(clickPrevButtonFunction);
        $('#nextButton').click(clickNextButtonFunction);
        $('#startButton').click(clickStartButtonFunction);

        // Gestion du point de géolocalisation
        if (getParametreVisible())
            geolocalisation();
    };

    function getParametreVisible(){
        var l_ext = configuration.getConfiguration().extensions.extension;
        var geoloc;
        if (l_ext.length){ // si plusieurs extensions
            for(var i= 0; i < l_ext.length; i++) {
                if (l_ext[i].id && l_ext[i].id == "balades"){
                    geoloc = l_ext[i].geoloc;
                    break;
                }
            }
        } else { 
            geoloc = l_ext.geoloc;
        }
        return (geoloc == "true")
    }

    function geolocalisation() {
        const geolocation = new ol.Geolocation({
            trackingOptions: {
              enableHighAccuracy: true,
            },
            projection: _map.getView().getProjection(),
        });
        geolocation.setTracking(true);

        const positionFeature = new ol.Feature();
        positionFeature.setStyle(
        new ol.style.Style({
            image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: '#3399CC',
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2,
            }),
            }),
        })
        );

        geolocation.on('change:position', function () {
            const coordinates = geolocation.getPosition();
            positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        });

        // ajout du point de géolocalisation
        const accuracyFeature = new ol.Feature();
        geolocation.on('change:accuracyGeometry', function () {
            accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
        });

        const positionLayer = new ol.layer.Vector({
            map: _map,
            source: new ol.source.Vector({
                features: [accuracyFeature, positionFeature],
            }),
        });

        function onclickGeolocalisation() {
            mviewer.getMap().getView().setCenter(geolocation.getPosition());
            mviewer.getMap().getView().setZoom(18);
            if (document.getElementById("modal-panel").style.display == "block")
                decaleMap([0, 0]);
        }

        // modification du bouton géolocaliser
        if (getParametreVisible()){ 
            if (_map.getSize()[0] > 1000){
                document.getElementById('geolocbtn').style.display = "block";
                document.getElementById('geolocbtn').onclick = onclickGeolocalisation;
            } else {
                document.getElementById('geolocbtnBalade').style.display = 'block';
                document.getElementById('geolocbtnBalade').style.bottom = "10.5%";
                document.getElementById('geolocbtnBalade').style.left = "88%";
                document.getElementById('geolocbtnBalade').addEventListener('click', onclickGeolocalisation);
            }
        }
    }

    function createLayerHighlight() {
        var stylePointHighlight = new ol.style.Style({
            image: new ol.style.Icon({
                color: couleurPointActif,
                crossOrigin: 'anonymous',
                scale: 1,
                anchor: [0.5, 1],
                src: 'apps/site_internet/customlayer/picture/marker.svg',
            })
        });
        let HighlightLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: stylePointHighlight,
        });
        HighlightLayer.mviewerid = 'communeOverlay';
        var geometry = new ol.geom.Point([-187047.06116075147, 6125936.809755854]);
        var feature = new ol.Feature({
            name: "id",
            geometry: geometry
        });
        HighlightLayer.getSource().addFeature(feature);
        highlightLayer = HighlightLayer;
    }

    var clickPrevButtonFunction = function clickPrevButton() {
        currentPointBalade--;
        var geometryPointFeature = featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade).getGeometry().getCoordinates();
        if (geometryPointFeature) {
            document.getElementById('nextButton').disabled = false;
            geometryPoint = ol.proj.transform([geometryPointFeature[0], geometryPointFeature[1]], 'EPSG:3857', 'EPSG:4326');
            mviewer.zoomToLocation(geometryPoint[0], geometryPoint[1] + 0.00002, zoomPendantBalade, true);
            highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([geometryPointFeature[0], geometryPointFeature[1]]);

            opendivheight = document.getElementById('modal-panel').children[0].offsetHeight;
            setTimeout(() => {
                decaleMap([0, opendivheight/3]);
            }, 400);
        }
        if (!featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade - 1)) {
            document.getElementById('prevButton').disabled = true;
        }
    }

    var clickNextButtonFunction = function clickNextButton() {
        currentPointBalade++;
        var geometryPointFeature = featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade).getGeometry().getCoordinates();
        if (geometryPointFeature) {
            document.getElementById('prevButton').disabled = false;
            geometryPoint = ol.proj.transform([geometryPointFeature[0], geometryPointFeature[1]], 'EPSG:3857', 'EPSG:4326');
            mviewer.zoomToLocation(geometryPoint[0], geometryPoint[1] + 0.00002, zoomPendantBalade, true);
            highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([geometryPointFeature[0], geometryPointFeature[1]]);

            opendivheight = document.getElementById('modal-panel').children[0].offsetHeight;
            setTimeout(() => {
                decaleMap([0, opendivheight/3]);
            }, 400);
        }
        if (!featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade + 1)) {
            document.getElementById('nextButton').disabled = true;
        } 
    }

    function decaleMap([x, y]) {
        if (_map && _map.getSize()[0] < 1000) {
            if (y == 0) y = 120;
            y += 45;
            var center = _map.getView().getCenter();
            var resolution = _map.getView().getResolution();
            _map.getView().animate({
                center: [center[0] + x * resolution, center[1] + y * resolution],
                duration: 200,
            });
        }
    };

    var clickStartButtonFunction = function clickStartButton() {
        document.getElementById('prevButton').style.display = 'block';
        document.getElementById('prevButton').disabled = true;
        document.getElementById('nextButton').disabled = false;
        document.getElementById('nextButton').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';
        currentPointBalade = 1;
        var geometryPointFeature = featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade).getGeometry().getCoordinates();
        geometryPoint = ol.proj.transform([geometryPointFeature[0], geometryPointFeature[1]], 'EPSG:3857', 'EPSG:4326');
        mviewer.zoomToLocation(geometryPoint[0], geometryPoint[1] + 0.00002, zoomPendantBalade, true);
        highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([geometryPointFeature[0], geometryPointFeature[1]]);
        mviewer.getMap().getLayers().push(highlightLayer);
        $("#mv_marker").attr('fill-opacity', '0');
        opendivheight = document.getElementById('modal-panel').children[0].offsetHeight;
        setTimeout(() => {
            decaleMap([0, opendivheight/3]);
        }, 400);
    }

    function updateButton() {
        if (currentIdBalade == -1) {
            document.getElementById('prevButton').style.display = 'none';
            document.getElementById('nextButton').style.display = 'none';
            document.getElementById('startButton').style.display = 'none';
        } else {
            document.getElementById('startButton').style.display = 'block';
            document.getElementById('prevButton').style.display = 'none';
            document.getElementById('nextButton').style.display = 'none';
        }
        mviewer.getMap().removeLayer(highlightLayer);
        $("#mv_marker").attr('fill-opacity', '1');
    }

    var setInfoPanelTitleFunction = function setInfoPanelTitle(el, panel) {
        var title = $(el).attr("data-original-title");
        $("#" + panel + " .mv-header h5").text(title);
        var idBaladeSelected = $("#" + panel + " " + $(el).attr("href") + " #idbalade").text();
        currentIdBalade = idBaladeSelected;
        featuresBalades.map(feat => {
            if (feat.get('id') != idBaladeSelected) {
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7) + "66";
            } else {
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7);
            }
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: colorFeature, width: 4 })
            });
            feat.setStyle(style);
        });
        featuresPoints.map(feat => {
            if (feat.get(idBalade) != idBaladeSelected) {
                feat.getStyle().getImage().setOpacity(opacity);
            } else {
                feat.getStyle().getImage().setOpacity(1);
            }
        });
        mviewer.customLayers[layer_points].layer.changed();
        mviewer.customLayers[layer_balades].layer.changed();
        updateButton();
    }

    function changeOpacityOnClick(e) {
        var map = mviewer.getMap();
        var feature = map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
            return feature;
        });
        // Mettre l'opacité basse pour les balades non sélectionnées
        featuresBalades.map(feat => {
            if ((feature && feature.getGeometry().getType() == 'LineString' && feat.get('id') != feature.get('id')) || (feature && feature.getGeometry().getType() == 'Point' && feat.get('id') != feature.get(idBalade))) {
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7) + "66";
            } else {
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7);
                //currentIdBalade = feat.get('id');
                currentIdBalade = feat.get(baladeId);
            }
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: colorFeature, width: 4 })
            });
            featuresBalades.find(x => x.get('id') == feat.get('id')).setStyle(style);
        });
        // Mettre l'opacité basse pour les points non sélectionnés
        featuresPoints.map(feat => {
            if (feature && feature.getGeometry().getType() == 'LineString' && feat.get(idBalade) != feature.get('id')) {
                feat.getStyle().getImage().setOpacity(opacity);
            } else if (feature && feature.getGeometry().getType() == 'Point' && feat.get(idBalade) != feature.get(idBalade)) {
                feat.getStyle().getImage().setOpacity(opacity);
            } else {
                if (feature || pointsVisible == "true")
                    feat.getStyle().getImage().setOpacity(1);
                else
                    feat.getStyle().getImage().setOpacity(0);
            }
        });
        mviewer.customLayers[layer_points].layer.changed();
        // if (!feature)
        //    currentIdBalade = -1;
        if (feature && feature.getGeometry().getType() == 'Point' && feature.get('id')) {
            document.getElementById('prevButton').style.display = 'block';
            document.getElementById('prevButton').disabled = false;
            document.getElementById('nextButton').disabled = true;
            currentPointBalade = feature.get(champRang);
            if (featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade + 1))
                document.getElementById('nextButton').disabled = false;
            if (!featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade - 1)) {
                document.getElementById('prevButton').disabled = true;
            }
            document.getElementById('nextButton').style.display = 'block';
            document.getElementById('startButton').style.display = 'none';
            var geometryPointFeature = featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get(champRang) == currentPointBalade).getGeometry().getCoordinates();
            geometryPoint = ol.proj.transform([geometryPointFeature[0], geometryPointFeature[1]], 'EPSG:3857', 'EPSG:4326');
            mviewer.getMap().removeLayer(highlightLayer);
            highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([geometryPointFeature[0], geometryPointFeature[1]]);
            mviewer.getMap().getLayers().push(highlightLayer);
            $("#mv_marker").attr('fill-opacity', '0');

            opendivheight = document.getElementById('modal-panel').children[0].offsetHeight;
            setTimeout(() => {
                _map.getView().setCenter([geometryPointFeature[0], geometryPointFeature[1]]);
                decaleMap([0, opendivheight/3]);
            }, 400);
        } else {
            updateButton();
        }
    };

    var styleBalades = function () {
        featuresBalades = mviewer.customLayers[layer_balades].layer.getSource().getFeatures();
        featuresPoints = mviewer.customLayers[layer_points].layer.getSource().getFeatures();
        // Gestion de l'option des points au démarrage (pointsVisible)
        if (pointsVisible == "false") {
            opacity = 0;
        }
        var features = mviewer.customLayers[layer_balades].layer.getSource().getFeatures();
        var featuresCouleur = [];
        // changement de couleur des entitées linéraires
        features.forEach(balade => {
            featuresCouleur.push({ "id": balade.get(baladeId), "couleur": balade.get(couleurBalades) });
            var couleurFeature = balade.get(couleurBalades);
            if (!isColor(couleurFeature))
                couleurFeature = defaultColor;
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: couleurFeature, width: 4 })
            });
            balade.setStyle(style);
        });
        // changement de couleur des points 
        features = mviewer.customLayers[layer_points].layer.getSource().getFeatures();
        features.forEach(point => {
            var couleurPoint = featuresCouleur.find(x => x['id'] == point.get(idBalade)).couleur;
            if (!isColor(couleurPoint))
                couleurPoint = defaultColor;
            var style = new ol.style.Style({
                image: new ol.style.Icon({
                    color: couleurPoint,
                    crossOrigin: 'anonymous',
                    scale: 1,
                    anchor: [0.5, 1],
                    src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
            });
            point.setStyle(style);
            if (pointsVisible == "false")
                point.getStyle().getImage().setOpacity(0);
        });

        // Gestion de l'option de la balade par défaut (defaut)
        if (baladeParDefaut != "") {
            var featureDefaut = mviewer.customLayers[layer_points].layer.getSource().getFeatures().find(x => x.get(idBalade) == baladeParDefaut && x.get(champRang) == 1);
            if (featureDefaut) {
                var geometryPoint = ol.proj.transform([featureDefaut.getGeometry().getCoordinates()[0], featureDefaut.getGeometry().getCoordinates()[1]], 'EPSG:3857', 'EPSG:4326');
                mviewer.zoomToLocation(geometryPoint[0] + 0.00002, geometryPoint[1] + 0.00002, zoomPendantBalade, true);
                highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([featureDefaut.getGeometry().getCoordinates()[0], featureDefaut.getGeometry().getCoordinates()[1]]);
                mviewer.getMap().getLayers().push(highlightLayer);
                $("#mv_marker").attr('fill-opacity', '0');
                opendivheight = document.getElementById('modal-panel').children[0].offsetHeight;
                setTimeout(() => {
                    decaleMap([0, opendivheight/3]);
                }, 400);
                currentIdBalade = featureDefaut.get(idBalade);
                currentPointBalade = 1;
                document.getElementById('prevButton').style.display = 'block';
                document.getElementById('prevButton').disabled = true;
                document.getElementById('nextButton').disabled = false;
                document.getElementById('nextButton').style.display = 'block';
                document.getElementById('startButton').style.display = 'none';
                // Mettre l'opacité basse pour les balades non sélectionnées
                feature = featureDefaut;
                featuresBalades.map(feat => {
                    if (feature && feat.get('id') != feature.get(idBalade)) {
                        var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7) + "66";
                    } else {
                        var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7);
                        //currentIdBalade = feat.get('id');
                        currentIdBalade = feat.get(baladeId);
                    }
                    var style = new ol.style.Style({
                        stroke: new ol.style.Stroke({ color: colorFeature, width: 4 })
                    });
                    featuresBalades.find(x => x.get('id') == feat.get('id')).setStyle(style);
                });
                // Mettre l'opacité basse pour les points non sélectionnés
                featuresPoints.map(feat => {
                    if (feature && feature.getGeometry().getType() == 'Point' && feat.get(idBalade) != feature.get(idBalade)) {
                        feat.getStyle().getImage().setOpacity(opacity);
                    } else {
                        feat.getStyle().getImage().setOpacity(1);
                    }
                });
                mviewer.customLayers[layer_points].layer.changed();
            } else {
                console.log("Extension balades : id de la balade par défaut non valide");
            }
        }
    }

    function _getConfigPerso() {
        var extensions = configuration.getConfiguration().extensions;
        var configPerso;
        for (index in extensions.extension) {
            // console.log(extensions.extension[index]);
            configPerso = extensions.extension[index];
            if (extensions.extension[index].id == "balades") {
                if (extensions.extension[index].configFile != undefined) {
                    configPerso = extensions.extension[index].configFile;
                } else {
                    console.log("Err : l'attribut configfile du fichier de personnalisation de la recherche est manquant sur l'extension");
                }
                break;
            }
        }
        if (configPerso != 'undefined') {
            return '.' + configPerso;
        }
    }

    function _setConfigVariable(configFile, callback) {
        $.getJSON(configFile, (data) => {
            _setSearchParameters(data, callback);
        });
    }

    function _setSearchParameters(data, callback) {
        zoomPendantBalade = data.carte.zoomPendantBalade;
        couleurBalades = data.balades.couleurBalades;
        layer_balades = data.balades.layer_balades;
        layer_points = data.points.layer_points;
        idBalade = data.points.idBalade;
        champRang = data.points.champRang;
        baladeId = data.balades.id;
        defaultColor = data.balades.defaultColor;
        couleurPointActif = data.points.couleurPointActif;
        pointsVisible = data.points.pointsVisible;
        baladeParDefaut = data.balades.baladeParDefaut;
        createLayerHighlight();
        callback();
    }

    function isColor(strColor) {
        var reg = /^#([0-9a-f]{3}){1,2}$/i;
        return reg.test(strColor);
    }

    return {
        init: init
    };
})();

setTimeout(baladesAddon.init, 2000);
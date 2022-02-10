var baladesAddon = (function () {

    var configFile; // fichier de configuration
    var layer_balades; // nom du customlayer des balades
    var layer_points; // nom du customlayer des points

    var baladeId; // id de chaque balade
    var couleurBalades; // nom de l'attribut couleur sur chaque balade
    var idBalade; // id de la balade sur chaque point
    var defaultColor; // couleur de base des points si la couleur n'est pas valide
    var couleurPointActif; // couleur du point actif de la balade
    var highlightLayer; // Layer highlight du point actif

    var featuresBalades; // liste des balades
    var featuresPoints; // liste des points
    var opacity = 0.4;
    var currentIdBalade = -1; // id de la balade visible dans le pannel
    var currentPointBalade = -1;
    var pointsAtStart = true;

    var init = function() {
        configFile = _getConfigPerso();
        _setConfigVariable(configFile, styleBalades);
        // changement d'opacité des balades
        mviewer.getMap().on('click', changeOpacityOnClick);
        mviewer.setInfoPanelTitle = setInfoPanelTitleFunction;
        
        $('#prevButton').click(clickPrevButtonFunction);
        $('#nextButton').click(clickNextButtonFunction);
        $('#startButton').click(clickStartButtonFunction);
    };

    function createLayerHighlight(){    
        var stylePointHighlight = new ol.style.Style({
            image: new ol.style.Icon({
                color: couleurPointActif,  
                crossOrigin: 'anonymous',
                scale:1,
                anchor:[0.5,1],
                src: 'apps/site_internet/customlayer/picture/marker.svg',
            })
        });
        let HighlightLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: stylePointHighlight,
        });
        HighlightLayer.mviewerid='communeOverlay';
        var geometry = new ol.geom.Point([-187047.06116075147, 6125936.809755854]);
        var feature = new ol.Feature({
            name: "id",
            geometry: geometry
        });
        HighlightLayer.getSource().addFeature(feature);
        highlightLayer = HighlightLayer;
    }  

    var clickPrevButtonFunction = function clickPrevButton(){
        currentPointBalade--;
        var geometryPointFeature = featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get('rang') == currentPointBalade).getGeometry().getCoordinates();
        if (geometryPointFeature){
            document.getElementById('nextButton').disabled = false;
            geometryPoint = ol.proj.transform([geometryPointFeature[0], geometryPointFeature[1]], 'EPSG:3857', 'EPSG:4326');
            mviewer.zoomToLocation(geometryPoint[0], geometryPoint[1] + 0.00002, 16, true);
            highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([geometryPointFeature[0], geometryPointFeature[1]]);
        }
        if (!featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get('rang') == currentPointBalade-1)){
            document.getElementById('prevButton').disabled = true;
        }
    }

    var clickNextButtonFunction = function clickNextButton(){
        currentPointBalade++;
        var geometryPointFeature = featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get('rang') == currentPointBalade).getGeometry().getCoordinates();
        if (geometryPointFeature){
            document.getElementById('prevButton').disabled = false;
            geometryPoint = ol.proj.transform([geometryPointFeature[0], geometryPointFeature[1]], 'EPSG:3857', 'EPSG:4326');
            mviewer.zoomToLocation(geometryPoint[0], geometryPoint[1] + 0.00002, 16, true);
            highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([geometryPointFeature[0], geometryPointFeature[1]]);
        }
        if (!featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get('rang') == currentPointBalade+1)){
            document.getElementById('nextButton').disabled = true;
        }
    }

    var clickStartButtonFunction = function clickStartButton(){
        document.getElementById('prevButton').style.display = 'block';
        document.getElementById('prevButton').disabled = true;
        document.getElementById('nextButton').disabled = false; 
        document.getElementById('nextButton').style.display = 'block';
        document.getElementById('startButton').style.display = 'none';
        currentPointBalade = 1;
        var geometryPointFeature = featuresPoints.find(x => x.get(idBalade) == currentIdBalade && x.get('rang') == currentPointBalade).getGeometry().getCoordinates();
        geometryPoint = ol.proj.transform([geometryPointFeature[0], geometryPointFeature[1]], 'EPSG:3857', 'EPSG:4326');
        mviewer.zoomToLocation(geometryPoint[0], geometryPoint[1] + 0.00002, 16, true);
        highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([geometryPointFeature[0], geometryPointFeature[1]]);
        mviewer.getMap().getLayers().push(highlightLayer);
        $("#mv_marker").attr('fill-opacity', '0');
    }

    function updateButton(){
        if (currentIdBalade == -1){
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
        $("#" + panel +" .mv-header h5").text(title);
        var idBaladeSelected = $("#" + panel + " " + $(el).attr("href") + " #idbalade").text();
        currentIdBalade = idBaladeSelected;
        featuresBalades.map(feat => {
            if (feat.get('id') != idBaladeSelected){
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
            if (feat.get(idBalade) != idBaladeSelected){
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
            if ((feature && feature.getGeometry().getType() == 'LineString' && feat.get('id') != feature.get('id')) || (feature && feature.getGeometry().getType() == 'Point' && feat.get('id') != feature.get(idBalade))){
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7) + "66";
            } else {
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7);
                currentIdBalade = feat.get('id');
            }
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: colorFeature, width: 4 })
            });
            featuresBalades.find(x => x.get('id') == feat.get('id')).setStyle(style);
        });
        // Mettre l'opacité basse pour les points non sélectionnés
        featuresPoints.map(feat => {
            if (feature && feature.getGeometry().getType() == 'LineString' && feat.get(idBalade) != feature.get('id')){
                feat.getStyle().getImage().setOpacity(opacity);
            } else if (feature && feature.getGeometry().getType() == 'Point' && feat.get(idBalade) != feature.get(idBalade)) {
                feat.getStyle().getImage().setOpacity(opacity);
            } else {
                if (feature || pointsAtStart == "true")
                    feat.getStyle().getImage().setOpacity(1);
                else 
                    feat.getStyle().getImage().setOpacity(0);
            }
        });
        mviewer.customLayers[layer_points].layer.changed();
        if (!feature)
            currentIdBalade = -1;
        updateButton();
    };

    var styleBalades = function(){
        featuresBalades = mviewer.customLayers[layer_balades].layer.getSource().getFeatures();
        featuresPoints = mviewer.customLayers[layer_points].layer.getSource().getFeatures();
        // Gestion de l'option des points au démarrage (pointsAtStart)
        if (configuration.getConfiguration().extensions.extension.find(x => x.id == "balades").pointsAtStart){
            pointsAtStart = configuration.getConfiguration().extensions.extension.find(x => x.id == "balades").pointsAtStart;
            if (pointsAtStart == "false"){
                opacity = 0;
            }
        }
        var features = mviewer.customLayers[layer_balades].layer.getSource().getFeatures();
        var featuresCouleur = [];
        // changement de couleur des entitées linéraires
        features.forEach(balade => {
            featuresCouleur.push({"id": balade.get(baladeId), "couleur": balade.get(couleurBalades)});
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
                    scale:1,
                    anchor:[0.5,1],
                    src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
            });
            point.setStyle(style);
            if (pointsAtStart == "false")
                point.getStyle().getImage().setOpacity(0);
        });

        // Gestion de l'option de la balade par défaut (defaut)
        var baladeParDefaut = configuration.getConfiguration().extensions.extension.find(x => x.id == "balades").defaut;
        if (baladeParDefaut){
            var featureDefaut = mviewer.customLayers[layer_points].layer.getSource().getFeatures().find(x => x.get(idBalade) == baladeParDefaut && x.get('rang') == 1);
            if (featureDefaut){
                var geometryPoint = ol.proj.transform([featureDefaut.getGeometry().getCoordinates()[0], featureDefaut.getGeometry().getCoordinates()[1]], 'EPSG:3857', 'EPSG:4326');
                mviewer.zoomToLocation(geometryPoint[0] + 0.00002,  geometryPoint[1] + 0.00002, 16, true);
                highlightLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([featureDefaut.getGeometry().getCoordinates()[0], featureDefaut.getGeometry().getCoordinates()[1]]);
                mviewer.getMap().getLayers().push(highlightLayer);
                $("#mv_marker").attr('fill-opacity', '0');
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
                    if (feature && feat.get('id') != feature.get(idBalade)){
                        var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7) + "66";
                    } else {
                        var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7);
                        currentIdBalade = feat.get('id');
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

    function _getConfigPerso(){
        var extensions = configuration.getConfiguration().extensions;
        var configPerso;
        for (index in extensions.extension){
            // console.log(extensions.extension[index]);
            configPerso = extensions.extension[index];
            if(extensions.extension[index].id=="balades"){
                if (extensions.extension[index].configFile != undefined) {
                    configPerso=extensions.extension[index].configFile;
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

    function _setConfigVariable(configFile, callback){
        $.getJSON(configFile, (data) => {
            _setSearchParameters(data, callback);
        });
    }

    function _setSearchParameters(data, callback){
        couleurBalades = data.balades.couleurBalades;
        layer_balades = data.balades.layer_balades;
        layer_points = data.points.layer_points;
        idBalade = data.points.idBalade;
        baladeId = data.balades.id;
        defaultColor = data.balades.defaultColor;
        couleurPointActif = data.points.couleurPointActif;
        createLayerHighlight();
        callback();
    }

    function isColor(strColor){
        var reg = /^#([0-9a-f]{3}){1,2}$/i;
        return reg.test(strColor);
    }

    return {
        init: init
    };
})();

setTimeout(baladesAddon.init, 2000);
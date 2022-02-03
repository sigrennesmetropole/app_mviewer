var baladesAddon = (function () {

    var configFile; // fichier de configuration
    var layer_balades; // nom du customlayer des balades
    var layer_points; // nom du customlayer des points

    var baladeId; // id de chaque balade
    var couleurBalades; // nom de l'attribut couleur sur chaque balade
    var idBalade; // id de la balade sur chaque point
    var defaultColor; // couleur de base des points si la couleur n'est pas valide

    var featuresBalades; // liste des balades
    var featuresPoints; // liste des points
    var opacity = 0.4;

    var init = function() {
        configFile = _getConfigPerso();
        _setConfigVariable(configFile, styleBalades);
        // changement d'opacité des balades
        mviewer.getMap().on('click', changeOpacityOnClick);
        mviewer.setInfoPanelTitle = setInfoPanelTitleFunction;

        // var selectInteraction = new ol.interaction.Select();
        $('#prevButton').click(clickPrevButtonFunction);
    };

    var clickPrevButtonFunction = function clickPrevButton(){
        console.log("click !");
    }

    var setInfoPanelTitleFunction = function setInfoPanelTitle(el, panel) {
        var title = $(el).attr("data-original-title");
        $("#"+panel +" .mv-header h5").text(title);
        var idBaladeSelected = $("#" + panel + " " + $(el).attr("href") + " #idbalade").text();
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
    }

    function changeOpacityOnClick(e) {
        var map = mviewer.getMap();
        // console.log("#right-panel .mv-header h5")
        var feature = map.forEachFeatureAtPixel(e.pixel, function (feature) { return feature; });
        if (feature) {
            if (feature.getGeometry().getType() == 'LineString' && feature.getStyle().getStroke().getColor().length == 9){
                var colorFeature = feature.getStyle().getStroke().getColor().slice(0, 7);
                var style = new ol.style.Style({
                    stroke: new ol.style.Stroke({ color: colorFeature, width: 4 })
                });
                featuresBalades.find(x => x.get('id') == feature.get('id')).setStyle(style);
            } else if (feature.getGeometry().getType() == 'Point' && feature.getStyle().getImage().getOpacity() != 1) {
                feature.getStyle().getImage().setOpacity(opacity);
            }
        }
        // Mettre l'opacité basse pour les balades non sélectionnées
        featuresBalades.map(feat => {
            if ((feature && feature.getGeometry().getType() == 'LineString' && feat.get('id') != feature.get('id')) || (feature && feature.getGeometry().getType() == 'Point' && feat.get('id') != feature.get(idBalade))){
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7) + "66";
            } else {
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7);
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
                feat.getStyle().getImage().setOpacity(1);
            }
        });
        mviewer.customLayers[layer_points].layer.changed();
    };

    var styleBalades = function(){
        featuresBalades = mviewer.customLayers[layer_balades].layer.getSource().getFeatures();
        featuresPoints = mviewer.customLayers[layer_points].layer.getSource().getFeatures();

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
        });
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
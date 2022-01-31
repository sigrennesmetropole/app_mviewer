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

    var init = function() {
        configFile = _getConfigPerso();
        _setConfigVariable(configFile, styleBalades);
        // changement d'opacité des balades
        mviewer.getMap().on('click', changeOpacityOnClick);
    };

    function changeOpacityOnClick(e) {
        var map = mviewer.getMap();
        var feature = map.forEachFeatureAtPixel(e.pixel, function (feature) { return feature; });
        if (feature) {
            if (feature.getStyle().getStroke().getColor().length == 9){
                var colorFeature = feature.getStyle().getStroke().getColor().slice(0, 7);
                var style = new ol.style.Style({
                    stroke: new ol.style.Stroke({ color: colorFeature, width: 3 })
                });
                // feature.setStyle(style);
                featuresBalades.find(x => x.get('id') == feature.get('id')).setStyle(style);
            }
        }
        featuresBalades.map(feat => {
            if (feature && feat.get('id') != feature.get('id')){
                var colorFeature = feat.getStyle().getStroke().getColor().slice(0, 7) + "4D";
                var style = new ol.style.Style({
                    stroke: new ol.style.Stroke({ color: colorFeature, width: 3 })
                });
                featuresBalades.find(x => x.get('id') == feat.get('id')).setStyle(style);
            }
        })
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
                stroke: new ol.style.Stroke({ color: couleurFeature, width: 3 })
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
        pointsBalades = data.balades.pointsBalades;
        couleurBalades = data.balades.couleurBalades;
        layer_balades = data.balades.layer_balades;
        layer_points = data.points.layer_points;
        idBalade = data.points.idBalade;
        baladeId = data.balades.id;
        defaultColor = data.points.defaultColor;
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
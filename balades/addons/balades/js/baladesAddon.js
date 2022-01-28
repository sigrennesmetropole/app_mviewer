var baladesAddon = (function () {

    var configFile;
    var balades;
    var pointsBalades;
    var couleurBalades;
    var layer_balades;
    var layer_points;

    var init = function() {
        configFile = _getConfigPerso();
        _setConfigVariable(configFile, styleBalades);
    };

    var styleBalades = function(){
        var features = mviewer.customLayers[layer_balades].layer.getSource().getFeatures();
        features.forEach(balade => {
            console.log(balade);
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({ color: balade.get(couleurBalades), width: 3 })
            });
            balade.setStyle(style);
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
        balades = data.balades;
        pointsBalades = data.pointsBalades;
        couleurBalades = data.couleurBalades;
        layer_balades = data.layer_balades;
        layer_points = data.layer_points;
        callback();
    }

    return {
        init: init
    };
})();

setTimeout(baladesAddon.init, 2000);
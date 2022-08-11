// Gestion de couleurs de couches pour les onglets de navigation
var _init = function () {
    // creation d'une feuille de style dédiée
    var tabcolorsheet = document.createElement('style');
    document.head.appendChild(tabcolorsheet);
    
    mviewer.getMap().once('rendercomplete', function(e) {
        let allLayers = mviewer.getLayers();
            for (const layer in allLayers) {
                if (allLayers[layer].tabcolor) {
                    // mode normal
                    tabcolorsheet.sheet.insertRule(".popup-content .nav-tabs > li[data-layerid="+ allLayers[layer].layerid +"] > a > .fa ,.popup-content .nav-tabs > li[initiallayerid="+ allLayers[layer].layerid +"] > a > .fa { color: "+allLayers[layer].tabcolor+"!important;}", layer);
                    tabcolorsheet.sheet.insertRule(".popup-content .nav-tabs > li.active[data-layerid="+ allLayers[layer].layerid +"] > a > .fa ,.popup-content .nav-tabs > li.active[initiallayerid="+ allLayers[layer].layerid +"] > a > .fa { color: #ffffff!important;}", layer);
                    tabcolorsheet.sheet.insertRule(".popup-content .nav-tabs > li.active[data-layerid="+ allLayers[layer].layerid +"] > a,.popup-content .nav-tabs > li.active[initiallayerid="+ allLayers[layer].layerid +"] > a { background-color: "+allLayers[layer].tabcolor+"!important;}", layer);
                    tabcolorsheet.sheet.insertRule(".popup-content .nav-tabs > li.active[data-layerid="+ allLayers[layer].layerid +"] ,.popup-content .nav-tabs > li.active[initiallayerid="+ allLayers[layer].layerid +"] { background-color: #000000!important;}", layer);
                    tabcolorsheet.sheet.insertRule(".popup-content .nav-tabs > li.active  {border-left-color: #000000!important;}");
                    // mode u ou s
                    // rendu moche
                    //tabcolorsheet.sheet.insertRule("#modal-panel .panel-heading[data-layerid="+ allLayers[layer].layerid +"],#modal-panel .panel-heading[initiallayerid="+ allLayers[layer].layerid +"] { background-color: "+allLayers[layer].tabcolor+"!important}", layer);
                }
            }
    });
}

_init();

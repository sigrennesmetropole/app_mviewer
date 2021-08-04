
mviewer.customLayers.meslocalisations = (function() {
    // liste des categories et des styles associés 
    var l_styles = new Object;
    
    
    function _addStyle (id, style) {l_styles[id]=style;}
    function _delStyle(id) {
        delete l_styles[id];
        // TODO : demander à l'utilisateur si on supprime aussi tous les points de cette categorie ou si on les garde de coté ==> ils s'afficheront avec le style par défaut
        }
    
    function defaultStyle(){
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#f78b12',
                  crossOrigin: 'anonymous',
                  scale:0.02,
                  src: 'apps/dynMapPublic/picture/marker_blanc.svg',
                }),
              })
        ];
    }
    
    
    function featureStyle(feat) {
        if (feat.get("categorie") in l_styles) {
            return l_styles[feat.get("categorie")]
        } else {return defaultStyle();}
    }
    
    let meslocalisations = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: "",
            format: new ol.format.GeoJSON()
        }),
        style: featureStyle,
    });
    
    
    function _ajoutePoint(feat) {
        meslocalisations.getSource().addFeature(feat);
    }
    
    function _ajoutePoints(l_feat) {
        meslocalisations.getSource().addFeatures(l_feat);
    }
    
    
    /********************************************************/
    /* Code temporaire pour tests                           */
    /********************************************************/
      console.log("Code de test");
      const style1 = new ol.style.Style({
        image: new ol.style.Icon({
          color: '#aa0c8b',
          crossOrigin: 'anonymous',
          // For Internet Explorer 11
          scale:0.8,
          src: 'apps/dynMapPublic/picture/star_blanc.svg',
        }),
      });
      const style2 = new ol.style.Style({
            image: new ol.style.Icon({
              color: '#198391',
              crossOrigin: 'anonymous',
              // For Internet Explorer 11
              //scale:0.7,
              src: 'apps/dynMapPublic/picture/panneau_blanc.svg',
            }),
          });
      _addStyle('categ1', style1);
      _addStyle('categ2', style2);
      
      var geojsonfile1 = 'apps/dynMapPublic/data/data_test_1.geojson';
      $.get(geojsonfile1, function(data){
        var features = new ol.format.GeoJSON().readFeatures(data);
        _ajoutePoints(features);
      });
      
      console.log("Fin code de test");
      
    /********************************************************/
    /* Fin de code pour les tests                           */
    /********************************************************/
    
    
    return {
        layer: meslocalisations,
        addStyle: _addStyle, 
        ajoutePoint: _ajoutePoint,
        ajoutePoints: _ajoutePoints,
    }
}());



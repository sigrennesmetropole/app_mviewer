
mviewer.customLayers.meslocalisations = (function() {
    // liste des categories et des styles associés 
    var l_styles = new Object;
    
    let meslocalisations = new ol.layer.Vector({
        source: new ol.source.Vector({
            //url: 'apps/dynMapPublic/data/data_vide.geojson',
            format: new ol.format.GeoJSON()
        }),
        style: _getFeatureStyle,
    });
    
    function _updateStyle (id, style) {
        l_styles[id]=style;
        meslocalisations.getSource().changed();
    }
    
    function _deleteStyle(id, removePts=false) {
        if (removePts==true){
            meslocalisations.getSource().forEachFeature((feature) => {
                if (feature.get("categorie")==id){
                    meslocalisations.getSource().removeFeature(feature);
                }
            });
        }
        delete l_styles[id];
        meslocalisations.getSource().changed();
        }
    
    function _defaultStyle(){
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
    
    function _getFeatureStyle(feat) {
        if (feat.get("categorie") in l_styles) {
            return l_styles[feat.get("categorie")]
        } else {return _defaultStyle();}
    }
    
    function _getAllStyles() { return l_styles; }
    
    function _addNewFeature(coord) {
        let feat = new ol.Feature({
            geometry: new ol.geom.Point(coord),
            id: _getNextFeatureId(),
            long: coord[0],
            lat: coord[1]
            });
        _addFeature(feat);
    }
    
    function _addFeature(feat) {
        meslocalisations.getSource().addFeature(feat);
    }
    
    function _addFeatures(l_feat) {
        meslocalisations.getSource().addFeatures(l_feat);
    }
    
    function _updateFeature(id, nom, categorie, description) {
        feat =_getFeatureById(id);
        feat.set("nom", nom);
        if (categorie!=undefined){
        feat.set("categorie", categorie.getId());
        feat.set("nomcategorie", categorie.getNom()); 
        }
        feat.set("description", description);
    }
    function _deleteFeature(id){
        meslocalisations.getSource().removeFeature(_getFeatureById(id));
    }
    
    function _deleteAllFeatures(){
        meslocalisations.getSource().clear();
    }
    
    function _getFeatureById(id){
        var l_feat = meslocalisations.getSource().getFeatures();
        for (index in l_feat){
            if (l_feat[index].get("id")==id){
                return l_feat[index];
            }
        }
    }
    
    function _getNextFeatureId() {
      let nextid=1;
      var l_feat = meslocalisations.getSource().getFeatures();
      for (index in l_feat) {
          if (l_feat[index].get("id") >= nextid){
          nextid = l_feat[index].get("id") +1;
          }
      }
      return nextid;
    }
    
    
    var _featuresToGeoJSON = function(data) {
        geoJSONFormat = meslocalisations.getSource().getFormat();
        featuresASGeoJSON = geoJSONFormat.writeFeaturesObject (meslocalisations.getSource().getFeatures());
        featuresASGeoJSON['crs']={
            "name" : "EPSG:3857"
        }
        
        return featuresASGeoJSON;
    };
    
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
      _updateStyle('1', style1);
      _updateStyle('2', style2);
      
      var geojsonfile1 = 'apps/dynMapPublic/data/data_test_1.geojson';
      $.get(geojsonfile1, function(data){
        var features = new ol.format.GeoJSON().readFeatures(data);
        _addFeatures(features);
      });
      
      // test suppr categorie
      //setTimeout(function(){ _deleteStyle('categ1'); }, 3000);
      //setTimeout(function(){ _deleteStyle('categ1', true); }, 3000);
      
      console.log("Fin code de test");
      
    /********************************************************/
    /* Fin de code pour les tests                           */
    /********************************************************/
    
    
    return {
        layer: meslocalisations,
        updateStyle: _updateStyle, 
        getFeatureStyle: _getFeatureStyle,
        getAllStyles: _getAllStyles,
        getDefaultStyle: _defaultStyle,
        deleteStyle: _deleteStyle,
        addNewFeature:_addNewFeature,
        addFeature: _addFeature,
        addFeatures: _addFeatures,
        updateFeature: _updateFeature,
        deleteFeature: _deleteFeature,
        deleteAllFeatures: _deleteAllFeatures,
        featuresToGeoJSON: _featuresToGeoJSON
    }
}());



mviewer.customLayers.aires_jeux_rennes= (function() {
    // color : #e45e52 = 'rgba (228, 94, 82, 1)'
    const fillcolor='rgba(228, 94, 82, 0.1)';
    const strokecolor='#e45e52';

    //let pointOnSurfaceMarker='apps/site_internet/customlayer/picture/marker.svg';
    let pointOnSurfaceMarker='apps/site_internet/customlayer/picture/aire_de_jeux.svg';
    
    
    let data_url="https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_mob:gev_ajeu&outputFormat=application/json&srsName=EPSG:3857";
    let filter = "strToLowerCase(espace_publique) = 'oui'";
    
    let complete_url = data_url + '&CQL_FILTER='+ encodeURIComponent(filter);
    
    
    /* - STYLE ------------------------------------- */
    
    /* We are using two different styles for the polygons:
    *  - The first style is for the polygons themselves.
    *  - The second style is to draw a point inside the surface
    */
    const zoomInStyles = [
        new ol.style.Style({
            fill:new ol.style.Fill({
               color: fillcolor,
             }),
            stroke: new ol.style.Stroke({
                color: strokecolor,
                width: 2
              })
        }),
        new ol.style.Style({
            image: new ol.style.Icon({
              //color: strokecolor, 
              opacity: 0.7,
              src: pointOnSurfaceMarker,
            }),
            geometry: function (feature) {
              return feature.getGeometry().getInteriorPoints();
            },
        }),
    ];
    
    /* 
    * Styling only a point inside the surface
    */
    const zoomOutStyles = [
        new ol.style.Style({
            image: new ol.style.Icon({
              //color: strokecolor, 
              src: pointOnSurfaceMarker,
            }),
            geometry: function (feature) {
              return feature.getGeometry().getInteriorPoints();
            },
        }),
    ];
    
    /*
     * Mise en cohérence du style ponctuelles ou surfaciques en fonction du niveau de zoom
     * Le surfacique n'est affiché qu'à partir d'un certain niveau de zoom
     */
    function _updateStyle(){
        //console.log(_map.getView().getZoom());
        if (_map.getView().getZoom() < 15.8) {
            dataLayer.setStyle(zoomOutStyles);
        } else {
            dataLayer.setStyle(zoomInStyles);
        }
        
        if(_map.getView().getZoom() < 16.7){ // niveau de zoom où apparaissent les jeux (consultables). Attention, il faut changer cette valeur si le sld eux_enfants_vdr.sld change
            mviewer.customLayers.aires_jeux_rennes.config.queryable = true;
        } else {
            mviewer.customLayers.aires_jeux_rennes.config.queryable = false;
        }
    }
    
    /*
     * Listener sur niveau de zoom
     */
    _map.getView().on('change', function() {
        _updateStyle();
    });
    
    
    /* - DATA -------------------------------------- */
    
    let dataLayer = new ol.layer.Vector({
        visible: false,
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: () => { // permet d'éviter le bug de features chargées en double 
                fetch(complete_url)
                    .then(r => r.json())
                    .then(r => {
                        // nettoie la layer
                        dataLayer.getSource().clear();
                        // charge les features
                        let features = dataLayer.getSource().getFormat().readFeatures(r)
                        dataLayer.getSource().addFeatures(features);
                    })
            }
        }),
        style: _updateStyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());



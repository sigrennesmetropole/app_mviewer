/*
 *  PARTICULARITE : passage d'une représentation ponctuelle à une représentation surfacique en fonction du niveau de zoom
 */
mviewer.customLayers.vergers= (function() {
    
    var data = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:gev_verger_partage&outputFormat=application/json&srsName=EPSG:4326';
    /*
     * POINT : Source qui stocke les features ponctuelles / vierge
     */
    let pointSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
    });
    
    /*
     * POINT : représentation des features ponctuelles
     */
    function pointStyle() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#ba8e02',  //ba8e02
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    /*
     * SURF : Source qui stocke les features ponctuelles / données surfaciques chargées par l'appel au service WFS
     */
    let surfaceSource = new ol.source.Vector({
        url: data,
        format: new ol.format.GeoJSON(),
    });
    
    /*
     * SURF : représentation des features ponctuelles
     */
    function surfaceStyle() {
        let style = new ol.style.Style({
                fill: new ol.style.Fill({
                  color: '#ba8e02', //318073
                }),
              });
        return [style];
    }
    
    
    /*
     * Définition de la couche
     */
    let customLayer = new ol.layer.Vector({
        source: surfaceSource,
        style: surfaceStyle,
    });
    
    
    /*
     * Population de la source poinctuelle / exécutée une seule fois
     */
    customLayer.once('prerender', function() {
        let features = customLayer.getSource().getFeatures();
        features.forEach(function(feature){
            let pointGeom = new ol.geom.Point(ol.extent.getCenter(feature.getGeometry().getExtent()));
            let newFeature = new ol.Feature();
            newFeature.setProperties(feature.getProperties());
            newFeature.setGeometry(pointGeom);
            pointSource.addFeature(newFeature);
        });
        _updateStyle();
    });
    
    /*
     * Listener sur niveau de zoom
     */
    _map.getView().on('change', function() {
        _updateStyle();
    });
    
    /*
     * Mise en cohérence des données ponctuelles ou surfaciques en fonction du niveau de zoom
     */
    function _updateStyle(){
        if (_map.getView().getZoom() < 16) {
            customLayer.setSource(pointSource);
            customLayer.setStyle(pointStyle);
        } else {
            customLayer.setSource(surfaceSource);
            customLayer.setStyle(surfaceStyle);
        }
    }
    
    return {
        layer: customLayer,
    }
}());



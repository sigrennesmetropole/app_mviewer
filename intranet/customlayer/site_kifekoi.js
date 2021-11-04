
mviewer.customLayers.site_kifekoi= (function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idsite=urlParams.get('idsite');
    
    function getURL(){
        let base_url = "https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_site&outputFormat=application/json&srsName=EPSG:4326";
        
        if (idsite != undefined && idsite.trim()!='') {
            console.log('FILTRE SUR IDSITE');
            // rechercher le site dans la couche des sites
            return base_url + "&cql_filter=etat_site='actif'%20AND%20id_site=" + idsite;
            // rechercher les sites autour ?
        } else {
            console.log('PAS DE DONNEE');
            return null;
        }
    }
    
    function markerStyle(feature) {
        let id_s = feature.get('id_site');
        
        if (idsite != undefined && id_s == idsite) {
            //return featureMarker('#C93991');
            return featureMarker('#FD3F92');
        } else {
            return featureMarker('#7b95a3');
        }
    }
    
    function featureMarker(_color) {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: _color,
                  crossOrigin: 'anonymous',
                  scale:0.03,
                  anchor:[0.5,1],
                  src: 'apps/georm/picture/marker_blanc.svg',
                }),
              })
        ];
    }
    
    function _zoomtoFeature() {
        let evt = dataLayer.once('postrender', function(e) {
            if (dataLayer.getSource().getState() == 'ready') {
                // Zoom To Location
                var feat = dataLayer.getSource().getFeatures()[0];
                if (feat != undefined){
                    let coords = feat.getGeometry().getCoordinates();
                    coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
                    mviewer.zoomToLocation(coords[0], coords[1], 17, null);
                }
            }
        })
    };
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: getURL,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    

    
    
    return {
        layer: dataLayer,
        zoomtoFeature:_zoomtoFeature,
    }
}());

mviewer.customLayers.site_kifekoi.zoomtoFeature();

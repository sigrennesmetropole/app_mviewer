mviewer.customLayers.site_kifekoi= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_site&outputFormat=application/json&srsName=EPSG:3857';
    let markercolor='#c2145b';
    
    
    function pctStyle() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: markercolor,
                  crossOrigin: 'anonymous',
                  scale:1.5,
                  anchor:[0.5,1],
                  src: 'apps/intranet/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: _getURL,
            format: new ol.format.GeoJSON()
        }),
        style: pctStyle,
    });
    
    function _getURL(){
        const urlParams = new URLSearchParams(window.location.search);
        const idsite=urlParams.get('idsite');
        
        if (idsite != undefined && idsite.trim()!='') {
            // rechercher le site dans la couche des sites
            var url = data_url + "&cql_filter=etat_site=%27actif%27%20AND%20id_site=" + idsite;
            return url;
            // rechercher les sites autour ?
        } else {
            console.log('PAS DE DONNEE');
            return null;
        }
    }
    
    function _zoomtoFeature() {
        if (dataLayer.getSource().getState() == 'ready') {
            // Zoom To Location
            var feat = dataLayer.getSource().getFeatures()[0];
            if (feat != undefined){
                let coords = feat.getGeometry().getCoordinates();
                coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
                mviewer.zoomToLocation(coords[0], coords[1], 18, null);
            }
        }
    };
    
    
    // Listen for changes
    dataLayer.getSource().on('change', function(event) {
        _zoomtoFeature();

    });
    
    return {
        layer: dataLayer,
        zoomtoFeature:_zoomtoFeature,
    }
}());

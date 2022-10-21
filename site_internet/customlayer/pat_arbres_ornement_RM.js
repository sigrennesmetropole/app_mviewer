mviewer.customLayers.arbresornement= (function() {
    let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:gev_aorn&outputFormat=application/json&srsName=EPSG:4326&CQL_FILTER=nom_commun IS NOT NULL';
    let datacolor = '#bfbf30';
    
    function markerStyle() {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: datacolor, 
                  crossOrigin: 'anonymous',
                  src: 'apps/site_internet/customlayer/picture/rond_default.svg',
                }),
              })
        ];
    }
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_url,
            format: new ol.format.GeoJSON()
        }),
        style: null,
    });
    
    _map.getView().on('change', function() {
        if (_map.getView().getZoom() >= 16) {
            dataLayer.setStyle(markerStyle);
        } else {
            dataLayer.setStyle(null);
        }
    });
    
    
    return {
        layer: dataLayer,
    }
}());


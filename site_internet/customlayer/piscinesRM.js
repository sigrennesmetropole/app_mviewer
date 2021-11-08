
mviewer.customLayers.piscinesRM= (function() {
    
    let data = 'https://public.sig.rennesmetropole.fr/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=v_sitorg_organisme&outputFormat=application%2Fjson&srsname=EPSG:3857&CQL_FILTER=etat_organisme%3D%27actif%27%20and%20est_organisme_principal%3D%27oui%27%20and%20%28code_nomenclature_principale%3D%279.2.1%27%20or%20code_nomenclature_secondaire%20like%20%27%259.2.1%25%27%29';
    
    let horaires_piscine = '';
    let bassins = '';
    
    function style() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#8FBC8F', 
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    let layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data,
            format: new ol.format.GeoJSON(),
        }),
        style: style,
    });
    
    return {
        layer: layer,
    }
}());



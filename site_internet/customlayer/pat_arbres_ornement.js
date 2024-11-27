mviewer.customLayers.arbresornement= (function() {
    let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:arbre&outputFormat=application/json&srsName=EPSG:4326';

    
    let filter = " \
        <And> \
            <PropertyIsEqualTo> \
                <PropertyName>code_insee</PropertyName> \
                <Literal>35238</Literal> \
            </PropertyIsEqualTo> \
            <PropertyIsEqualTo> \
                <PropertyName>fonction</PropertyName> \
                <Literal>Ornement</Literal> \
            </PropertyIsEqualTo> \
        </And> \
        ";
    let complete_url = data_url + '&filter='+ encodeURIComponent(filter);
    
    
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
            url: complete_url,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    
    return {
        layer: dataLayer,
    }
}());


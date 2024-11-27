mviewer.customLayers.arbresrecents= (function() {
    //let dateref = new Date().getFullYear()-10;
    //let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:v_gev_aali&CQL_FILTER=date_plant>'+ dateref +'&outputFormat=application/json&srsName=EPSG:4326';
    
    let age_min = 0;
    let age_max = 10;
    let daterefmin = new Date().getFullYear() - age_min + "-01-01";
    let daterefmax = new Date().getFullYear() - (age_max-1) + "-01-01";

    
    let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:arbre&outputFormat=application/json&srsName=EPSG:4326';

    
    let filter = " \
        <And> \
            <PropertyIsEqualTo> \
                <PropertyName>code_insee</PropertyName> \
                <Literal>35238</Literal> \
            </PropertyIsEqualTo> \
            <PropertyIsEqualTo> \
                <PropertyName>fonction</PropertyName> \
                <Literal>Alignement</Literal> \
            </PropertyIsEqualTo> \
            <PropertyIsBetween> \
            <PropertyName>date_plantation</PropertyName> \
                <LowerBoundary> \
                    <Literal>"+daterefmax+"</Literal> \
                </LowerBoundary> \
                <UpperBoundary> \
                    <Literal>"+daterefmin+"</Literal> \
                </UpperBoundary> \
            </PropertyIsBetween> \
        </And> \
        ";
    let complete_url = data_url + '&filter='+ encodeURIComponent(filter);
    
    
    
    let datacolor = '#2BE612';
    
    function markerStyle() {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  color: datacolor, 
                  crossOrigin: 'anonymous',
                  //scale:0.1,
                  //anchor:[0.5,1],
                  //src: 'apps/site_internet/customlayer/picture/arbre.svg',
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


mviewer.customLayers.arbresautres= (function() {
    let age_min = 10;
    let age_max = 50;
    let daterefmin = new Date().getFullYear() - age_min + "-01-01";
    let daterefmax = new Date().getFullYear() - (age_max-1) + "-01-01";

    
    let data_url = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:arbre&outputFormat=application/json&srsName=EPSG:4326';

    
    let filter = "";
    filter+="<And>";
    filter+=("  <PropertyIsEqualTo>").trim();
    filter+=("    <PropertyName>code_insee</PropertyName>").trim();
    filter+=("    <Literal>35238</Literal>").trim();
    filter+=("  </PropertyIsEqualTo>").trim();
    filter+=("  <PropertyIsEqualTo>").trim();
    filter+=("    <PropertyName>fonction</PropertyName>").trim();
    filter+=("    <Literal>Alignement</Literal>").trim();
    filter+=("  </PropertyIsEqualTo>").trim();
    filter+=("  <PropertyIsBetween>").trim();
    filter+=("    <PropertyName>date_plantation</PropertyName>").trim();
    filter+=("    <LowerBoundary>").trim();
    filter+=("      <Literal>"+daterefmax+"</Literal>").trim();
    filter+=("    </LowerBoundary>").trim();
    filter+=("    <UpperBoundary>").trim();
    filter+=("      <Literal>"+daterefmin+"</Literal>").trim();
    filter+=("    </UpperBoundary>").trim();
    filter+=("  </PropertyIsBetween>").trim();
    filter+="</And>";
    let complete_url = data_url + '&filter='+ encodeURIComponent(filter);
    
    let datacolor = '#DCEAAE'
    
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


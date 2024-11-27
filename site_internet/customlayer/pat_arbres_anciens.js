mviewer.customLayers.arbresanciens= (function() {
    let age_min = 50;
    let age_max = 1000;
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
    
    filter+=("  <Or>").trim();
    filter+=("    <PropertyIsBetween>").trim();
    filter+=("      <PropertyName>date_plantation</PropertyName>").trim();
    filter+=("      <LowerBoundary>").trim();
    filter+=("        <Literal>"+daterefmax+"</Literal>").trim();
    filter+=("      </LowerBoundary>").trim();
    filter+=("      <UpperBoundary>").trim();
    filter+=("        <Literal>"+daterefmin+"</Literal>").trim();
    filter+=("      </UpperBoundary>").trim();
    filter+=("    </PropertyIsBetween>").trim();
    filter+=("    <PropertyIsNull>").trim();
    filter+=("      <PropertyName>date_plantation</PropertyName>").trim();
    filter+=("    </PropertyIsNull>").trim();
    filter+=("  </Or>").trim();
    filter+="</And>";
    let complete_url = data_url + '&filter='+ encodeURIComponent(filter);
    
    let datacolor = '#628A31'
    
    
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
    
/*    function rondStyle() {
        let style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: '#407403',
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: 0.5,
                    opacity: '80%',
                })
            })
        });
        return [style];
    }
*/
    
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: complete_url,
            format: new ol.format.GeoJSON()
        }),
        style: markerStyle,
    });
    
    // 02/01/2023 : demande de retrait de la phrase de complément
    /*
    dataLayer.once('prerender', function() {
        console.log("COMPLEMENT ARBRES ANCIENS");
        let features = dataLayer.getSource().getFeatures();
        features.forEach(function(feature){
            feature.set("complement", "Un arbre ancien a été planté il y a plus de " + age_ancien + " ans");
        });
    });
    */
    return {
        layer: dataLayer,
    }
}());

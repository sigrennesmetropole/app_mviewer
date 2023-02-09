
mviewer.customLayers.balades_points = (function() {
    
    var data_poi;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", this.API.config, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(allText,"text/xml");
                var layers = xmlDoc.getElementsByTagName("layer");
                var i = 0;
                while (i < layers.length){
                    if (layers[i].getAttribute('url') === "apps/balades/customlayer/balades_points.js"){
                        data_poi = layers[i].getAttribute('geojson');
                        break;
                    }
                    i++;
                }
            }
        }
    }
    rawFile.send(null);
    
    function baladeStyle_pct() {
    // style d'une couche ponctuelle
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  color: '#ba8e02',  
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }
    
    
    let POILayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            // url: data_poi,
            loader: () => { // permet d'éviter le bug de features chargées en double 
                fetch(data_poi)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features équipements et autres projets"); // ==> Exécuté 2x parfois
                        // nettoie la layer
                        POILayer.getSource().clear();
                        // charge les features
                        let features = POILayer.getSource().getFormat().readFeatures(r);

                        // Si le système de projection n'est pas EPSG:3857, il faut le transformer
                        if (r.crs.properties.name !== "urn:ogc:def:crs:EPSG::3857") {
                            features.forEach(f => {
                                f.getGeometry().transform(r.crs.properties.name, "EPSG:3857");
                                console.log(r.crs.properties.name);
                            });
                        }
                        
                        POILayer.getSource().addFeatures(features);
                    })
                }
        }),
        style: baladeStyle_pct,
    });
    
    return {
        layer: POILayer,
    }
}());



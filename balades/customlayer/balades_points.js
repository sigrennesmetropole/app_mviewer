
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
            url: data_poi,
            format: new ol.format.GeoJSON(),
        }),
        style: baladeStyle_pct,
    });
    
    return {
        layer: POILayer,
    }
}());



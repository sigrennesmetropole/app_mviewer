
mviewer.customLayers.balades = (function() {
    
    var data_bal;
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
                    if (layers[i].getAttribute('url') === "apps/balades/customlayer/balades.js"){
                        data_bal = layers[i].getAttribute('geojson');
                        break;
                    }
                    i++;
                }
            }
        }
    }
    rawFile.send(null);
    
    function baladeStyle_lin() {
    // style d'une couche linéaire
        let style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                        color: "#E740D5",
                        lineCap: "butt",
                        width: 7,
                        }),
              });
        return [style];
    }
    
    let baladeslayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data_bal,
            format: new ol.format.GeoJSON(),
        }),
        style: baladeStyle_lin,
    });
    
    return {
        layer: baladeslayer,
    }
}());



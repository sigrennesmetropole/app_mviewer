
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
            format: new ol.format.GeoJSON(),
            // url: data_bal,
            loader: () => { // permet d'éviter le bug de features chargées en double 
                fetch(data_bal)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features équipements et autres projets"); // ==> Exécuté 2x parfois
                        // nettoie la layer
                        baladeslayer.getSource().clear();
                        // charge les features
                        let features = baladeslayer.getSource().getFormat().readFeatures(r);

                        // Si le système de projection n'est pas EPSG:3857, il faut le transformer
                        if (r.crs.properties.name !== "urn:ogc:def:crs:EPSG::3857") {
                            features.forEach(f => {
                                f.getGeometry().transform(r.crs.properties.name, "EPSG:3857");
                                console.log(r.crs.properties.name);
                            });
                        }

                        baladeslayer.getSource().addFeatures(features);
                    })
                }
        }),
        style: baladeStyle_lin,
    });
    
    return {
        layer: baladeslayer,
    }
}());



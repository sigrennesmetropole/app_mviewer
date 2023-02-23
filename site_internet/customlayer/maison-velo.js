
mviewer.customLayers.maison_velo= (function() {
    let data_url='https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_poi:v_sitorg_organisme&outputFormat=application/json&srsname=EPSG:3857';
    let l_id_org=[5607];
    let svgmarker = 'https://public.sig.rennesmetropole.fr/ressources/app/georchestra/svg/eq_poi/logoMDV.svg';
    //let svgmarker = 'apps/site_internet/customlayer/picture/logoMDV.svg';
    //let svgmarker = 'http://localhost/mviewer-RM-master/apps/site_internet/customlayer/picture/logoMDV.svg';
    
    let html_img = document.createElement('img');
    html_img.src = svgmarker;
    
    let pctStyle = new ol.style.Style({
        image: new ol.style.Icon({
          crossOrigin: 'anonymous',
          scale:0.1,
          anchor:[0.5,0.5],
          src: svgmarker,
        }),
      });
      

      
    let dataLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: () => { // permet d'éviter le bug de features chargées en double 
                const urlData = data_url + '&CQL_FILTER=id_organisme%20IN%20%28' + l_id_org.join('%2C') + '%29';
                fetch(urlData)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features maison_velo"); // ==> Exécuté 2x parfois
                        // nettoie la layer
                        mviewer.getLayer("maison_velo").layer.getSource().clear();
                        // charge les features
                        let features = dataLayer.getSource().getFormat().readFeatures(r)
                        dataLayer.getSource().addFeatures(features);
                    })
                }
        }),
        style: pctStyle,
    });
    

    /*
    // code utile pour génération automatique de la légende
    // ne fonctionne pas avec les images
    let _legend = { items: [] };
    _legend.items.push({ styles: [pctStyle], label: "La maison du vélo", geometry: "Point" });
    */
    return {
        layer: dataLayer,
        //legend: _legend,
    }
}());



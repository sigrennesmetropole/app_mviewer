mviewer.customLayers.urbadiffus_en_etude= (function() {
    const fillcolor='#B35205';
    const basestrokecolor='#f1f1ef';
    let _basemarker='apps/site_internet/customlayer/picture/travaux.svg';
    var _outsidemarker='';
    let _insidemaker='';
    
    const nb_logements_min=10;
    let data_url="https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=app:tabou_v_oa_programme&outputFormat=application/json&srsName=EPSG:3857";
    //let filter = "commune='Rennes' AND nature = 'En diffus' AND diffusion_restreinte=false AND etape='En étude' AND (nb_logements >= " + nb_logements_min + " OR num_ads IS NOT NULL)";
    let filter = "commune LIKE '%Rennes%' AND nature = 'En diffus' AND diffusion_restreinte=false AND etape='En étude' AND (nb_logements >= " + nb_logements_min + " OR nb_logements IS NULL OR nb_logements = 0)";
    
    let complete_url = data_url + '&CQL_FILTER='+ encodeURIComponent(filter);
    
    
    /* - STYLE ------------------------------------- */
    /* We are using two different styles for the polygons:
    *  - The first style is for the polygons themselves.
    *  - The second style is to draw a point inside the surface
    */
    
    /*
    * Prepare icons with different colors
    */
     function calculateStyleIcon(){
        var name,xhr;
        // on est prêt à récupérer le svg sur le serveur
        xhr=new XMLHttpRequest;
        xhr.onreadystatechange=function() {
            if (this.readyState==4 && this.status==200) {
                let s=this.responseText;
                
                var s1 = s.replace('stroke:#020203', 'stroke:'+basestrokecolor);
                s1 = s1.replace('fill:#fff', 'fill:'+fillcolor);
                
                // le svg est arrivé
                var parser = new DOMParser();
                var doc1 = parser.parseFromString(s1, "image/svg+xml");
                var doc2 = parser.parseFromString(s, "image/svg+xml");
                
                _outsidemarker = 'data:image/svg+xml;utf8, ' + encodeURIComponent(doc1.getElementsByTagName("svg")[0].outerHTML);
                _insidemaker = 'data:image/svg+xml;utf8, ' + encodeURIComponent(doc2.getElementsByTagName("svg")[0].outerHTML);
            }
        };
        xhr.open('get',_basemarker); 
        xhr.send();
    }
    
    
    /*
    * Style when polygon is visible
    */
    function zoomInStyles() {
        return [
            new ol.style.Style({
                fill:new ol.style.Fill({
                   color: fillcolor,
                 }),
                stroke: new ol.style.Stroke({
                    color: '#000000',
                    width: 2
                  })
            }),
            new ol.style.Style({
                image: new ol.style.Icon({
                  //color: '#000000', 
                  opacity: 0.7,
                  anchor:[0.5,0.5],
                  src: _insidemaker,
                }),
                geometry: function (feature) {
                  return feature.getGeometry().getInteriorPoints();
                },
            }),
        ];
    }
    
    /* 
    * Styling only a point inside the surface (polygon is hidden)
    */
    function zoomOutStyles () {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  //color: fillcolor, 
                  anchor:[0.5,0.5],
                  src: _outsidemarker,
                }),
                geometry: function (feature) {
                  return feature.getGeometry().getInteriorPoints();
                },
            }),
        ];
    }
    
    /*
     * Mise en cohérence du style ponctuelles ou surfaciques en fonction du niveau de zoom
     * Le surfacique n'est affiché qu'à partir d'un certain niveau de zoom
     */
    function _updateStyle(){
        if (_map.getView().getZoom() < 16) {
            dataLayer.setStyle(zoomOutStyles());
        } else {
            dataLayer.setStyle(zoomInStyles());
        }
    }
    /*
     * Listener sur niveau de zoom
     */
    _map.getView().on('change', function() {
        _updateStyle();
    });
    
    calculateStyleIcon();

/* - DATA -------------------------------------- */
    function cleanData(){
        // suppression des programmes qui n'ont pas de descriptif
        dataLayer.getSource().forEachFeature((feature) => {
            if (!feature.get("description") || feature.get("description") == 'undefined' || feature.get("description").replace(/ [\s\r\n]+/gm, "").trim() == '' ) {
                dataLayer.getSource().removeFeature(feature);
            }  
        });
        //_updateStyle();
    }
    
    let dataLayer = new ol.layer.Vector({
        visible: false,
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            loader: () => { // permet d'éviter le bug de features chargées en double 
                fetch(complete_url)
                    .then(r => r.json())
                    .then(r => {
                        // nettoie la layer
                        mviewer.getLayer("urbadiffus_en_etude").layer.getSource().clear();
                        // charge les features
                        let features = dataLayer.getSource().getFormat().readFeatures(r)
                        dataLayer.getSource().addFeatures(features);
                    }).then(r => {cleanData();})
            }
        }),
        style: _updateStyle,
    });
    
    
    return {
        layer: dataLayer,
    }
}());



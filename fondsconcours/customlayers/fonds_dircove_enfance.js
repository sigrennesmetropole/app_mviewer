
mviewer.customLayers.dircove_enfance= (function() {
    
    let _flux = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=eq_autres:fonds_concours_dircove&outputFormat=application/json&srsName=EPSG:3857';
    let _filtre_data = encodeURI("nature_equipement='1 - Projets petite enfance- scolaire - périscolaire'");
    let data = _flux + '&CQL_FILTER=' + _filtre_data;

    let markercolor = '#f78b12';
    let svgIcon='apps/fondsconcours/img/marqueurs/DIRCOVE-03.svg';
    let svgEcusson='';
    
    
    /* représentation avec icone svg */
    let _marker = 'apps/fondsconcours/img/marqueurs/marker.svg';
    let _markerEcoB = 'apps/fondsconcours/img/marqueurs/marker.svg';
    let _ecussonEcoB = 'apps/fondsconcours/img/écusson1.svg';
    let iconwidth = '30px';
    let iconheight = '30px';
    
    function _markerStyle(feature) {
        if (feature.get('ecobonus') && feature.get('ecobonus')=='Oui') {
            return _featureMarker(_markerEcoB);
        } else {
            return _featureMarker(_marker);
        } 
    }
    
    function _featureMarker(_marker) {
        return [
            new ol.style.Style({
                image: new ol.style.Icon({
                  anchor:[0.5,0.5],
                  src: _marker,
                })
            })
        ];
    }
    
    
    
    // calcul du code du marqueur avec macaron
    function calculateStyleIcon(){
        var name,xhr;
        // on est enfin prêt à récupérer le svg sur le serveur
        xhr=new XMLHttpRequest;
        xhr.onreadystatechange=function() {
            if (this.readyState==4 && this.status==200) {
                let s=this.responseText;
                // le svg est arrivé
                // on lui impose une taille
                var parser = new DOMParser();
                var doc = parser.parseFromString(s, "image/svg+xml");
                doc.getElementsByTagName("svg")[0].setAttribute('width', iconwidth);
                doc.getElementsByTagName("svg")[0].setAttribute('height', iconheight);
                doc.getElementsByTagName("svg")[0].setAttribute('x', '0px');
                doc.getElementsByTagName("svg")[0].setAttribute('y', '0px');
                //console.log("SVG =" +doc.getElementsByTagName("svg")[0].outerHTML);
                // on applique le svg au style
                _marker = 'data:image/svg+xml;utf8, ' + encodeURIComponent(doc.getElementsByTagName("svg")[0].outerHTML);
                
                let _g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                _g.setAttributeNS(null, "transform", "matrix(0.1493328,-0.06033437,0.05884351,0.14564281,46.023617,11.313834)");
                while (svgEcusson.firstChild){
                    _g.appendChild(svgEcusson.firstChild);
                }
                doc.getElementsByTagName("svg")[0].appendChild(_g);
                //console.log(doc.getElementsByTagName("svg")[0].outerHTML);
                _markerEcoB = 'data:image/svg+xml;utf8, ' + encodeURIComponent(doc.getElementsByTagName("svg")[0].outerHTML);
                
                
            }
        };
        xhr.open('get',svgIcon); 
        xhr.send();
    }
    
    function _getEcussonCode(){
        var svgCode='';
        var name,xhr;
        // on est enfin prêt à récupérer le svg sur le serveur
        xhr=new XMLHttpRequest;
        xhr.onreadystatechange=function() {
            if (this.readyState==4 && this.status==200) {
                let s=this.responseText;
                // on lui impose une taille
                var parser = new DOMParser();
                var doc = parser.parseFromString(s, "image/svg+xml");
                svgEcusson = doc.getElementsByTagName("svg")[0];
            }
        };
        xhr.open('get',_ecussonEcoB); 
        xhr.send();
    }
    _getEcussonCode();
    calculateStyleIcon();
    
    
    let _layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            //url: data,
            format: new ol.format.GeoJSON(),
            loader: () => { // permet d'éviter le bug de features chargées en double 
                fetch(data)
                    .then(r => r.json())
                    .then(r => {
                        //console.log("Load features "); // ==> Exécuté 2x parfois
                        // nettoie la layer
                        _layer.getSource().clear();
                        // charge les features
                        let features = _layer.getSource().getFormat().readFeatures(r);
                        _layer.getSource().addFeatures(features);
                    })
                }
        }),
        style:_markerStyle,
    });
    
    
    return {
        layer: _layer,
    }
}());




mviewer.customLayers.dircove_autres= (function() {
    
    var data = 'apps/fondsconcours/customlayers/data/dircove_autres.geojson';
    var markercolor = '#dd3627';
    let svgIcon='apps/fondsconcours/img/marqueurs/DIRCOVE-02.svg';
    let svgEcusson='';
    
    /* représentation avec icone svg */
    let _marker = 'apps/fondsconcours/img/marqueurs/marker.svg';
    let _markerEcoB = 'apps/fondsconcours/img/marqueurs/marker.svg';
    let _ecussonEcoB = 'apps/fondsconcours/img/écusson1.svg';
    let iconwidth = '30px';
    let iconheight = '30px';
    
    function _markerStyle(feature) {
        if (feature.get('ecobonus')) {
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
                /*
                // proposition 1
                let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                circle.setAttributeNS(null, "style", "fill:#628a31;fill-opacity:0;stroke:#2F7A15;stroke-width:8;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1");
                circle.setAttributeNS(null, "cx", "59.467434");
                circle.setAttributeNS(null, "cy", "59.393097");
                circle.setAttributeNS(null, "r", "55");
                */
                /*
                // proposition 2
                let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
                circle.setAttributeNS(null, "style", "fill:#4dbd40;fill-opacity:0.8;stroke:#ffffff;stroke-width:3.44903;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1");
                circle.setAttributeNS(null, "cx", "92.917862");
                circle.setAttributeNS(null, "cy", "25.273661");
                circle.setAttributeNS(null, "r", "20");
                doc.getElementsByTagName("svg")[0].appendChild(circle);
                _markerEcoB = 'data:image/svg+xml;utf8, ' + encodeURIComponent(doc.getElementsByTagName("svg")[0].outerHTML);
                */
                // proposition 3
                let _g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                _g.setAttributeNS(null, "transform", "matrix(0.1493328,-0.06033437,0.05884351,0.14564281,46.023617,11.313834)");
                while (svgEcusson.firstChild){
                    _g.appendChild(svgEcusson.firstChild);
                }
                doc.getElementsByTagName("svg")[0].appendChild(_g);
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
            url: data,
            format: new ol.format.GeoJSON(),
        }),
        style: _markerStyle,
    });
    
    
    return {
        layer: _layer,
    }
}());



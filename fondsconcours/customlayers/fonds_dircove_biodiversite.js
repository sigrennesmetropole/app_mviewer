
mviewer.customLayers.dircove_biodiv= (function() {
    
    let data = 'apps/fondsconcours/customlayers/data/dircove_biodiversite.geojson';
    let markercolor = '#f78b12';
    let svgIcon='apps/fondsconcours/img/marqueurs/DIRCOVE-05.svg';
    
    /* représentation avec icone svg */
    let _marker = 'apps/fondsconcours/img/marqueurs/marker.svg';
    let iconwidth = '30px';
    let iconheight = '30px';
    
    var _style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: markercolor,
            }),
            stroke: new ol.style.Stroke({
                color: '#FFFFFF',
                width: 0.2
            })
        })
    });
    
    function _svgStyle() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  anchor:[0.5,0.5],
                  src: _marker,
                })
              });
        
        return [style];
    }
    
    
    let _layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: data,
            format: new ol.format.GeoJSON(),
        }),
        //style: _style,
        style: _svgStyle,
    });
    
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
            }
        };
        xhr.open('get',svgIcon); 
        xhr.send();
    }
    
    _layer.once('prerender',() =>{
        calculateStyleIcon();
    });
    
    /*
    _layer.getSource().on('change',() =>{
        if (_layer.getSource().getFeatures().length > 0) {
            console.log("Modification features couche BIODIV :" + _layer.getSource().getFeatures().length);
        }
    });
    */
    
    return {
        layer: _layer,
    }
}());



/**
* Ajoute automatiquement le fond de plan orthophoto à toutes les cartes qui en ont besoin
* l'option "visible = true" permet d'indiquer si ce fond de plan est affiché par défaut
**/

var _layer = "raster:ortho2021";
var _metadata = "https://public.sig.rennesmetropole.fr/geonetwork/srv/fre/catalog.search#/metadata/b5b958de-9407-4822-9ca5-abb1c57659b7";


// construction du baselayer
var ortho = {
    id:"orthophoto",
    visible:"false",
    thumbgallery:"apps/public/img/basemap/ortho.jpg",
    title:"Rennes Metropole",
    label:"Vue aérienne",
    type:"WMTS",
    url:"https://public.sig.rennesmetropole.fr/geowebcache/service/wmts?",
    format:"image/jpeg", 
    style:"_null",
    matrixset:"EPSG:3857",
    fromcapacity:"false",
    maxzoom:"22",
    maxscale:"1000"
};

ortho.layers=_layer;
ortho.attribution = "&lt;a href=&quot;" + _metadata + "&quot; target=&quot;_blank&quot; &gt;Rennes Métropole&lt;/a&gt;";

function isBLVisible(conf){
    if (conf.visible && conf.visible=="true"){return true;} else {return false;}
}

function showorthothumb() {
    $("#backgroundlayersbtn").css("background-image", 'url("'+ortho.thumbgallery+'")');
    if (!configuration.getConfiguration().mobile) {
        $("#backgroundlayersbtn").attr("data-original-title", ortho.label);
        $("#backgroundlayersbtn").tooltip('hide').tooltip({
            placement: 'top',
            trigger: 'hover',
            html: true,
            container: 'body',
            template: mviewer.templates.tooltip
        });
    }
}

function addBaseLayer() {
    if(!mviewer.events().confLoaded) {//we want it to match
        setTimeout(addBaseLayer, 50);//wait 50 millisecnds then recheck
        return;
    }
    
    // Liste des baselayers dans le fichier de configuration
    var l_bl = configuration.getConfiguration().baselayers.baselayer;
    
    // Vérifier que la couche n'existe pas déjà
    let dejapresent = false;
    for(var i= 0; i < l_bl.length; i++) {
        if (l_bl[i].id == ortho.id){
            dejapresent = true;
            return;
        }
    }
    
    //chercher option visible de l'extension
    var l_ext = configuration.getConfiguration().extensions.extension;
    if (l_ext.length){ // si plusieurs extensions
        for(var i= 0; i < l_ext.length; i++) {
            if (l_ext[i].src && l_ext[i].src.includes("addOrthophotoBaselayer.js")){
                ortho.visible = isBLVisible(l_ext[i]);
                break;
            }
        }
    } else { // une seule extension qui est celle-ci
        ortho.visible = isBLVisible(l_ext);
    }
    
    // déclaration de la baselayer dans l'objet configuration
    l_bl.push(ortho);
    
    //creation de la baselayer dans le mviewer
    mviewer.createBaseLayer(ortho);
    // on déplace la couche en tête du tableau des couches pour qu'elle reste en fond
    _map.getLayers().insertAt(0,_map.getLayers().pop());
    // ajout du basemap dans le composant de sélection de fond de plan
    if (configuration.getConfiguration().baselayers.style === "gallery") {
        $("#basemapslist").append(Mustache.render(mviewer.templates.backgroundLayerControlGallery, ortho));
        if (!ortho.visible){
            var elem = $("#"+ortho.id+"_btn").parent();
            elem.addClass("no-active");
            mviewer.bgtoogle();
        }
    } 
    if (ortho.visible){// activer la couche si besoin
        mviewer.setBaseLayer(ortho.id);
    } else {
        if (l_bl.length == 2 ){ // ie orthophoto est le fond de plan proposé en second
            showorthothumb();
        }
    }
}

addBaseLayer();



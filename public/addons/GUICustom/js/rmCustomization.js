var mapOptions;
var configurationTheme;
var layers;



var init = function () {

    mapOptions = configuration.getConfiguration().mapoptions;
    configurationTheme = _getThemesConfiguration();

    layers = mviewer.getLayers();

    if (mapOptions.minzoom != null) {
        mviewer.getMap().getView().setMinZoom(parseFloat(mapOptions.minzoom));
    }

    // layers configuration
    for (const layer in layers) {
        configurationTheme.forEach(function (theme) {
            if (typeof theme.layer !== 'undefined') {
                theme.layer.forEach(function (confLayer) {
                    if (layers[layer].layername === confLayer.id) {
                        
                        // affichage d'un tooltip sur couche WMS
                        // ne fonctionne pas 
                        if (confLayer.tooltipWMS === "true") {
                            layers[layer].tooltipWMS = true;
                            layers[layer].tooltipWMSContent = confLayer.tooltipWMSContent;
                        } else {
                            layers[layer].tooltipWMS = false;
                            layers[layer].tooltipWMSContent = '';
                        }

                        // suppression de l'option de réglage d'opacité (propriété de couche disableOpacity)
                        // non utilisé
                        if (confLayer.disableOpacity === "true") {
                            _disableLayerOpacity(confLayer.id);
                            $(document).on('click', function () {
                                _disableLayerOpacity(confLayer.id);
                            });
                        }
                        
                        // ajout d'une icone de couche dans la toc (propriété de couche iconName)
                        // non utilisé
                        if (typeof confLayer.iconName !== 'undefined') {
                            if (confLayer.iconName.trim() !== '' ) {
                                _addIconToLayerName(layers[layer].layername, confLayer.iconName);
                            }
                        }

                        // Rechargement des données de la couche au click sur la carte (propriété de couche refreshOnClick)
                        if (confLayer.refreshOnClick === 'true') {
                            $(document).on('click', '#map', function () {mviewer.getLayer(layers[layer].id).layer.getSource().updateParams({"time": Date.now()});});
                        }
                    }
                });
            }
        });
     }

     for (const layer in layers) {
        if (layers[layer].tooltipWMS) {
         tooltipWMS.activatetooltipWMS(layers[layer].layername, layers[layer].tooltipWMSContent);
        }
     }
    _waitForRefreshInfoPanel();

};

/**
 * get configuration of node application in configuration file
 */
var getApplicationConfiguration = function () {

    return configuration.getConfiguration().application;

};


/**
 * get configuration of all themes in configuration file
 */
var _getThemesConfiguration = function () {

    return configuration.getConfiguration().themes.theme;

};

/**
 * get configuration of given theme in configuration file
 * @param {*} themeId theme identifier
 */
var getThemeConfiguration = function(themeId) {
    var themesConf = _getThemesConfiguration();
    var res = null;
    themesConf.forEach(function (theme) {
        if ( ('theme-layers-' + theme.id) === themeId) {
            res = theme;
        }
    });
    return res;
};


/**** InterfaceModifying ****/

/**
 * hide opacity set function
 * @param {*} idLayer
 */
function _disableLayerOpacity(idLayer) {
    var layerId = idLayer.replace(':','');
    var layersDetails = $('.mv-layer-details');
     for (var i = 0; i < layersDetails.length; i++) {
        if ( layersDetails[i].dataset.layerid === layerId) {
            var mvLayerOptions = '.mv-layer-details:eq('+ i +') > .mv-layer-options';

            $(mvLayerOptions + ' > .row').hide();
            if ($(mvLayerOptions + '> .row').length === 1) {
                $('.mv-layer-details:eq('+ i +') > .layerdisplay-title > a > span').hide();
            }
        }
    }
};
/**
 * add icon to layer's name on left panel
 * @param {*} layername
 * @param {*} iconContent
 */
function _addIconToLayerName(layername, iconContent) {
    for (var i = 0; i < $('.mv-nav-item').length; i++) {
        if ( $('.mv-nav-item')[i].dataset.layerid === layername.replace(':','') ) {
            var text = $('.mv-nav-item > a')[i].text;
            var newContent = ''
            if (iconContent.endsWith('.bmp') || iconContent.endsWith('.dib') || iconContent.endsWith('.jpg')
                || iconContent.endsWith('.jpeg') || iconContent.endsWith('.jpe') || iconContent.endsWith('.jfif')
                || iconContent.endsWith('.gif') || iconContent.endsWith('.tif')
                || iconContent.endsWith('.tiff') || iconContent.endsWith('.png') || iconContent.endsWith('.ico')) {
                    newContent = '<img src="'+ iconContent +'"><span class="layerText">' + text + '</span>';
            } else if ( iconContent.includes('glyphicon') ) {
                newContent = '<span class="layersIconGlyphicon '+ iconContent +'" aria-hidden="true"></span><span class="layerText">' + text + '</span>';
            } else if ( iconContent.startsWith('fa') ) {
                newContent = '<i class="'+ iconContent +' mr-1"></i>' + '<span class="layerText">' + text + '</span>';
            }
            var modifiedContent =  $('.mv-nav-item > a')[i].innerHTML.replace(text, newContent);
            $('.mv-nav-item > a')[i].innerHTML = modifiedContent;
            $(document).on('click', '#menu', function () {
                $('.layerText').removeClass('mv-unchecked');
                $('.layerText').removeClass('mv-checked');
                $('.layersIconGlyphicon').removeClass('mv-unchecked');
                $('.layersIconGlyphicon').removeClass('mv-checked');
            });
        }
    }
};


const _modifiedMenu = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.type === 'attributes') {
            _refreshInfoPanel();
            break;
        }
    }
};

var _event = null;
function _waitForRefreshInfoPanel() {
    mviewer.getMap().on('singleclick', function (evt) {
        _event = evt;
    });
    
    const observer = new MutationObserver(_modifiedMenu);
    $("#menu span.state-icon").each(function () {
        observer.observe(this, { attributeFilter : ["class"] });
    });
};


function _refreshInfoPanel() {
    if (_event == null) {
        let _coordinates=_map.getView().getCenter();
        /*if(mviewer.getMarker()!= 'undefined'){
            _coordinates = mviewer.getMarker().getPosition();
        }*/
        _event = {
            coordinate: _coordinates,
            pixel: _map.getPixelFromCoordinate(_coordinates)
        };
    }
    setTimeout( function() {
        info.queryMap(_event);
        const refreshPanelsEvent = new CustomEvent('refresh-panels', {});
        document.dispatchEvent(refreshPanelsEvent);
    },250);
}


/********************************/


init();

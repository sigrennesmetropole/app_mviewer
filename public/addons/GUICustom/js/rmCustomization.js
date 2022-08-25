
/*
    proj4.defs([
        ["EPSG:4326", "+title=WGS 84, +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"],
        ["EPSG:3857", "+title=Web Spherical Mercator, +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"],
        ["EPSG:900913", "+title=Web Spherical Mercator, +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"],
        ["EPSG:3948", "+proj=lcc +lat_1=47.25 +lat_2=48.75 +lat_0=48 +lon_0=3 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
    ]);
*/

    var mapOptions;
    var configurationTheme;
    var layers;

    //var layerDisplayOpacity = [];



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
        
        
        document.addEventListener('map-ready', function(){console.log("INIT LEGENDE");});
        
    //    const observer = new MutationObserver(_modifiedLegend);
    //    observer.observe(document.getElementById('layers-container'), { childList: true });

        _refreshInfoPanel();

    };


    function getInfoPanels () {
        var infoPanels = [];
        layers = mviewer.getLayers();
        for (const layer in layers) {
            configurationTheme.forEach(function (theme) {
                if (typeof theme.layer !== 'undefined') {
                    theme.layer.forEach(function (confLayer) {
                        if (layers[layer].layername === confLayer.id) {
                            var addInfoPanel = true;
                            for (var i =0; i < infoPanels.length; i++) {
                                if (infoPanels[i] === layers[layer].infospanel) {
                                    addInfoPanel = false;
                                }
                            }
                            if (addInfoPanel) {
                                infoPanels.push(layers[layer].infospanel);
                            }
                        }
                    });
                }
            });
         }
        return infoPanels;
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


/**** InterfaceModifying ****************************/
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

    function _refreshInfoPanel() {
        var event = null;
        mviewer.getMap().on('singleclick', function (evt) {
            event = evt;
        });
        $('#menu').click(function () {

            var infoPanels = getInfoPanels();

            var activeRefresh = false;
            infoPanels.forEach(function (panelId) {
                if ( $('#' + panelId).hasClass('active') ) {
                    activeRefresh = true;
                }
            });
            if (activeRefresh) {
                if (event == null) {
                    event = {
                        coordinate:mviewer.getMarker().getPosition(),
                        pixel: _map.getPixelFromCoordinate(mviewer.getMarker().getPosition())
                    };
                }
                setTimeout( function() {
                    refreshResultsNumber();
                    info.queryMap(event);
                },250);
            }
         });
    };
    
    
    
/********************************/


init();

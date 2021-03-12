var interfaceModifying = (function () {

    /**
     * hide opacity set function
     * @param {*} idLayer 
     */
    var disableLayerOpacity = function(idLayer) {
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
    var addIconToLayerName = function (layername, iconContent) {
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
    /**
     * set tab position to first in description form panel
     */
    var setTabFirstPosition = function () {
        if (typeof $('#'+ panelFicheInfo +'-selector').find('.nav-tabs')[0] !== 'undefined') {
            var panelFicheInfo = '';
            var layerId = '';
            
            rmTools.gatherLayersInformations().forEach( function (LayerInfo) {
            
                if (LayerInfo.tabFirstPosition === "true") {
    
                    panelFicheInfo = LayerInfo.infopanel;
                    layerId = LayerInfo.id2;
    
                }
    
            });
          
            var panelFicheInfoHtml = $('#'+ panelFicheInfo +'-selector').find('.nav-tabs')[0].innerHTML.split('</li>');
            
            var htmlNewOrder = ''
    
            panelFicheInfoHtml.forEach(function (htmlSplit) {
            
                if ( htmlSplit.includes(layerId) ) {
    
                    htmlNewOrder = htmlSplit + '</li>' + htmlNewOrder;
    
                } else {
    
                    htmlNewOrder += htmlSplit.replace('class="active"', 'class=""') + '</li>';
    
                }
    
            });
    
            $('#'+ panelFicheInfo +'-selector').find('.nav-tabs')[0].innerHTML = htmlNewOrder;
    
            var children = $('#'+ panelFicheInfo +'-selector').find('.nav-tabs')[0].children;
    
            $(children[0].children[0].hash).addClass('active');
    
            children[0].className += ' active';
    
            for (var i=1; i < children.length; i++) {
    
                $(children[i].children[0].hash).removeClass('active');
    
            }
        }
    };
    var hideLayerName = function (layerId) {
        for (var i = 0; i < $('.mv-nav-item').length; i++) {
            if ( $('.mv-nav-item')[i].dataset.layerid === layerId ) {
                $('.mv-nav-item')[i].hidden = true;
            }
        }
    };
    var refreshInfoPanel = function() {
        var event = null;
        mviewer.getMap().on('singleclick', function (evt) {
            event = evt;
        });
        $('#menu').click(function () {
       
            var infoPanels = rmOptionsManager.getInfoPaneles();
            
            var activeRefresh = false;
            infoPanels.forEach(function (panelId) {
                // MODIF CBR
                //if ( $('#' + panelId).is(':visible') ) {
                if ( $('#' + panelId).hasClass('active') ) {
                // FIN MODIF CBR
                    activeRefresh = true;
                }
            });
			//if (activeRefresh && event !== null) {
            if (activeRefresh) {
				if (event == null) {
					event = {
                        coordinate:mviewer.getMarker().getPosition(),
                        pixel: _map.getPixelFromCoordinate(mviewer.getMarker().getPosition())
                    };
				}
                info.queryMap(event);
            }
         });
    };
    
    var removeSameTabs = function () {
		var navTabsChildren = $('.nav-tabs')[0].children;
        var ficheInfoTexte = [];
		for (var k = 0; k < navTabsChildren.length; k++) {
            
            var idFicheInfo = navTabsChildren[k].children[0].attributes[2].nodeValue.replace('#', '');
            if ( !(ficheInfoTexte.includes(  $('#' + idFicheInfo).text() )) ) {
                ficheInfoTexte.push( $('#' + idFicheInfo).text() );
            } else {
                $('#' + idFicheInfo).hide();
                navTabsChildren[k].style.display = 'none';
            }
        }
      
        if ( $('.nav-tabs').children().filter(":visible").length === 1) {
            $('.nav-tabs').removeClass('multiple');
            $('.nav-tabs').children().filter(":visible")[0].className = $('.nav-tabs').children().filter(":visible")[0].className.replace('active','');
        } else if ( $('.nav-tabs').children().filter(":visible").length > 1) {
            $('.nav-tabs').addClass('multiple');
        }
    };
    var getColorBack = function (sld) {
        var color = 'not-def';
        if (sld) {
            if (sld.indexOf('bleu') != -1) {
                color = 'goutte_bleu';
            } else if (sld.indexOf('vert-eau') != -1) {
                color = 'goutte_vert-eau';
            } else if (sld.indexOf('vert') != -1) {
                color = 'goutte_vert';
            } else if (sld.indexOf('violet') != -1){
                color = 'goutte_violet';
            } else if (sld.indexOf('rouge') != -1){
                color = 'goutte_rouge';
            } else if (sld.indexOf('orange') != -1){
                color = 'goutte_orange';
            }
        }
        return color;
    };
    var queryMapModifications = function (html_result, layerid, layerCount, nbItemsSelectedLayer, pos, id, views, panel, name, layerid,
                                            theme_icon, color_back) {
        for (var i = 0; i < html_result.length; i++) {
            // debut modif CT 09/01/2020
            if (typeof layerCount !== 'undefined') {
                if (layerCount.trim().length > 0 && layerCount.replace(':', '') === layerid) {
                    nbItemsSelectedLayer++;
                }
            }
            // fin
            pos++;
            if (i > 0) {
                id = id + i;
            }
            //Set view with layer info & html formated features
            views[panel].layers.push({
                "panel": panel,
                "id": id,
                "firstlayer": (id === 1),
                //"manyfeatures": (features.length > 1),
                //"nbfeatures": features.length,
                "name": name,
                "layerid": layerid,
                "theme_icon": theme_icon,
                "cat_color": color_back,
                "index": pos,
                "html": html_result[i]
            });
        
            if (pos > 1) {
                views[panel].multiple = true;
            } else {
                views[panel].multiple = false;
            }
        }
    };
    var refreshMap = function (layerId) {
        $(document).on('click', '#map', function () {
            mviewer.getLayer(layerId).layer.getSource().updateParams({"time": Date.now()});
         });
    };
     
     return {
        disableLayerOpacity: disableLayerOpacity,
        addIconToLayerName: addIconToLayerName,
        setTabFirstPosition: setTabFirstPosition,
        refreshInfoPanel: refreshInfoPanel,
        hideLayerName: hideLayerName,
        removeSameTabs: removeSameTabs,
        getColorBack: getColorBack,
        queryMapModifications: queryMapModifications,
        refreshMap: refreshMap
     };
})();
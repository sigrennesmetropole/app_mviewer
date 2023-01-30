var searchRM = (function () {

  var searchParameters = [];

  var nbResults = 0;
  var currentRmAutocompleteItem = -1;

  var getPersoConfData;
  var apiRVAKey = '';
  var apiSitesOrgkey = '';

  var previousRequest;
  var communesToRestrict = [];

  var restriction = false;
  var restrictionInsee;
  configuration.getConfiguration().extensions.extension.forEach((item, i) => {
    if(item.restrictCommunes){
      restrictionInsee = item.restrictCommunes;
      restriction = true;
    }
  });
  // var communesTable = [
  //   {insee: '350001', name: 'Acigné'},
  //   {insee: '350022', name: 'Bécherel'},
  //   {insee: '350024', name: 'Betton'},
  //   {insee: '350032', name: 'Bourgbarré'},
  //   {insee: '350039', name: 'Brécé'},
  //   {insee: '350047', name: 'Bruz'},
  //   {insee: '350051', name: 'Cesson-Sévigné'},
  //   {insee: '350055', name: 'Chantepie'},
  //   {insee: '350058', name: 'la Chapelle-Chaussée'},
  //   {insee: '350059', name: 'la Chapelle-des-Fougeretz'},
  //   {insee: '350065', name: 'la Chapelle-Thouarault'},
  //   {insee: '350066', name: 'Chartres-de-Bretagne'},
  //   {insee: '350076', name: 'Chavagne'},
  //   {insee: '350079', name: 'Chevaigné'},
  //   {insee: '350080', name: 'Cintré'},
  //   {insee: '350081', name: 'Clayes'},
  //   {insee: '350088', name: 'Corps-Nuds'},
  //   {insee: '350120', name: 'Gévezé'},
  //   {insee: '350131', name: "l'Hermitage"},
  //   {insee: '350139', name: 'Laillé'},
  //   {insee: '350144', name: 'Langan'},
  //   {insee: '350180', name: 'Miniac-sous-Bécherel'},
  //   {insee: '350189', name: 'Montgermont'},
  //   {insee: '350196', name: 'Mordelles'},
  //   {insee: '350204', name: 'Nouvoitou'},
  //   {insee: '350206', name: 'Noyal-Châtillon-sur-Seiche'},
  //   {insee: '350208', name: 'Orgères'},
  //   {insee: '350210', name: 'Pacé'},
  //   {insee: '350216', name: 'Parthenay-de-Bretagne'},
  //   {insee: '350238', name: 'Rennes'},
  //   {insee: '350240', name: 'le Rheu'},
  //   {insee: '350245', name: 'Romillé'},
  //   {insee: '350250', name: 'Saint-Armel'},
  //   {insee: '350266', name: 'Saint-Erblon'},
  //   {insee: '350275', name: 'Saint-Gilles'},
  //   {insee: '350278', name: 'Saint-Grégoire'},
  //   {insee: '350281', name: 'Saint-Jacques-de-la-Lande'},
  //   {insee: '350315', name: 'Saint-Sulpice-la-Forêt'},
  //   {insee: '350334', name: 'Thorigné-Fouillard'},
  //   {insee: '350351', name: 'le Verger'},
  //   {insee: '350352', name: 'Vern-sur-Seiche'},
  //   {insee: '350353', name: 'Vezin-le-Coquet'},
  //   {insee: '350363', name: 'Pont-Péan'}
  // ];

    var enable = function () {
        $("#searchtool").show();
        // $("#parcelSelectors").show();
        // var configapp = mviewer.customComponents.searchRM;
        // console.log(configapp);

        $.getJSON("apps/public/addons/env.json", function(json) {
          apiRVAKey = json.searchRM[0].apiRVAKey;
          apiSitesOrgkey = json.searchRM[0].apiSitesOrgkey;
        });

        $("#searchtool input").attr("placeholder", mviewer.customComponents.searchRM.config.options.libelles.placeholderRVA);

        if(API.mode !== 'u' && API.mode !== 's'){
          if(screen.width <= 767){
            $('#searchtool').css({'cssText': 'right: -98px;top: 58px'});
            $('#btn-mode-su-menu').css({'cssText': 'top: 142px'});
            $('#zoomtoolbar').css({'cssText': 'top: 142px'});
            $('#toolstoolbar').css({'cssText': 'top: 190px'});
          }
        }

        if(API.mode === 'u'){
          $('#page-content-wrapper').append(
          '<div id="searchresults" class="list-group">' +
            '<div class="searchresults-title">' +
              'Résultats' +
              '<button type="button" class="close">x</button>' +
            '</div>' +
          '</div>'
          );
          $(".background-custom-searchtool").css({'right':'105px'});
          $("#searchresults").css({"right": "50px", "top": "55px"});
          if(screen.width <= 767){
            $('#searchtool').css({'right': '-46px','top': '2px'});
            $('#btn-mode-su-menu').css({'top': '47px'});
            $('#zoomtoolbar').css({'top': '47px'});
            $('#toolstoolbar').css({'top': '140px'});
          }
        }

        $(".searchresults-title .close").click(function () {
            $('#searchresults a').remove();
            $('#searchresults').hide();
            $('#searchfield').val('');
        });

        if(API.mode === 's'){
          $(".background-custom-searchtool").css({'right':'135px'});
          $("#searchresults").css({"right": "47px", "top": "105px"});
          $("#searchtool").css({'right': '35px'});
          if(screen.width <= 767){
            $('#searchtool').css({'cssText': 'right: -149px;top: 58px'});
            $('#btn-mode-su-menu').css({'cssText': 'top: 105px'});
            $('#zoomtoolbar').css({'cssText': 'top: 105px'});
            $('#toolstoolbar').css({'cssText': 'top: 190px'});
          }
        }
        var confdata = _getConfigPerso();
        _configureSearch(confdata);
        getPersoConfData = confdata;
    };

    function _getConfigPerso(){
      var extensions = configuration.getConfiguration().extensions;
      var configPerso;
      for (index in extensions.extension){
          // console.log(extensions.extension[index]);
          configPerso = extensions.extension[index];
          if(extensions.extension[index].id=="searchRM"){
              if (extensions.extension[index].configFile != undefined) {
                  configPerso=extensions.extension[index].configFile;
              } else {
                  console.log("Err : l'attribut configfile du fichier de personnalisation de la recherche est manquant sur l'extension");
              }
          break;
          }
      }
     if (configPerso != 'undefined') {
       return '.' + configPerso;
      }
    }

    //Timer pour attendre la fin de saisie
    var typingTimer;                //timer identifier
    var doneTypingInterval = 100;  //time in ms, 5 seconds for example
    
    var _configureSearch = function (searchRMConf) {
        $.getJSON(searchRMConf, function (confData) {

        // //vérification de la restriction de recherche sur rennes
        // configuration.getConfiguration().extensions.extension.forEach((item, i) => {
        //   if(item.restrictCommunes){
        //     communesTable.forEach((commune, i) => {
        //       item.restrictCommunes.split(',').forEach((restrict, i) => {
        //         if(commune.insee === restrict){
        //           communesToRestrict.push(commune.name);
        //         }
        //       });
        //     });
        //     //s'il y a restriction, restreindre les champs de recherche à la seule commune de Rennes
        //     confData.searchContent.forEach((content) => {
        //       content["citiesSearch"] = communesToRestrict.toString();
        //     });
        //     restriction = true;
        //   }
        // });

            _setSearchParameters(confData);

            $(document).on("keyup", "#searchfield", function (e) {
                if (e.keyCode == 40) { //down arrow keyCode
                    currentRmAutocompleteItem++;
                    if (currentRmAutocompleteItem >= nbResults) {
                        currentRmAutocompleteItem = 0;
                    }
                    var previousItem = currentRmAutocompleteItem - 1;
                    if (previousItem < 0) {
                        previousItem = nbResults -1;
                    }
                    $('#autocompleteRmItem_' + previousItem).removeClass("selectedRmAutocompleteItem");
                    $('#autocompleteRmItem_' + currentRmAutocompleteItem).addClass("selectedRmAutocompleteItem");
                    $('#searchfield').val($('#autocompleteRmItem_' + currentRmAutocompleteItem)[0].innerText);
                    return;
                }
                if (e.keyCode == 38) { // up arrow keyCode
                    currentRmAutocompleteItem--;
                    if (currentRmAutocompleteItem < 0) {
                        currentRmAutocompleteItem = nbResults -1;
                    }
                    var nextItem = currentRmAutocompleteItem + 1;
                    if (nextItem >= nbResults) {
                        nextItem = 0;
                    }
                    $('#autocompleteRmItem_' + nextItem).removeClass("selectedRmAutocompleteItem");
                    $('#autocompleteRmItem_' + currentRmAutocompleteItem).addClass("selectedRmAutocompleteItem");
                    $('#searchfield').val($('#autocompleteRmItem_' + currentRmAutocompleteItem)[0].innerText);
                    return;
                }
                if (e.keyCode == 13 && $('#searchresults a').length > 1) {
                    $('#autocompleteRmItem_' + currentRmAutocompleteItem).trigger('click');
                    return;
                }
                // TODO : mettre une légère attente avant de lancer la recherche
                clearTimeout(typingTimer);
                typingTimer = setTimeout(()=>{lancerRecherche(confData);}, doneTypingInterval);
                /*var chars = $(this).val().length;
                if (chars === 0) {
                } else if ((chars >0) && (chars < 3)) {
                    $("#searchresults .list-group-item").remove();
                } else {
                    _searchRM(confData, $(this).val());
                }
                */
            });

            $(document).on('click', '#searchparameters', function () {
                _searchRM(confData, $(this).val());
            });

        });
    };
    
    //on keyup, start the countdown
    $('#searchfield').on('keyup', function () {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(()=>{lancerRecherche(confData);}, doneTypingInterval);
    });

    //on keydown, clear the countdown 
    $('#searchfield').on('keydown', function () {
      clearTimeout(typingTimer);
    });

    //user is "finished typing," do something
    function lancerRecherche (confData) {
      var chars = $('#searchfield').val().length;
        if (chars === 0) {
        } else if ((chars >0) && (chars < 3)) {
            $("#searchresults .list-group-item").remove();
        } else {
            _searchRM(confData, $('#searchfield').val());
        }
    }

    var _setSearchParameters = function (confData) {
        $('#searchparameters li').hide();
        confData.searchContent.forEach(function (searchElem) {

            var newSearchParameter = '<li class="mv-param-item" onclick="searchRM.toggleParameter(this)">'
            + '<a href="#">'
            +    '<span id="param_search_' + searchElem.categoryName + '" class="state-icon far ';
            if (searchElem.defaultCheck) {
                newSearchParameter += 'mv-checked';
                searchParameters.push('Communes');
            } else {
                newSearchParameter += 'mv-unchecked';
            }
            newSearchParameter += '"></span>'
                +    '<div style="display:inline;">'+ searchElem.searchParameterName +'</div>'
                + '</a>'
            + '</li>';
            $('#searchparameters').append(newSearchParameter);
        });
    };

    var toggleParameter = function (li) {
        var span = $(li).find("span");
        var param = span[0].id.replace('param_search_', '');
        var parameterIndex = searchParameters.indexOf(param);
        if (span.hasClass('mv-unchecked') === true ) {
            span.removeClass('mv-unchecked').addClass('mv-checked');
            if (parameterIndex === -1) {
                searchParameters.push(param);
            }
        } else {
            span.removeClass('mv-checked').addClass('mv-unchecked');
            if (parameterIndex !== -1) {
                searchParameters.splice(parameterIndex, 1);
            }
        }
        $.getJSON(getPersoConfData, function (confData) {
          _searchRM(confData, $('#searchfield').val());
        });
    };

    var _searchRM = function (confData, value) {
        var promises = _getApisRequests(confData, value);
        previousRequest = Promise.all(promises).then(function(allResult) {
            _displayAutocompleteData(allResult, value);
            nbResults = $('.autocompleteRmItem').length;
        });
    };

    var _getApisRequests = function (confData, value) {

      configOptionsValues = mviewer.customComponents.searchRM.config.options;

        var searchItemChecked = $('#searchparameters li a .mv-checked');
        var promises = [];
        var apiRvaBaseUrl = 'https://api-rva.sig.rennesmetropole.fr/';
        var apiSitesOrg_url_recherche = 'https://api-sitesorg.sig.rennesmetropole.fr/v1/recherche';

        confData.searchContent.forEach( function (content) {
            var ajaxSetting = {type: 'GET', crossDomain: true,  dataType: "json"};
            switch (content.categoryName) {
                case 'Communes':
                    ajaxSetting.url = apiRvaBaseUrl;
                    ajaxSetting.data = {key: apiRVAKey, version: '1.0', format: 'json', 'epsg': '3948', 'cmd': 'getcities', 'insee':'all'};
                    break;
                case 'Voies':
                    ajaxSetting.url = apiRvaBaseUrl;
                    ajaxSetting.data = {key: apiRVAKey, version: '1.0', format: 'json', 'epsg': '3948', 'cmd': 'getlanes', 'insee':'all', "query": value};
                    break;
                case 'Adresses':
                    ajaxSetting.url = apiRvaBaseUrl;
                    ajaxSetting.data =  {key: apiRVAKey, version: '1.0', format: 'json', 'epsg': '3948', 'cmd': 'getfulladdresses',"query": value};
                    break;
                case 'Organismes':
                    ajaxSetting.url = apiSitesOrg_url_recherche;
                    ajaxSetting.data = 'adresse=&etats[]=actif&etats[]=projet&etats[]=inactif&niveaux_org[]=3&niveaux_org[]=1&niveaux_org[]=2&niveaux_site[]=1'
                    + '&termes='+ value + '&termes_op=AND&types[]=organisme&limit=20&offset=0';
                    ajaxSetting.headers = {'X-API-KEY': apiSitesOrgkey};
                    break;
            }

            if(restriction){
              ajaxSetting.data.insee = restrictionInsee;
            }

            for (var i = 0; i < searchItemChecked.length; i++) {
                if (searchItemChecked[i].id === 'param_search_' + content.categoryName) {

                    promises.push( new Promise(resolve => {
                        $.ajax(ajaxSetting).done(function (result) {
                            var nbItemDisplay = 5;
                            if (!Number.isNaN(parseInt(content.nbItemDisplay))) {
                                nbItemDisplay = parseInt(content.nbItemDisplay);
                            }
                            var resolveRes = {result : result, nbItemDisplay: nbItemDisplay};
                            resolveRes['zoom'] = content.zoom;
                            resolveRes['categoryName'] = content.categoryName;
                            resolveRes['citiesSearch'] = content.citiesSearch;
                            resolve(resolveRes);
                        });
                    }) );

                }
            }

        } );
        return promises;
    };

    var _displayAutocompleteData = function (allResult, value, createHtml) {
        var str = '';
        var nbItem = 0;
        var cities = [];
        var lane = [];
        var address = [];
        var queryMapOnClick;
        getQueryMapOnClick(function(response){
          queryMapOnClick = response;
        });
        allResult.forEach( function (data) {
            str += '<a class="geoportail list-group-item disabled" id="list-group-'+ data.categoryName +'">'+ data.categoryName +'</a>';
            var dataFiltered = [];
          switch (data.categoryName) {
            case 'Communes':
                var communeData = data.result.rva.answer.cities;
                dataFiltered = _filterCities(communeData, value, data.citiesSearch);
                dataFiltered.forEach(function (elem) {
                    str += "<a class=\"geoportail list-group-item autocompleteRmItem\" id=\"autocompleteRmItem_" + nbItem + "\" href=\"#\" title=\"" + elem.name;
                    var x = _getBoundigBoxCenterX(elem.lowerCorner, elem.upperCorner);
                    var y = _getBoundigBoxCenterY(elem.lowerCorner, elem.upperCorner);
                    var coordNewProj = proj4('EPSG:3948', 'EPSG:4326', [x, y]);
                    str += '" onclick="searchRM.displayLocation('+
                    coordNewProj[0] + ',' +
                    coordNewProj[1] + ',' + data.zoom + ',' + queryMapOnClick +', \'EPSG:4326\');">' + elem.name + '</a>';
                    nbItem++;
                });
                cities.push(dataFiltered);
                // console.log('queryMapOnClick:');
                // console.log(queryMapOnClick);
                break;
            case 'Voies':
                //dataFiltered =  data.result.rva.answer.lanes.slice(0,data.nbItemDisplay);
                dataFiltered = _filterLanes(data);
                dataFiltered.forEach(function (elem) {
                    str += "<a class=\"geoportail list-group-item autocompleteRmItem\" id=\"autocompleteRmItem_" + nbItem + "\" href=\"#\" title=\"" + elem.name4;
                    // calcul x et y de voie à revoir => il faut un point sur la voie et non pas le centre de la bounding box)
                    //var x = _getBoundigBoxCenterX(elem.lowerCorner, elem.upperCorner);
                    //var y = _getBoundigBoxCenterY(elem.lowerCorner, elem.upperCorner);
                    //var coordNewProj = proj4('EPSG:3948', 'EPSG:4326', [x, y]);
                    str += '" onclick="searchRM.displayLocationLane('+
                    //coordNewProj[0] + ',' +
                    //coordNewProj[1] + 
                    elem.idlane + ',' + data.zoom + ',' + queryMapOnClick +', \'EPSG:4326\');">' + elem.name4 + '</a>';
                    nbItem++;
                });
                lane.push(dataFiltered);
                break;
            case 'Adresses':
                //dataFiltered = data.result.rva.answer.addresses.slice(0,data.nbItemDisplay);
                dataFiltered = _filterAddresses(data);
                dataFiltered.forEach(function (elem) {
                    str += "<a class=\"geoportail list-group-item autocompleteRmItem\" id=\"autocompleteRmItem_" + nbItem + "\" href=\"#\" title=\"" + elem.addr3;
                    var coordNewProj = proj4('EPSG:3948', 'EPSG:4326', [elem.x, elem.y]);
                    str += '" onclick="searchRM.displayLocationMarker('+
                    coordNewProj[0] + ',' +
                    coordNewProj[1] + ',' + data.zoom + ',' + queryMapOnClick +', \'EPSG:4326\');">' + elem.addr3 + '</a>';
                    nbItem++;
                });
                address.push(dataFiltered);
                break;
            case 'Organismes':
                //dataFiltered = data.result.slice(0,data.nbItemDisplay);
                dataFiltered = _filterOrganisms(data);
                dataFiltered.forEach( function (elem) {
                    var elemName = elem.nom;
                    elem.autres.forEach(function (autresData) {
                        if (autresData.includes('Localisation :')) {
                            elemName += ', ' + autresData.split(':')[1].trim();
                        }
                    });
                    var mainSite = _getMainSite(elem);
                    str += "<a class=\"geoportail list-group-item autocompleteRmItem\" id=\"autocompleteRmItem_" + nbItem + "\" href=\"#\" title=\"" + mainSite
                    + ' " onclick="searchRM.displayOrganism(this,' + data.zoom
                    + ','+ queryMapOnClick + ')">' + elemName + '</a>';
                    nbItem++;
                });
                break;
          }
        });

        if(createHtml != false) {
            $(".geoportail").remove();
            $("#searchresults").append(str);
            if (search.options.closeafterclick) {
                $("#searchresults .list-group-item").click(function(){
                    $(".searchresults-title .close").trigger("click");
                });
            }
            $("#searchresults").show();
        }
        return {
            cities: cities,
            lane: lane,
            address: address
        }
    };
    
    function getPointOnLane(idlane){
        return getLaneData(idlane).then(function(result_site){
            // sélectionner 1 tronçon
            var l_troncons = result_site.response.features.sort((a, b) => (a.bbox > b.bbox) ? 1 : -1);
            var index = l_troncons.length/2 | 0;
            var tronc = l_troncons[index];
            // sélectionner 1 point de ce tronçon
            var geom = tronc.geometry.coordinates[0];
            var coord_idx = geom.length/2 |0;
            return geom[coord_idx];
        });
        
    }
    
    function getLaneData(idlane){
        return new Promise(resolve => {
            $.ajax({
                url: 'https://public.sig.rennesmetropole.fr/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=v_troncon_denom&outputFormat=application%2Fjson&srsname=EPSG:3948&CQL_FILTER=id_voie=' + idlane,
                context: document.body
            }).done(function (res) {
                resolve({'response': res});
            });
        });
    }
    

    var getQueryMapOnClick = function(callback){
      var extensions = configuration.getConfiguration().extensions;
      var configPerso;
      var trueOrFalse = 'false';
      for (index in extensions.extension){
          // console.log(extensions.extension);
          configPerso = extensions.extension[index];
          if(extensions.extension[index].id=="searchRM"){
              if (extensions.extension[index].configFile != undefined) {
                  configPerso=extensions.extension[index].configFile;
              } else {
                  console.log("Err : l'attribut configfile du fichier de personnalisation de la recherche est manquant sur l'extension");
              }
          break;
          }
      }
     if (configPerso != 'undefined') {
       $.ajax({
         url: '.' + configPerso,
         method: 'GET',
         async: false
       }).done(function(response){
         if(response.queryMapOnClick === true){
           callback(true);
         }else{
           callback(false);
         }
       });
      }
    }

    var displayLocationLane = function(idlane, zoom, querymaponclick){
        getPointOnLane(idlane).then((coord) => {
            var coordNewProj = proj4('EPSG:3948', 'EPSG:4326', coord);
            displayLocation(coordNewProj[0], coordNewProj[1], zoom , querymaponclick);
        });
    }

    var displayLocation = function (coordX, coordY, zoom, querymaponclick) {
        mviewer.zoomToLocation(coordX, coordY, zoom, querymaponclick);
        mviewer.hideLocation();
    };

    var displayLocationMarker = function (coordX, coordY, zoom, querymaponclick, proj) {
        mviewer.zoomToLocation(coordX, coordY, zoom, querymaponclick);
        setTimeout(function(){mviewer.showLocation(proj, coordX, coordY)},500);
    };

    var displayOrganism = async function (elem, zoom, querymaponclick) {
        var mainSite = elem.title;
        var site = await _getSiteFromOrg(mainSite);
        var coord = await _getSiteCoordinates(site.site[0].id);
        var coordNewProj = proj4('EPSG:3948', 'EPSG:4326', [coord.x, coord.y]);
        mviewer.zoomToLocation(coordNewProj[0], coordNewProj[1], zoom, querymaponclick);
        mviewer.showLocation('EPSG:4326', coordNewProj[0], coordNewProj[1]);
    };

    /**
     * get [x,y] coordinates from site
     * @param {*} site
     */
    var _getSiteCoordinates = function (idSite) {

        var requestUrl = 'https://api-sitesorg.sig.rennesmetropole.fr/v1/sites/' + idSite;

        return new Promise(resolve => {
            $.ajax({
                url: requestUrl,
                context: document.body,
                headers: {'X-API-KEY': apiSitesOrgkey}
            }).done(function (res) {
                resolve({x: res.sitePt.x, y: res.sitePt.y});
            });
        });

    }

    /**
     * get main site information from organism
     * @param {*} org organism
     */
    var _getSiteFromOrg = function (mainSite) {

        var requestUrl = 'https://api-sitesorg.sig.rennesmetropole.fr/v1/recherche?'
                       + 'adresse=&etats[]=actif&etats[]=projet&etats[]=inactif&niveaux_org[]=3'
                       + '&niveaux_org[]=1&niveaux_org[]=2&niveaux_site[]=1&termes='+ mainSite
                       + '&termes_op=AND&types[]=site&limit=20&offset=0';

        return new Promise(resolve => {
            $.ajax({
                url: requestUrl,
                context: document.body,
                headers: {'X-API-KEY': apiSitesOrgkey}
            }).done(function (site) {
                resolve({site});
            });
        });

    };

    //////////////////// Search input /////////////////////////////////////////////////

    var _filterCities = function (citiesList, elemSearch, citiesSearch) {
        var citiesFound = [];
        if (typeof citiesSearch !== 'undefined') {
            var citiesSearchSplitArray = citiesSearch.split(',');
            citiesList.forEach(function (city) {
                var citiesFilter = citiesSearchSplitArray.findIndex(item => city.name.toLowerCase() === item.toLowerCase());

                if ( (city.name.toLowerCase().startsWith(elemSearch.toLowerCase()) || city.name2.toLowerCase().startsWith(elemSearch.toLowerCase()) )
                 && citiesFilter !== -1 ) {
                    citiesFound.push(city);
                }
                if ( ( (city.name.toLowerCase().includes(elemSearch.toLowerCase()) || city.name.toLowerCase() === elemSearch.toLowerCase() ||
                city.name2.toLowerCase().includes(elemSearch.toLowerCase()) || city.name2.toLowerCase() === elemSearch.toLowerCase() )
                && citiesFound.indexOf(city) === -1) && citiesFilter !== -1)  {
                    citiesFound.push(city);
                }

            });
        } else {
            citiesList.forEach(function (city) {
                if (city.name.toLowerCase().startsWith(elemSearch.toLowerCase()) || city.name2.toLowerCase().startsWith(elemSearch.toLowerCase()) ) {
                    citiesFound.push(city);
                }
                if ( (city.name.toLowerCase().includes(elemSearch.toLowerCase()) || city.name.toLowerCase() === elemSearch.toLowerCase() ||
                city.name2.toLowerCase().includes(elemSearch.toLowerCase()) || city.name2.toLowerCase() === elemSearch.toLowerCase() )
                && citiesFound.indexOf(city) === -1) {
                    citiesFound.push(city);
                }
            });
        };
        return citiesFound;
    };

    var _getBoundigBoxCenterX = function (lowerCorner, upperCorner) {
        var xmin = parseFloat(lowerCorner.split(' ')[0]);
        var xmax = parseFloat(upperCorner.split(' ')[0]);
        return (xmin + xmax) / 2;
    }

    var _getBoundigBoxCenterY = function (lowerCorner, upperCorner) {
        var ymin = parseFloat(lowerCorner.split(' ')[1]);
        var ymax = parseFloat(upperCorner.split(' ')[1]);
        return (ymin + ymax) / 2;
    }

    var _filterLanes = function (lanesData) {
        var lanesFound = [];
        var lanes = lanesData.result.rva.answer.lanes;
        if (typeof lanesData.citiesSearch !== 'undefined') {
            var citiesSearchSplitArray = lanesData.citiesSearch.split(',');
            lanes.forEach(function (lane) {
                if ( citiesSearchSplitArray.findIndex(item => lane.name4.split(',')[1].trim().toLowerCase() === item.toLowerCase()) !== -1) {
                    lanesFound.push(lane);
                }
            });
        } else {
            lanesFound = lanes;
        }
        return lanesFound.slice(0,lanesData.nbItemDisplay);
    };

    var _filterAddresses = function (addressesData) {
        var addressesFound = [];
        var addresses = addressesData.result.rva.answer.addresses;
        if (typeof addressesData.citiesSearch !== 'undefined') {
            var citiesSearchSplitArray = addressesData.citiesSearch.split(',');
            addresses.forEach(function (address) {
                if ( citiesSearchSplitArray.findIndex(item => address.addr3.split(',')[1].trim().toLowerCase() === item.toLowerCase()) !== -1) {
                    addressesFound.push(address);
                }
            });
        } else {
            addressesFound = addresses;
        }
        return addressesFound.slice(0,addressesData.nbItemDisplay);
    };

    var _filterOrganisms = function (organismsData) {
        var organismsFound = [];
        var organisms = organismsData.result;
        if (typeof organismsData.citiesSearch !== 'undefined') {
            var citiesSearchSplitArray = organismsData.citiesSearch.split(',');
            organisms.forEach(function (organism) {
                if ( organism.autres !== null && citiesSearchSplitArray.findIndex(item => organism.autres[0].split(':')[1].trim().toLowerCase() === item.toLowerCase()) !== -1) {
                    organismsFound.push(organism);
                }
            });
        } else {
            organismsFound = organisms;
        }
        return organismsFound.slice(0,organismsData.nbItemDisplay);
    };

    /**
     * get main site from organism
     * @param {*} org organism
     */
    var _getMainSite = function (org) {
        var mainSite = '';
        if (org.autres !== null) {
            org.autres.forEach(function (data) {
                if (data.includes('Site principal :')) {
                    mainSite = data.split(':')[1].trim();
                }

            });

        }

        return mainSite;

    };

    return {
      enable: enable,
      displayLocationLane: displayLocationLane,
      displayLocation: displayLocation,
      displayLocationMarker: displayLocationMarker,
      toggleParameter: toggleParameter,
      displayOrganism: displayOrganism,
      request: _getApisRequests,
      getAutocompleteData: _displayAutocompleteData
    };

})();

setTimeout(searchRM.enable, 2000);

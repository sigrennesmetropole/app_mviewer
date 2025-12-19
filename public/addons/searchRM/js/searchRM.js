var searchRM = (function () {
  var searchParameters = [];
  var nbResults = 0;
  var currentRmAutocompleteItem = -1;
  var getPersoConfData;
  var apiRVAKey = '';
  var apiSitesOrgkey = '';
  var previousRequest;
  var communesToRestrict = [];
  var restrictionInsee;
  var apiRvaBaseUrl = 'https://api-rva.sig.rennesmetropole.fr/';
  // var apiRvaBaseUrl = 'http://185.150.252.77/api-rva-2';
  var apiSitesOrg = 'https://api-sitesorg.sig.rennesmetropole.fr/v1/';
  var laneData = 'https://public.sig.rennesmetropole.fr/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=v_troncon_denom&outputFormat=application%2Fjson&srsname=EPSG:3948&CQL_FILTER=id_voie=';
  var queryMapOnClick;
  var townsList = [
    'Acigné','Bécherel','Betton','Bourgbarré','Brécé','Bruz','Cesson-Sévigné','Chantepie','la Chapelle-Chaussée','la Chapelle-des-Fougeretz',
    'la Chapelle-Thouarault','Chartres-de-Bretagne','Chavagne','Chevaigné','Cintré','Clayes','Corps-Nuds','Gévezé',"l'Hermitage",
    'Laillé','Langan','Miniac-sous-Bécherel','Montgermont','Mordelles','Nouvoitou','Noyal-Châtillon-sur-Seiche','Orgères','Pacé',
    'Parthenay-de-Bretagne','Rennes','le Rheu','Romillé','Saint-Armel','Saint-Erblon','Saint-Gilles','Saint-Grégoire','Saint-Jacques-de-la-Lande',
    'Saint-Sulpice-la-Forêt','Thorigné-Fouillard','le Verger','Vern-sur-Seiche','Vezin-le-Coquet','Pont-Péan'
  ];

    var enable = function () {
        $("#searchtool").show();

        //Récupère les clés d'api dans le fichier d'environnement
        $.getJSON("apps/public/addons/env.json", function(json) {
          apiRVAKey = json.searchRM[0].apiRVAKey;
          apiSitesOrgkey = json.searchRM[0].apiSitesOrgkey;
        });

        //ajoute dans le placeholder de la recherche le mot "Rechercher"
        $("#searchtool input").attr("placeholder", mviewer.customComponents.searchRM.config.options.libelles.placeholderRVA);

        //ajoute le searchResult lorsque le mode est U, non présent dans la version u par défaut de mviewer
        if(API.mode === 'u'){
          $('#page-content-wrapper').append(
          '<div id="searchresults" class="list-group">' +
            '<div class="searchresults-title">' +
              'Résultats' +
              '<button type="button" class="close">x</button>' +
            '</div>' +
          '</div>'
          );
        }

        //mise en place des actions lorsque clic sur la croix du searchresult, non présent sur le mode u de mviewer
        $(".searchresults-title .close").click(function () {
            $('#searchresults a').remove();
            $('#searchresults').hide();
            $('#searchfield').val('');
        });

        var confdata = _setConfig();
        _configureSearch(confdata);
        getPersoConfData = confdata;
    };

    function _setConfig(){
      var extensions = configuration.getConfiguration().extensions.extension;
      var configPerso;
      for (var index in extensions){
        if(extensions[index].id=="searchRM"){
          if (extensions[index].configFile != undefined) {
            configPerso = '.' + extensions[index].configFile;
          } else {
            console.log("Err : l'attribut configfile du fichier de personnalisation de la recherche est manquant sur l'extension");
          }
          if(extensions[index].restrictCommunes){
            restrictionInsee = extensions[index].restrictCommunes;
          }else{
            console.log('No restrictions set');
          }
        }
      }
      return configPerso;
    }

    //Timer pour attendre la fin de saisie
    var typingTimer;                //timer identifier
    var doneTypingInterval = 100;  //time in ms, 0.3 seconds here

    var _configureSearch = function (searchRMConf) {
        $.getJSON(searchRMConf, function (confData) {
            if(confData.queryMapOnClick === true){
              queryMapOnClick = true;
            }else{
              queryMapOnClick = false;
            }
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

    //actions à mener lorsque l'utilisateur ecrit une ligne
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

//Mets en place les paramêtres de recherche
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
        _getApisRequests(confData, value, function (allResults){
            _displayAutocompleteData(allResults, value);
            nbResults = $('.autocompleteRmItem').length;
        });
    };

    var completeString;
    var _getApisRequests = function (confData, value, callback) {

        configOptionsValues = mviewer.customComponents.searchRM.config.options;
        value = value.trim();
            
        var hasComma;
        var citiesSearch;
        var updatedString = "";
        var originalValue = value;
        var resultArray = [];
        
        hasComma = value.split(",")[1];
        if (hasComma) {
            value = value.split(",")[0];
            citiesSearch = _getCitiesSearch(hasComma.trim());
        }else{
            citiesSearch = _getCitiesSearch(value);
        }
        if ( citiesSearch != undefined ) {
            value = value.replace(',', " ").trim().split(" ");
            if (value.length >= 2) {
                value.pop();
            }
            updatedString = value.join(" ");
        }else{
            value = value.replace(',', " ").trim().split(" ");
            if (value.length >= 2) {
                value.pop();
            }
            updatedString = value.join(" ");
        }

        completeString = originalValue;

      Promise.all(_getRequest(confData, updatedString, citiesSearch)).then(function(restrictedResult){
        var completeStringNoComma = completeString.split(",")[0].replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase();        
        restrictedResult.forEach(element => {
            var amountLanes = 0;
            var amountAddresses = 0;
            var elementLanes;
            var elementAdresses;
            if (element.result.rva.answer.lanes) {
                elementLanes = element.result.rva.answer.lanes;
                element.result.rva.answer.lanes.sort(function(x,y){ return x.name.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(completeStringNoComma) ? -1 : y.name.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(completeStringNoComma) ? 1 : 0; });
                element.result.rva.answer.lanes.forEach(function (lane){
                    if (lane.name.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(completeStringNoComma)) {
                        amountLanes++;
                    }
                });
            }

            if (element.result.rva.answer.addresses) {
                elementAdresses = element.result.rva.answer.addresses;
                element.result.rva.answer.addresses.sort(function(x,y){ return x.addr2.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(completeStringNoComma) ? -1 : y.addr2.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(completeStringNoComma) ? 1 : 0; });
                element.result.rva.answer.addresses.forEach(function (addresse){
                    if (addresse.addr2.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(completeStringNoComma)) {
                        amountAddresses++;
                    }
                });
            }
            if (amountLanes >= 5 || amountAddresses >= 5) {
                elementAdresses = elementAdresses.slice(0, amountAddresses).sort(function(a,b){
                    return a.number - b.number; 
                }).concat(elementAdresses.slice(amountAddresses, elementAdresses.length));
                callback(restrictedResult);
            }else{
                if (restrictedResult[0].id == completeString) {
                    if (!hasComma) {
                        Promise.all(_getRequest(confData, originalValue, undefined)).then(function(unrestrictedResult){
                            if (unrestrictedResult[0].id == completeString) {
                                
                                $.getJSON(getPersoConfData, function (confData) {
                                    confData.searchContent.forEach((item, h) => {
                                        switch (item.categoryName) {
                                            case 'Communes':
                                                resultArray[h] = restrictedResult[h];
                                            break;
                                            case 'Voies':
                                                resultArray[h] = unrestrictedResult[h];
                                                resultArray[h].citiesSearch = restrictedResult[h].citiesSearch;
                                                resultArray[h].result.rva.answer.lanes = unrestrictedResult[h].result.rva.answer.lanes.concat(restrictedResult[h].result.rva.answer.lanes);
                                                for(var i=0; i<resultArray[h].result.rva.answer.lanes.length; ++i) {
                                                    for(var j=i+1; j<resultArray[h].result.rva.answer.lanes.length; ++j) {
                                                        if(resultArray[h].result.rva.answer.lanes[i].name3 === resultArray[h].result.rva.answer.lanes[j].name3){
                                                            if (i != j) {
                                                                resultArray[h].result.rva.answer.lanes.splice(j, 1);
                                                            }
                                                        }
                                                    }
                                                }
                                            break;
                                            case 'Adresses':
                                                resultArray[h] = unrestrictedResult[h];
                                                resultArray[h].citiesSearch = restrictedResult[h].citiesSearch;
                                                resultArray[h].result.rva.answer.addresses = unrestrictedResult[h].result.rva.answer.addresses.concat(restrictedResult[h].result.rva.answer.addresses);
                                                for(var i=0; i<resultArray[h].result.rva.answer.addresses.length; ++i) {
                                                    for(var j=i+1; j<resultArray[h].result.rva.answer.addresses.length; ++j) {
                                                        if(resultArray[h].result.rva.answer.addresses[i].addr3 === resultArray[h].result.rva.answer.addresses[j].addr3)
                                                            if (i != j) {
                                                                resultArray[h].result.rva.answer.addresses.splice(j, 1);
                                                            }    
                                                    }
                                                }
                                            break;
                                            case 'Organismes':
                                                restrictedResult[h].request = originalValue;
                                                resultArray[h] = restrictedResult[h];
                                            break;
                                            default:
                                        }
                                    });
                                    callback(resultArray);
                                });
                            }
                        });
                    }else{
                        resultArray = restrictedResult;
                        callback(resultArray);
                    }
                }
            }
        });
      });

    };

    function _getRequest(confData, value, citiesSearch){
      var searchItemChecked = $('#searchparameters li a .mv-checked');
      var promises = [];
      confData.searchContent.forEach( function (content) {
          var ajaxSetting = {type: 'GET', crossDomain: true,  dataType: "json"};
          ajaxSetting.url = apiRvaBaseUrl;
          switch (content.categoryName) {
              case 'Communes':
                  ajaxSetting.data = {key: apiRVAKey, version: '1.0', format: 'json', 'epsg': '3948', 'cmd': 'getcities', 'insee':'all'};
                  break;
              case 'Voies':
                  ajaxSetting.data = {key: apiRVAKey, version: '1.0', format: 'json', 'epsg': '3948', 'cmd': 'getlanes', 'insee':'all', "query": value};
                  break;
              case 'Adresses':
                  ajaxSetting.data =  {key: apiRVAKey, version: '1.0', format: 'json', 'epsg': '3948', 'cmd': 'getfulladdresses',"query": value};
                  break;
              case 'Organismes':
                  ajaxSetting.url = apiSitesOrg + 'recherche';
                  ajaxSetting.data = 'adresse=&etats[]=actif&etats[]=projet&etats[]=inactif&niveaux_org[]=3&niveaux_org[]=1&niveaux_org[]=2&niveaux_site[]=1'
                  + '&termes='+ value + '&termes_op=AND&types[]=organisme&limit=20&offset=0';
                  ajaxSetting.headers = {'X-API-KEY': apiSitesOrgkey};
                  break;
          }

          if(restrictionInsee){
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
                          resolveRes['citiesSearch'] = citiesSearch;
                          resolveRes['id'] = completeString;
                          resolve(resolveRes);
                      });
                  })
                );
              }
          }
      } );
      return promises;
    }

    function _getCitiesSearch(inputContent){
      var citiesSearch = [];
      inputContent = inputContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll('-',' ').toLowerCase();
      inputContent = inputContent.split(" ");
      inputContent = inputContent[inputContent.length -1];
      if (inputContent.length >= 3) {
        townsList.forEach((item, i) => {
          if (item.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll('-',' ').toLowerCase().includes(inputContent)) {
            citiesSearch.push(item);
          }
        });
      }
      if (citiesSearch.length === 0) {
        citiesSearch = undefined;
      }
      return citiesSearch;
    }

    var _displayAutocompleteData = function (allResult, value, createHtml) {
        var str = '';
        var nbItem = 0;
        var cities = [];
        var lane = [];
        var address = [];

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
                break;
            case 'Voies':
                dataFiltered = _filterLanes(data);
                dataFiltered.forEach(function (elem) {
                    str += "<a class=\"geoportail list-group-item autocompleteRmItem\" id=\"autocompleteRmItem_" + nbItem + "\" href=\"#\" title=\"" + elem.name4;
                    str += '" onclick="searchRM.displayLocationLane('+
                    elem.idlane + ',' + data.zoom + ',' + queryMapOnClick +', \'EPSG:4326\');">' + elem.name4 + '</a>';
                    nbItem++;
                });
                lane.push(dataFiltered);
                break;
            case 'Adresses':
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
            default:
          }
        });

        if(createHtml != false) {
            $('#searchresults a').remove();
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

    //renvoie un point du tronçon
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

//obtiens les données de la voie idLane
    function getLaneData(idlane){
        return new Promise(resolve => {
            $.ajax({
                url: laneData + idlane,
                context: document.body
            }).done(function (res) {
                resolve({'response': res});
            });
        });
    }

    // obtiens un point sur la voie et l'affiche
    var displayLocationLane = function(idlane, zoom, querymaponclick){
        getPointOnLane(idlane).then((coord) => {
            var coordNewProj = proj4('EPSG:3948', 'EPSG:4326', coord);
            displayLocation(coordNewProj[0], coordNewProj[1], zoom , querymaponclick);
        });
    }

    // affiche une coordonnée sur la carte
    var displayLocation = function (coordX, coordY, zoom, querymaponclick) {
        mviewer.zoomToLocation(coordX, coordY, zoom, querymaponclick);
        mviewer.hideLocation();
    };

    //affiche les coordonnées de l'adresse
    var displayLocationMarker = function (coordX, coordY, zoom, querymaponclick, proj) {
        mviewer.zoomToLocation(coordX, coordY, zoom, querymaponclick);
        // setTimeout(function(){mviewer.showLocation(proj, coordX, coordY)},500);
        mviewer.showLocation(proj, coordX, coordY)
    };

    //affiche un organisme
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
     * Obtiens les coordonnées de notre site
     */
    var _getSiteCoordinates = function (idSite) {

        var requestUrl = apiSitesOrg + 'sites/' + idSite;

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
     * retourne un site depuis l'api sitesOrg
     */
    var _getSiteFromOrg = function (mainSite) {

        var requestUrl = apiSitesOrg + 'recherche' + '?'
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
    // Retourne les villes en fonction de si elles correspondent à la recherche
    var _filterCities = function (citiesList, elemSearch, citiesSearch) {
        var citiesFound = [];
        if (typeof citiesSearch !== 'undefined') {
            // var citiesSearchSplitArray = citiesSearch.split(',');
            citiesList.forEach(function (city) {
                var citiesFilter = citiesSearch.findIndex(item => city.name.toLowerCase() === item.toLowerCase());

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

    //retourne les voies correspondantes à notre recherche
    var _filterLanes = function (lanesData) {
        var lanesFound = [];
        var lanes = lanesData.result.rva.answer.lanes;
        if (typeof lanesData.citiesSearch !== 'undefined') {
            lanes.forEach(function (lane) {
                if ( lanesData.citiesSearch.findIndex(item => lane.name4.split(',')[1].trim().toLowerCase() === item.trim().toLowerCase()) !== -1) {
                    lanesFound.push(lane);
                }
            });
            lanes.forEach(function (lane) {
                if ( lane.name.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(lanesData.id.replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase()) ) {
                    lanesFound.unshift(lane);
                }
            });
        } else {
            lanesFound = lanes;
        }
        if (lanesFound.length == 0) {
            lanesFound = lanes;
        }
        return lanesFound.slice(0,lanesData.nbItemDisplay);
    };

    //permet de filtrer les adresses et les renvoie selon un tri numérique
    var _filterAddresses = function (addressesData) {
        var addressesFound = [];
        var addresses = addressesData.result.rva.answer.addresses;
        if (addressesData.id.includes(",")) {
            if (typeof addressesData.citiesSearch !== 'undefined') {
                addresses.forEach(function (address) {
                    if ( addressesData.citiesSearch.findIndex(item => address.addr3.split(',')[1].trim().toLowerCase() === item.toLowerCase()) !== -1) {
                        addressesFound.push(address);
                    }
                });
            } else {
                addressesFound = addresses;
            }
            if (addressesFound.length == 0) {
                addressesFound = addresses;
            }
        }else{
            if (typeof addressesData.citiesSearch !== 'undefined') {
                addresses.forEach(function (address) {
                    if ( addressesData.citiesSearch.findIndex(item => address.addr3.split(',')[1].trim().toLowerCase() === item.toLowerCase()) !== -1) {
                        if ( address.addr3.split(',')[0].replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(addressesData.id.toLowerCase()) ) {
                            addressesFound.push(address);
                        }
                    }
                    if ( address.addr3.split(',')[0].replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(addressesData.id.toLowerCase()) ) {
                        addressesFound.unshift(address);
                    }
                });
                if (addressesFound.length == 0) {
                    addresses.forEach(function (address) {
                        if ( addressesData.citiesSearch.findIndex(item => address.addr3.split(',')[1].trim().toLowerCase() === item.toLowerCase()) !== -1) {
                            addressesFound.push(address);
                        }
                    });
                }
            } else {
                addresses.forEach(function (address) {
                    if (address.addr3.split(',')[0].replace(/[^0-9A-zÀ-ú' ]/g, " ").trim().toLowerCase().includes(addressesData.id.trim().toLowerCase())) {
                        addressesFound.push(address);
                    }
                });
            }
        }
        addressesFound = addressesFound.sort(function(a,b){return a['number'] - b['number']});
        return addressesFound.slice(0,addressesData.nbItemDisplay);
    };

    //renvoie les organismes du résultat trié par la saisie
    var _filterOrganisms = function (organismsData) {
        var organismsFound = [];
        var organisms = organismsData.result;
        if (typeof organismsData.citiesSearch !== 'undefined') {
            // var citiesSearchSplitArray = organismsData.citiesSearch.split(',');
            organisms.forEach(function (organism) {
                if ( organism.autres !== null && organismsData.citiesSearch.findIndex(item => organism.autres[0].split(':')[1].trim().toLowerCase() === item.toLowerCase()) !== -1) {
                    organismsFound.push(organism);
                }
            });
        } else {
            organisms.forEach(function (organism) {
                organismsData.id.split(' ').forEach(function (splitRequest) {
                    if ( organism.autres !== null && organism.nom.toLowerCase().includes(splitRequest.toLowerCase())) {
                        organismsFound.push(organism);
                        requestDone = true;
                    }
                })
            });
            // organismsFound = organisms;
        }
        return organismsFound.slice(0,organismsData.nbItemDisplay);
    };

    /**
     * get main site from organism
     * @param {*} org organism
     * Renvoie le nom du site envoyé en argument
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

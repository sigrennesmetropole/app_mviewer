var searchRM = (function () {
  var searchParameters = [];
  let nbResults = 0;
  let currentRmAutocompleteItem = -1;
  var getPersoConfData;
  var apiRVAKey = "";
  var apiSitesOrgkey = "";
  let restrictionInsee;
  var apiRvaBaseUrl = "https://api-rva.sig.rennesmetropole.fr/";
  var apiSitesOrg = "https://api-sitesorg.sig.rennesmetropole.fr/v1/";
  var laneData =
    "https://public.sig.rennesmetropole.fr/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=v_troncon_denom&outputFormat=application%2Fjson&srsname=EPSG:3948&CQL_FILTER=id_voie=";
  var queryMapOnClick;
  const townsList = [
    "Acigné",
    "Bécherel",
    "Betton",
    "Bourgbarré",
    "Brécé",
    "Bruz",
    "Cesson-Sévigné",
    "Chantepie",
    "la Chapelle-Chaussée",
    "la Chapelle-des-Fougeretz",
    "la Chapelle-Thouarault",
    "Chartres-de-Bretagne",
    "Chavagne",
    "Chevaigné",
    "Cintré",
    "Clayes",
    "Corps-Nuds",
    "Gévezé",
    "l'Hermitage",
    "Laillé",
    "Langan",
    "Miniac-sous-Bécherel",
    "Montgermont",
    "Mordelles",
    "Nouvoitou",
    "Noyal-Châtillon-sur-Seiche",
    "Orgères",
    "Pacé",
    "Parthenay-de-Bretagne",
    "Rennes",
    "le Rheu",
    "Romillé",
    "Saint-Armel",
    "Saint-Erblon",
    "Saint-Gilles",
    "Saint-Grégoire",
    "Saint-Jacques-de-la-Lande",
    "Saint-Sulpice-la-Forêt",
    "Thorigné-Fouillard",
    "le Verger",
    "Vern-sur-Seiche",
    "Vezin-le-Coquet",
    "Pont-Péan",
  ];
  //Timer pour attendre la fin de saisie
  const doneTypingInterval = 300;

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  const debouncedRecherche = debounce(function (confData) {
    lancerRecherche(confData);
  }, doneTypingInterval);

  // Replace le composant de recherche en fonction du mode et de la résolution de l'écran
  // Attention, très sensible aux migrations de mviewer
  function placeSearchTool() {
    const mode =
      $("input[name=mv-display-mode]:checked").val() || API.mode || "d";
    const w = $(window).width();
    const isXs = w < 992;

    if (isXs) {
      // mobile : placer dans main (mode compact)
      $("#searchtool").appendTo("#main");
      $("#searchtool").removeClass("navbar-form");
    } else {
      // desktop
      if (mode === "u") {
        // ultrasimple : placer dans main et enlever la barre
        $("#searchtool").appendTo("#main");
        $("#searchtool").removeClass("navbar-form");
        $("#mv-navbar").remove();
      } else if (mode === "s") {
        // simple : placer dans la zone prévue pour la recherche
        $("#searchtool").appendTo("#searchtool_nav");
        $("#searchtool").addClass("navbar-form");
      } else {
        // mode par défaut : remettre dans la navbar de recherche si existe
        $("#searchtool").appendTo("#searchtool_nav");
        $("#searchtool").addClass("navbar-form");
      }
    }
  }

  function enable() {
    placeSearchTool();
    // repositionne au redimensionnement et au changement de mode d'affichage
    $(window).on("resize.searchtool", placeSearchTool);

    $("#searchtool").show();

    //Récupère les clés d'api dans le fichier d'environnement
    $.getJSON("apps/public/addons/env.json", function (json) {
      apiRVAKey = json.searchRM[0].apiRVAKey;
      apiSitesOrgkey = json.searchRM[0].apiSitesOrgkey;
    });

    //ajoute dans le placeholder de la recherche le mot "Rechercher"
    $("#searchtool input").attr(
      "placeholder",
      mviewer.customComponents.searchRM.config.options.libelles.placeholderRVA,
    );

    //mise en place des actions lorsque clic sur la croix du searchresult, non présent sur le mode u de mviewer
    $(".searchresults-title .close").click(function () {
      $("#searchresults a").remove();
      $("#searchresults").hide();
      $("#searchfieldRM").val("");
    });

    var confdata = _setConfig();
    _configureSearch(confdata);
    getPersoConfData = confdata;
  }

  function _setConfig() {
    var extensions = configuration.getConfiguration().extensions.extension;
    var configPerso;
    for (var index in extensions) {
      if (extensions[index].id == "searchRM") {
        if (extensions[index].configFile != undefined) {
          configPerso = "." + extensions[index].configFile;
        } else {
          console.log(
            "Err : l'attribut configfile du fichier de personnalisation de la recherche est manquant sur l'extension",
          );
        }
        if (extensions[index].restrictCommunes) {
          restrictionInsee = extensions[index].restrictCommunes;
        } else {
          console.log("No restrictions set");
        }
      }
    }
    return configPerso;
  }

  var _configureSearch = function (searchRMConf) {
    $.getJSON(searchRMConf, function (confData) {
      if (confData.queryMapOnClick === true) {
        queryMapOnClick = true;
      } else {
        queryMapOnClick = false;
      }
      _setSearchParameters(confData);

      $(document).on("keyup", "#searchfieldRM", function (e) {
        if (e.keyCode == 40) {
          //down arrow keyCode
          currentRmAutocompleteItem++;
          if (currentRmAutocompleteItem >= nbResults) {
            currentRmAutocompleteItem = 0;
          }
          var previousItem = currentRmAutocompleteItem - 1;
          if (previousItem < 0) {
            previousItem = nbResults - 1;
          }
          $("#autocompleteRmItem_" + previousItem).removeClass(
            "selectedRmAutocompleteItem",
          );
          $("#autocompleteRmItem_" + currentRmAutocompleteItem).addClass(
            "selectedRmAutocompleteItem",
          );
          $("#searchfieldRM").val(
            $("#autocompleteRmItem_" + currentRmAutocompleteItem)[0].innerText,
          );
          return;
        }
        if (e.keyCode == 38) {
          // up arrow keyCode
          currentRmAutocompleteItem--;
          if (currentRmAutocompleteItem < 0) {
            currentRmAutocompleteItem = nbResults - 1;
          }
          var nextItem = currentRmAutocompleteItem + 1;
          if (nextItem >= nbResults) {
            nextItem = 0;
          }
          $("#autocompleteRmItem_" + nextItem).removeClass(
            "selectedRmAutocompleteItem",
          );
          $("#autocompleteRmItem_" + currentRmAutocompleteItem).addClass(
            "selectedRmAutocompleteItem",
          );
          $("#searchfieldRM").val(
            $("#autocompleteRmItem_" + currentRmAutocompleteItem)[0].innerText,
          );
          return;
        }
        if (e.keyCode == 13 && $("#searchresults a").length > 1) {
          $("#autocompleteRmItem_" + currentRmAutocompleteItem).trigger(
            "click",
          );
          return;
        }
        debouncedRecherche(confData);
      });

      $(document).on("click", "#searchparameters", function () {
        _searchRM(confData, $(this).val());
      });
    });
  };

  let currentController = null;

  //actions à mener lorsque l'utilisateur ecrit une ligne
  //user is "finished typing," do something
  function lancerRecherche(confData) {
    var chars = $("#searchfieldRM").val().length;
    if (chars === 0) {
      if (currentController) currentController.abort();
      $("#searchresults a").remove();
      $("#searchresults").hide();
    } else if (chars > 0 && chars < 4) {
      $("#searchresults .list-group-item").remove();
    } else {
      if (currentController) currentController.abort();
      currentController = new AbortController();
      _searchRM(confData, $("#searchfieldRM").val(), currentController.signal);
    }
  }

  // Mets en place les paramêtres de recherche
  var _setSearchParameters = function (confData) {
    $("#searchparameters li").hide();
    confData.searchContent.forEach(function (searchElem) {
      var newSearchParameter =
        '<li class="mv-param-item" onclick="searchRM.toggleParameter(this)">' +
        "<a>" +
        '<span id="param_search_' +
        searchElem.categoryName +
        '" class="state-icon far ';
      if (searchElem.defaultCheck) {
        newSearchParameter += "mv-checked";
        searchParameters.push("Communes");
      } else {
        newSearchParameter += "mv-unchecked";
      }
      newSearchParameter +=
        '"></span>' +
        '<div style="display:inline;">' +
        searchElem.searchParameterName +
        "</div>" +
        "</a>" +
        "</li>";
      $("#searchparameters").append(newSearchParameter);
    });
  };

  var toggleParameter = function (li) {
    var span = $(li).find("span");
    var param = span[0].id.replace("param_search_", "");
    var parameterIndex = searchParameters.indexOf(param);
    if (span.hasClass("mv-unchecked") === true) {
      span.removeClass("mv-unchecked").addClass("mv-checked");
      if (parameterIndex === -1) {
        searchParameters.push(param);
      }
    } else {
      span.removeClass("mv-checked").addClass("mv-unchecked");
      if (parameterIndex !== -1) {
        searchParameters.splice(parameterIndex, 1);
      }
    }
    $.getJSON(getPersoConfData, function (confData) {
      _searchRM(confData, $("#searchfieldRM").val());
    });
  };

  var _searchRM = function (confData, value, signal) {
    _getApisRequests(confData, value, signal, function (allResults) {
      _displayAutocompleteData(allResults, value);
      nbResults = $(".autocompleteRmItem").length;
    });
  };

  var completeString;
  var _getApisRequests = function (confData, value, signal, callback) {
    const valueTrimmed = value.trim();

    var hasComma = valueTrimmed.split(",")[1];
    var citiesSearch;
    var originalValue = valueTrimmed;

    if (hasComma) {
      valueTrimmed = valueTrimmed.split(",")[0];
      citiesSearch = _getCitiesSearch(hasComma.trim());
    } else {
      citiesSearch = _getCitiesSearch(value);
    }

    var updatedString = valueTrimmed.replace(",", " ").trim();
    completeString = originalValue;

    Promise.all(
      _getRequest(confData, updatedString, citiesSearch, signal),
    ).then(function (restrictedResult) {
      if (
        restrictedResult.some((r) => r.aborted) ||
        (signal && signal.aborted)
      ) {
        return;
      }

      // Restriction géographique active : on ne cherche jamais plus large
      if (restrictionInsee) {
        callback(restrictedResult);
        return;
      }

      var hasAnyResult = restrictedResult.some(function (element) {
        var lanes = element.result.rva && element.result.rva.answer.lanes;
        var addresses =
          element.result.rva && element.result.rva.answer.addresses;
        var cities = element.result.rva && element.result.rva.answer.cities;
        var organismes =
          element.categoryName === "Organismes" &&
          Array.isArray(element.result) &&
          element.result.length > 0;
        return (
          (lanes && lanes.length > 0) ||
          (addresses && addresses.length > 0) ||
          (cities && cities.length > 0) ||
          organismes
        );
      });

      if (hasAnyResult || hasComma) {
        callback(restrictedResult);
        return;
      }

      // Aucun résultat, pas de restriction commune, pas de ville précisée : on élargit
      Promise.all(_getRequest(confData, originalValue, undefined, signal)).then(
        function (unrestrictedResult) {
          if (
            unrestrictedResult.some((r) => r.aborted) ||
            (signal && signal.aborted)
          ) {
            return;
          }
          callback(unrestrictedResult);
        },
      );
    });
  };

  function _getRequest(confData, value, citiesSearch, signal) {
    var searchItemChecked = $("#searchparameters li a .mv-checked");
    var promises = [];

    confData.searchContent.forEach(function (content) {
      var isChecked = false;
      for (var i = 0; i < searchItemChecked.length; i++) {
        if (
          searchItemChecked[i].id ===
          "param_search_" + content.categoryName
        ) {
          isChecked = true;
          break;
        }
      }
      if (!isChecked) return;

      var url;
      var params = new URLSearchParams();
      var headers = {};

      switch (content.categoryName) {
        case "Communes":
          url = apiRvaBaseUrl;
          params.set("key", apiRVAKey);
          params.set("version", "1.0");
          params.set("format", "json");
          params.set("epsg", "3948");
          params.set("cmd", "getcities");
          params.set("insee", restrictionInsee || "all");
          break;
        case "Voies":
          url = apiRvaBaseUrl;
          params.set("key", apiRVAKey);
          params.set("version", "1.0");
          params.set("format", "json");
          params.set("epsg", "3948");
          params.set("cmd", "getlanes");
          params.set("insee", restrictionInsee || "all");
          params.set("query", value);
          break;
        case "Adresses":
          url = apiRvaBaseUrl;
          params.set("key", apiRVAKey);
          params.set("version", "1.0");
          params.set("format", "json");
          params.set("epsg", "3948");
          params.set("cmd", "getfulladdresses");
          params.set("query", value);
          if (restrictionInsee) params.set("insee", restrictionInsee);
          break;
        case "Organismes":
          url = apiSitesOrg + "recherche";
          params.set("adresse", "");
          ["actif", "projet", "inactif"].forEach((e) =>
            params.append("etats[]", e),
          );
          [3, 1, 2].forEach((n) => params.append("niveaux_org[]", n));
          params.append("niveaux_site[]", 1);
          params.set("termes", value);
          params.set("termes_op", "AND");
          params.append("types[]", "organisme");
          params.set("limit", 20);
          params.set("offset", 0);
          if (restrictionInsee) params.set("insee", restrictionInsee);
          headers["X-API-KEY"] = apiSitesOrgkey;
          break;
        default:
          return;
      }

      let nbItemDisplay = 5;
      if (!Number.isNaN(parseInt(content.nbItemDisplay))) {
        nbItemDisplay = parseInt(content.nbItemDisplay);
      }

      const promise = fetch(url + "?" + params.toString(), {
        headers: headers,
        signal: signal,
      })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (result) {
          return {
            result: result,
            nbItemDisplay: nbItemDisplay,
            zoom: content.zoom,
            categoryName: content.categoryName,
            citiesSearch: citiesSearch,
            id: completeString,
            error: false,
            aborted: false,
          };
        })
        .catch(function (err) {
          if (err.name === "AbortError") {
            // Pas de log, pas de throw : on résout avec un marqueur
            return {
              result: { rva: { answer: {} } },
              nbItemDisplay: 0,
              zoom: content.zoom,
              categoryName: content.categoryName,
              citiesSearch: citiesSearch,
              id: completeString,
              error: false,
              aborted: true,
            };
          }
          console.error(
            "Erreur API searchRM (" + content.categoryName + ") :",
            err,
          );
          return {
            result: { rva: { answer: {} } },
            nbItemDisplay: 0,
            zoom: content.zoom,
            categoryName: content.categoryName,
            citiesSearch: citiesSearch,
            id: completeString,
            error: true,
            aborted: false,
          };
        });

      promises.push(promise);
    });

    return promises;
  }

  function _getCitiesSearch(inputContent) {
    var citiesSearch = [];
    inputContent = inputContent
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll("-", " ")
      .toLowerCase();
    inputContent = inputContent.split(" ");
    inputContent = inputContent[inputContent.length - 1];
    if (inputContent.length >= 3) {
      townsList.forEach((item, i) => {
        if (
          item
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replaceAll("-", " ")
            .toLowerCase()
            .includes(inputContent)
        ) {
          citiesSearch.push(item);
        }
      });
    }
    if (citiesSearch.length === 0) {
      citiesSearch = undefined;
    }
    return citiesSearch;
  }

  function _displayAutocompleteData(allResult, value, createHtml) {
    let dataHtml = "";
    let nbItems = 0;
    let cities = [];
    let lane = [];
    let address = [];

    allResult.forEach(function (data) {
      let categoryDataFiltered = [];
      let itemsHtml = "";
      switch (data.categoryName) {
        case "Communes":
          var communeData = data.result.rva.answer.cities;
          categoryDataFiltered = _filterCities(
            communeData,
            value,
            data.citiesSearch,
          );
          categoryDataFiltered.forEach(function (elem) {
            itemsHtml += `<a class="geoportail list-group-item autocompleteRmItem" id="autocompleteRmItem_${nbItems}" title="${elem.name}`;
            const x = _getBoundingBoxCenterX(
              elem.lowerCorner,
              elem.upperCorner,
            );
            const y = _getBoundingBoxCenterY(
              elem.lowerCorner,
              elem.upperCorner,
            );
            const coordNewProj = proj4("EPSG:3948", "EPSG:4326", [x, y]);
            itemsHtml += `" onclick="searchRM.displayLocation(${coordNewProj[0]},${coordNewProj[1]},${data.zoom},${queryMapOnClick}, 'EPSG:4326');\">${elem.name}</a>`;
            nbItems++;
          });
          cities.push(categoryDataFiltered);
          break;
        case "Voies":
          categoryDataFiltered = _filterLanes(data);
          categoryDataFiltered.forEach(function (elem) {
            itemsHtml += `<a class="geoportail list-group-item autocompleteRmItem" id="autocompleteRmItem_${nbItems}" title="${elem.name4}" onclick="searchRM.displayLocationLane(${elem.idlane},${data.zoom},${queryMapOnClick}, 'EPSG:4326');">${elem.name4}</a>`;
            nbItems++;
          });
          lane.push(categoryDataFiltered);
          break;
        case "Adresses":
          categoryDataFiltered = _filterAddresses(data);
          categoryDataFiltered.forEach(function (elem) {
            itemsHtml += `<a class="geoportail list-group-item autocompleteRmItem" id="autocompleteRmItem_${nbItems}" title="${elem.addr3}`;
            var coordNewProj = proj4("EPSG:3948", "EPSG:4326", [
              elem.x,
              elem.y,
            ]);
            itemsHtml += `" onclick="searchRM.displayLocationMarker(${coordNewProj[0]},${coordNewProj[1]},${data.zoom},${queryMapOnClick}, 'EPSG:4326');\">${elem.addr3}</a>`;
            nbItems++;
          });
          address.push(categoryDataFiltered);
          break;
        case "Organismes":
          //dataFiltered = data.result.slice(0,data.nbItemDisplay);
          categoryDataFiltered = _filterOrganisms(data);
          categoryDataFiltered.forEach(function (elem) {
            const elemName = elem.nom;
            elem.autres.forEach(function (autresData) {
              if (autresData.includes("Localisation :")) {
                elemName += ", " + autresData.split(":")[1].trim();
              }
            });
            const mainSite = _getMainSite(elem);
            itemsHtml += `<a class="geoportail list-group-item autocompleteRmItem" id="autocompleteRmItem_${nbItems}" title="${mainSite} " onclick="searchRM.displayOrganism(this,${data.zoom},${queryMapOnClick})">${elemName}</a>`;
            nbItems++;
          });
          break;
        default:
      }

      // On n'ajoute le header (et les items) que si dataFiltered contient quelque chose
      if (categoryDataFiltered.length > 0) {
        dataHtml += `<a class="geoportail list-group-item disabled" id="list-group-${data.categoryName}">${data.categoryName}</a>`;
        dataHtml += itemsHtml;
      }
    });

    if (createHtml !== false) {
      $("#searchresults a").remove();
      if (nbItems === 0) {
        dataHtml += `<a class="list-group-item disabled noResult autocompleteRmItem">Aucun résultat</a>`;
      }
      $("#searchresults").append(dataHtml);
      if (search.options.closeafterclick) {
        $("#searchresults .list-group-item").click(function () {
          $(".searchresults-title .close").trigger("click");
        });
      }
      $("#searchresults").show();
    }
    return {
      cities: cities,
      lane: lane,
      address: address,
    };
  }

  //renvoie un point du tronçon
  function getPointOnLane(idlane) {
    return getLaneData(idlane).then(function (result_site) {
      // sélectionner 1 tronçon
      var l_troncons = result_site.response.features.sort((a, b) =>
        a.bbox > b.bbox ? 1 : -1,
      );
      var index = (l_troncons.length / 2) | 0;
      var tronc = l_troncons[index];
      // sélectionner 1 point de ce tronçon
      var geom = tronc.geometry.coordinates[0];
      var coord_idx = (geom.length / 2) | 0;
      return geom[coord_idx];
    });
  }

  //obtient les données de la voie idLane
  function getLaneData(idlane, signal) {
    return fetch(laneData + idlane, { signal: signal })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (response) {
        return { response: response };
      });
  }

  // obtiens un point sur la voie et l'affiche
  var displayLocationLane = function (idlane, zoom, querymaponclick) {
    getPointOnLane(idlane).then((coord) => {
      var coordNewProj = proj4("EPSG:3948", "EPSG:4326", coord);
      displayLocation(coordNewProj[0], coordNewProj[1], zoom, querymaponclick);
    });
  };

  // affiche une coordonnée sur la carte
  var displayLocation = function (coordX, coordY, zoom, querymaponclick) {
    $("#searchfieldRM").val("");
    mviewer.zoomToLocation(coordX, coordY, zoom, querymaponclick);
    mviewer.hideLocation();
  };

  //affiche les coordonnées de l'adresse
  var displayLocationMarker = function (
    coordX,
    coordY,
    zoom,
    querymaponclick,
    proj,
  ) {
    $("#searchfieldRM").val("");
    mviewer.zoomToLocation(coordX, coordY, zoom, querymaponclick);
    mviewer.showLocation(proj, coordX, coordY);
  };

  //affiche un organisme
  var displayOrganism = async function (elem, zoom, querymaponclick) {
    var mainSite = elem.title;
    var site = await _getSiteFromOrg(mainSite);
    var coord = await _getSiteCoordinates(site.site[0].id);
    var coordNewProj = proj4("EPSG:3948", "EPSG:4326", [coord.x, coord.y]);
    mviewer.zoomToLocation(
      coordNewProj[0],
      coordNewProj[1],
      zoom,
      querymaponclick,
    );
    mviewer.showLocation("EPSG:4326", coordNewProj[0], coordNewProj[1]);
  };

  /**
   * get [x,y] coordinates from site
   * @param {*} site
   * Obtiens les coordonnées de notre site
   */
  var _getSiteCoordinates = function (idSite) {
    return fetch(apiSitesOrg + "sites/" + idSite, {
      headers: { "X-API-KEY": apiSitesOrgkey },
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (res) {
        return { x: res.sitePt.x, y: res.sitePt.y };
      });
  };

  /**
   * get main site information from organism
   * @param {*} org organism
   * retourne un site depuis l'api sitesOrg
   */
  var _getSiteFromOrg = function (mainSite) {
    var requestUrl =
      apiSitesOrg +
      "recherche?adresse=&etats[]=actif&etats[]=projet&etats[]=inactif&niveaux_org[]=3" +
      "&niveaux_org[]=1&niveaux_org[]=2&niveaux_site[]=1&termes=" +
      encodeURIComponent(mainSite) +
      "&termes_op=AND&types[]=site&limit=20&offset=0";

    return fetch(requestUrl, { headers: { "X-API-KEY": apiSitesOrgkey } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (site) {
        return { site: site };
      });
  };

  //////////////////// Search input /////////////////////////////////////////////////
  // Retourne les villes en fonction de si elles correspondent à la recherche
  var _filterCities = function (citiesList, elemSearch, citiesSearch) {
    var citiesFound = [];
    if (typeof citiesSearch !== "undefined") {
      // var citiesSearchSplitArray = citiesSearch.split(',');
      citiesList.forEach(function (city) {
        var citiesFilter = citiesSearch.findIndex(
          (item) => city.name.toLowerCase() === item.toLowerCase(),
        );

        if (
          (city.name.toLowerCase().startsWith(elemSearch.toLowerCase()) ||
            city.name2.toLowerCase().startsWith(elemSearch.toLowerCase())) &&
          citiesFilter !== -1
        ) {
          citiesFound.push(city);
        }
        if (
          (city.name.toLowerCase().includes(elemSearch.toLowerCase()) ||
            city.name.toLowerCase() === elemSearch.toLowerCase() ||
            city.name2.toLowerCase().includes(elemSearch.toLowerCase()) ||
            city.name2.toLowerCase() === elemSearch.toLowerCase()) &&
          citiesFound.indexOf(city) === -1 &&
          citiesFilter !== -1
        ) {
          citiesFound.push(city);
        }
      });
    } else {
      citiesList.forEach(function (city) {
        if (
          city.name.toLowerCase().startsWith(elemSearch.toLowerCase()) ||
          city.name2.toLowerCase().startsWith(elemSearch.toLowerCase())
        ) {
          citiesFound.push(city);
        }
        if (
          (city.name.toLowerCase().includes(elemSearch.toLowerCase()) ||
            city.name.toLowerCase() === elemSearch.toLowerCase() ||
            city.name2.toLowerCase().includes(elemSearch.toLowerCase()) ||
            city.name2.toLowerCase() === elemSearch.toLowerCase()) &&
          citiesFound.indexOf(city) === -1
        ) {
          citiesFound.push(city);
        }
      });
    }
    return citiesFound;
  };

  var _getBoundingBoxCenterX = function (lowerCorner, upperCorner) {
    var xmin = parseFloat(lowerCorner.split(" ")[0]);
    var xmax = parseFloat(upperCorner.split(" ")[0]);
    return (xmin + xmax) / 2;
  };

  var _getBoundingBoxCenterY = function (lowerCorner, upperCorner) {
    var ymin = parseFloat(lowerCorner.split(" ")[1]);
    var ymax = parseFloat(upperCorner.split(" ")[1]);
    return (ymin + ymax) / 2;
  };

  //retourne les voies correspondantes à notre recherche
  var _filterLanes = function (lanesData) {
    var lanesFound = [];
    var lanes = lanesData.result.rva.answer.lanes || [];
    if (typeof lanesData.citiesSearch !== "undefined") {
      lanes.forEach(function (lane) {
        if (
          lanesData.citiesSearch.findIndex(
            (item) =>
              lane.name4.split(",")[1].trim().toLowerCase() ===
              item.trim().toLowerCase(),
          ) !== -1
        ) {
          lanesFound.push(lane);
        }
      });
      lanes.forEach(function (lane) {
        if (
          lane.name
            .replace(/[^0-9A-zÀ-ú' ]/g, " ")
            .trim()
            .toLowerCase()
            .includes(
              lanesData.id
                .replace(/[^0-9A-zÀ-ú' ]/g, " ")
                .trim()
                .toLowerCase(),
            )
        ) {
          lanesFound.unshift(lane);
        }
      });
    } else {
      lanesFound = lanes;
    }
    if (lanesFound.length == 0) {
      lanesFound = lanes;
    }
    return lanesFound.slice(0, lanesData.nbItemDisplay);
  };

  //permet de filtrer les adresses et les renvoie selon un tri numérique
  var _filterAddresses = function (addressesData) {
    var addressesFound = [];
    var addresses = addressesData.result.rva.answer.addresses;
    if (addressesData.id.includes(",")) {
      if (typeof addressesData.citiesSearch !== "undefined") {
        addresses.forEach(function (address) {
          if (
            addressesData.citiesSearch.findIndex(
              (item) =>
                address.addr3.split(",")[1].trim().toLowerCase() ===
                item.toLowerCase(),
            ) !== -1
          ) {
            addressesFound.push(address);
          }
        });
      } else {
        addressesFound = addresses;
      }
      if (addressesFound.length == 0) {
        addressesFound = addresses;
      }
    } else {
      if (typeof addressesData.citiesSearch !== "undefined") {
        addresses.forEach(function (address) {
          if (
            addressesData.citiesSearch.findIndex(
              (item) =>
                address.addr3.split(",")[1].trim().toLowerCase() ===
                item.toLowerCase(),
            ) !== -1
          ) {
            if (
              address.addr3
                .split(",")[0]
                .replace(/[^0-9A-zÀ-ú' ]/g, " ")
                .trim()
                .toLowerCase()
                .includes(addressesData.id.toLowerCase())
            ) {
              addressesFound.push(address);
            }
          }
          if (
            address.addr3
              .split(",")[0]
              .replace(/[^0-9A-zÀ-ú' ]/g, " ")
              .trim()
              .toLowerCase()
              .includes(addressesData.id.toLowerCase())
          ) {
            addressesFound.unshift(address);
          }
        });
        if (addressesFound.length == 0) {
          addresses.forEach(function (address) {
            if (
              addressesData.citiesSearch.findIndex(
                (item) =>
                  address.addr3.split(",")[1].trim().toLowerCase() ===
                  item.toLowerCase(),
              ) !== -1
            ) {
              addressesFound.push(address);
            }
          });
        }
      } else {
        addresses.forEach(function (address) {
          if (
            address.addr3
              .split(",")[0]
              .replace(/[^0-9A-zÀ-ú' ]/g, " ")
              .trim()
              .toLowerCase()
              .includes(addressesData.id.trim().toLowerCase())
          ) {
            addressesFound.push(address);
          }
        });
      }
    }
    addressesFound = addressesFound.sort(function (a, b) {
      return a["number"] - b["number"];
    });
    return addressesFound.slice(0, addressesData.nbItemDisplay);
  };

  //renvoie les organismes du résultat trié par la saisie
  var _filterOrganisms = function (organismsData) {
    var organismsFound = [];
    var organisms = organismsData.result;
    if (typeof organismsData.citiesSearch !== "undefined") {
      // var citiesSearchSplitArray = organismsData.citiesSearch.split(',');
      organisms.forEach(function (organism) {
        if (
          organism.autres !== null &&
          organismsData.citiesSearch.findIndex(
            (item) =>
              organism.autres[0].split(":")[1].trim().toLowerCase() ===
              item.toLowerCase(),
          ) !== -1
        ) {
          organismsFound.push(organism);
        }
      });
    } else {
      organisms.forEach(function (organism) {
        organismsData.id.split(" ").forEach(function (splitRequest) {
          if (
            organism.autres !== null &&
            organism.nom.toLowerCase().includes(splitRequest.toLowerCase())
          ) {
            organismsFound.push(organism);
            requestDone = true;
          }
        });
      });
      // organismsFound = organisms;
    }
    return organismsFound.slice(0, organismsData.nbItemDisplay);
  };

  /**
   * get main site from organism
   * @param {*} org organism
   * Renvoie le nom du site envoyé en argument
   */
  var _getMainSite = function (org) {
    var mainSite = "";
    if (org.autres !== null) {
      org.autres.forEach(function (data) {
        if (data.includes("Site principal :")) {
          mainSite = data.split(":")[1].trim();
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
    getAutocompleteData: _displayAutocompleteData,
  };
})();

setTimeout(searchRM.enable, 2000);

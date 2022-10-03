
mviewer.customLayers.piscinesRM= (function() {

    // var apiKey = rmOptionsManager.getApplicationConfiguration().apiKey;
    var apiKey = 'c583383089f1c7e544e32cdf44c11045';

    let data_site = 'https://public.sig.rennesmetropole.fr/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=v_sitorg_site&outputFormat=application%2Fjson&srsname=EPSG:3857&CQL_FILTER=id_specialite_principale=95';

    let svgIcon='apps/site_internet/customlayer/picture/piscine-01.svg'
    //let svgIcon='apps/site_internet/customlayer/picture/piscine-02.svg'; 
    let stylesrc='apps/site_internet/customlayer/picture/marker.svg';
    let iconwidth = '35px';
    let iconheight = '35px';
    //let iconcolor = '#eb5046'; 
    //let iconcolor = '#95c351';
    let iconcolor ='#ffffff';

    /********************************
    * ***        DATA             ***
    ********************************/

    /**
    * Requete http sans header (WFS geoserver)
    **/
    function getHttpData(request){
        return new Promise(resolve => {
            $.ajax({
                url: request,
                context: document.body,
            }).done(function (res) {
                resolve({'response': res, 'category': 'geoserver'});
            });
        });

    }

    /**
    * Requete http avec header (API S&O qui nécessite une clé en header)
    **/
    function sitesorgs_data(requestUrl, principal=false) {
        return new Promise(resolve => {
            $.ajax({
                url: requestUrl,
                context: document.body,
                headers: {'X-API-KEY': apiKey}
            }).done(function (res) {
                resolve({'response': res, 'category': 'sitesorg','org_principal' : principal});
            });
        });
    };

    /**
    * Données agglomérées des piscines et de leurs bassins
    **/
    function getSiteData(){
        let piscines = layer.getSource().getFeatures();
        for (site in piscines) {
            site_data = piscines[site];
            site_data.set("bassins",[]);
            // récupération des données du site pour obtenir la liste des organismes liés
            sitesorgs_data('https://api-sitesorg.sig.rennesmetropole.fr/v1/sites/' + piscines[site].get('id_site')).then(function(result_site){
                let piscines_org = result_site.response.organismes;
                for (org in piscines_org) {
                    // récupération des données de chaque organisme (pour les grilles horaires)
                    sitesorgs_data('https://api-sitesorg.sig.rennesmetropole.fr/v1/organismes/' + piscines_org[org].idOrganisme.idOrganisme, piscines_org[org].flagOrganismePrincipal).then(function (result_org, siteid=site_data.getId()) {
                        let org_detail = result_org.response;
                        updateFeature(result_org);

                    });

                }
            });

            // console.log(piscines[site]);
        }
    }

    function updateFeature(org_data) {
        // Recherche de la feature concernée par l'organisme
        var feature = getFeatureFromIdSite(org_data.response.sites[0].idSite.idSite);
        org_data.response.horairesOuvertures = cleanedHoraires(org_data.response.horairesOuvertures);

        if (feature != undefined && org_data.org_principal){
            // organisme principal = données principales de la piscine
            feature.set('idOrganisme', org_data.response.idOrganisme);
            feature.set('nomUsage', org_data.response.nomUsage);
            feature.set('descriptif', org_data.response.descriptif);
            //champs adresse
            feature.set('adresse_postale_adr', org_data.response.sites[0].adressePostaleAdr);
            feature.set('adresse_postale_bp_cs', org_data.response.sites[0].adressePostaleBpCs);
            feature.set('adresse_postale_cp', org_data.response.sites[0].adressePostaleCp);
            feature.set('adresse_postale_comm', org_data.response.sites[0].adressePostaleComm);
            feature.set('adresse_postale_cedex', org_data.response.sites[0].adressePostaleCedex);
            feature.set('horairesOuvertures', org_data.response.horairesOuvertures);
            feature.set('joursFermes', org_data.response.joursFermes);
            // console.log(feature);
            // console.log(feature.values_.bassins);
            // ma_string='';
            // for (jf in org_data.response.joursFermes){
            //   ma_string += org_data.response.joursFermes[jf].value;
            // }
            // feature.set('jours_excep_fermes', ma_string);
            var content = feature.values_.horairesOuvertures;
            content.forEach((periode, i) => {
              var testedHoraires = 0;
              periode.horaires.forEach((horaire, i) => {
                if(horaire.ouvert1 != null){
                  testedHoraires++;
                }
              });
              if(testedHoraires === 0) {
                delete periode.horaires;
              };
            });


            fermetures(true,feature)
            fermetures(false,feature)

        } else if(org_data.response.nomenclatures[0].idSpecialite.code=='9.2.1'){
            // organisme secondaire = bassin
            feature.get('bassins').push(org_data.response);
            if (feature != undefined && org_data.response){
              var bassins = feature.values_.bassins;
              bassins.forEach((bassin, i) => {
                if(bassin.horairesOuvertures){
                  bassin.horairesOuvertureBassins = bassin.horairesOuvertures;
                  delete bassin.horairesOuvertures;
                }
              });
            }
        }
    }

    function getFeatureFromIdSite(idSite) {
        var features = layer.getSource().getFeatures();
        var retour;
        for (feat in features){
            if(idSite == features[feat].get('id_site')) {
                retour = features[feat];
                break;
            }
        };
        return retour;
    }

    function fermetures(piscines,feature){
      if(piscines){
        fermeturesLogic(feature.values_.joursFermes,feature,true);
      }else{
        items = feature.values_.bassins;
        if(items.length > 0){
          items.forEach((item, i) => {
            fermeturesLogic(item.joursFermes,feature,false,i);
          });
        }
      }
    }

    function fermeturesLogic(horaires,feature,isPiscine,bassinNumber = 0){
      var li_feries_st = [];
      var li_vac_st = [];
      if (horaires != undefined){
        if(horaires){
          if(horaires.fermeArmistice1918 === true){
            li_feries_st.push('Armistice 1918');
          }
          if(horaires.fermeAscension === true){
            li_feries_st.push('Ascension');
          }
          if(horaires.fermeAssomption === true){
            li_feries_st.push('Assomption');
          }
          if(horaires.fermeFeteNationale === true){
            li_feries_st.push('Fête Nationale');
          }
          if(horaires.fermeFeteTravail === true){
            li_feries_st.push('Fête du Travail');
          }
          if(horaires.fermeJourAn === true){
            li_feries_st.push('Jour de l\'an');
          }
          if(horaires.fermeLundiPaques === true){
            li_feries_st.push('Lundi de Pâques');
          }
          if(horaires.fermeLundiPentecote === true){
            li_feries_st.push('Lundi de Pentecote');
          }
          if(horaires.fermeNoel === true){
            li_feries_st.push('Noël');
          }
          if(horaires.fermeToussaint === true){
            li_feries_st.push('Toussaint');
          }
          if(horaires.fermeVacancesEte === true){
            li_vac_st.push('Vacances d\'Ete');
          }
          if(horaires.fermeVacancesHiver === true){
            li_vac_st.push('Vacances d\'Hiver');
          }
          if(horaires.fermeVacancesNoel === true){
            li_vac_st.push('Vacances de Noël');
          }
          if(horaires.fermeVacancesPrintemps === true){
            li_vac_st.push('Vacances de Printemps');
          }
          if(horaires.fermeVacancesToussaint === true){
            li_vac_st.push('Vacances de Toussaint');
          }
          if(horaires.fermeVictoire1945 === true){
            li_feries_st.push('Victoire 1945');
          }

          var li_fermetures = [];
          // Traitement des Jours fériés
          //li_fermetures = li_fermetures.concat('Jours ou périodes de fermeture : ');
          li_fermetures = li_fermetures.concat(li_feries_st);


          // Traitement des Vacances
          li_fermetures = li_fermetures.concat(li_vac_st);
          li_fermetures = li_fermetures.toString();
          li_fermetures = li_fermetures.replace(' ,', ' ');

          // Traitement des fermetures exceptionnelles
          var li_fermex;
          if (horaires.joursExcept.length > 0){
              li_fermex = JSON.stringify(horaires.joursExcept).replace(/,/g, '|');
          }

          if(isPiscine){
            feature.set('jours_fermes', li_fermetures);
            if (li_fermex!= undefined){
                feature.set('fermetures_excepts', li_fermex);
            }
          } else {
            feature.values_.bassins[bassinNumber].jours_fermes = li_fermetures;
            if (li_fermex!= undefined){
                feature.values_.bassins[bassinNumber].fermetures_excepts= li_fermex;
            }
          }
        }
      }
    }

    function getElemANotInListB(listA, listB){
        // elements = copie de la liste A
        var elements=Array.from(listA);

        for (var i = 0, lenB = listB.length; i < lenB; i++) {
            //var match = null;
            for (var j = 0, lenA = elements.length; j < lenA; j++) {
                if (listB[i].toUpperCase().trim() === elements[j].toUpperCase().trim()) {
                    // correspondance, on supprime l'entrée de la copie de la liste A
                    //match = j;
                    elements.splice(j, 1);
                    break;
                }
            }

        }
        return elements;
    }

    function cleanedHoraires(horairesColl){
        var valide = [];
        var refDebut;
        var now = new Date().setHours(0,0,0,0);
        for ( let i=0; i < horairesColl.length; i++){
            var debut = new Date(horairesColl[i].dateDebut);
            if (horairesColl[i].dateFin == undefined || horairesColl[i].dateFin == null || new Date(horairesColl[i].dateFin) > now){
                if (debut > now) {
                    valide.push(horairesColl[i]);
                } else if (refDebut == undefined || refDebut == null || refDebut < debut) {
                    valide.push(horairesColl[i]);
                    refDebut = debut;
                }
            }
        }
        // consever uniquement les horaires dont début >= refDebut
        let l_cleaned = [];
        for ( let j=0; j < valide.length; j++){
            if (new Date(valide[j].dateDebut) >= refDebut) {
                l_cleaned.push(valide[j]);
            }
        }

        l_cleaned.sort(compareHoraires);
        l_cleaned.forEach((item, i) => {
          if(i<l_cleaned.length-1){
            if(item.dateFin === null && Date.parse(item.dateDebut) < Date.parse(l_cleaned[i+1].dateDebut)){
              item.dateFin = l_cleaned[i+1].dateDebut;
            }
          }
        });
// code pour tester les grilles horaires

// if (l_cleaned.length >0) {
//     for (var k = 0; k < Math.floor(Math.random() * 10);k++){
//         l_cleaned.push(l_cleaned[0]);
//     }
// console.log(l_cleaned);
// }

//fin code test grilles horaires
        return l_cleaned;
    }

    function compareHoraires( horA, horB ) {
       debA = new Date(horA.dateDebut);
       debB = new Date(horB.dateDebut);
      if ( debA < debB ){
        return -1;
      }
      if ( debA > debB ){
        return 1;
      }
      return 0;
    }



    /********************************
    * ***     REPRESENTATION      ***
    ********************************/
    function markerstyle() {
        let style = new ol.style.Style({
                image: new ol.style.Icon({
                  //color: '#e45e52',  //ba8e02
                  //color: iconcolor,
                  anchor:[0.5,0.5],
                  src: stylesrc,
                  //src: 'apps/site_internet/customlayer/picture/sportCulture17-01.svg',
                  //src: 'apps/site_internet/customlayer/picture/piscine-02.svg',
                  //src: 'apps/site_internet/customlayer/picture/marker.svg',
                })
              });
        
        return [style];
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
                stylesrc = 'data:image/svg+xml;utf8, ' + encodeURIComponent(doc.getElementsByTagName("svg")[0].outerHTML);
                
                //console.log("SRC = "+ stylesrc);
            }
        };
        xhr.open('get',svgIcon); 
        xhr.send();
    }

    let layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url : data_site,
        }),
        style: markerstyle,
    });



    //layer.getSource().once('change',() =>{
    layer.once('prerender',() =>{
        calculateStyleIcon();
        getSiteData();
    });

    return {
        layer: layer,
    }
}());
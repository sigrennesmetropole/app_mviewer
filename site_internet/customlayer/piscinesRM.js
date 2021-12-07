
mviewer.customLayers.piscinesRM= (function() {

    // TODO : cacher la clé d'API dans un fihcier de conf
    var apiKey = 'c583383089f1c7e544e32cdf44c11045';

    let data_site = 'https://public.sig.rennesmetropole.fr/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=v_sitorg_site&outputFormat=application%2Fjson&srsname=EPSG:3857&CQL_FILTER=id_specialite_principale=95';


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
            // console.log(feature.values_.nom_site);
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

        } else{
            // organisme secondaire = bassin
            feature.get('bassins').push(org_data.response);
            if (feature != undefined && org_data.response){
              // console.log(feature);
              var bassins = feature.values_.bassins;
              bassins.forEach((bassin, i) => {
                if(bassin.horairesOuvertures){
                  bassin.horairesOuvertureBassins = bassin.horairesOuvertures;
                  if(bassin.horairesOuvertures.length === 0){
                    bassin.horairesOuvertureBassins = null;
                  };
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
                  color: '#ba8e02',  //ba8e02
                  crossOrigin: 'anonymous',
                  scale:1,
                  anchor:[0.5,1],
                  src: 'apps/site_internet/customlayer/picture/marker.svg',
                }),
              });
        return [style];
    }




    let layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url : data_site,
        }),
        style: markerstyle,
    });



    layer.getSource().once('change',() =>{
        getSiteData();
        /*
        layer.getSource().on('change',() =>{
            console.log(layer.getSource().getFeatures());
        });
        */
    });

    return {
        layer: layer,
    }
}());

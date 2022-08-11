// CustomComponent = gestion de l'expérience utilisateur (fenêtre, actions, etc.). Communique avec le customLayer
const _config = mviewer.customComponents.gestionPointsRM.config;
const l_markers = _config.options.icones;
const _map = mviewer.getMap();


const categories = (function() {

    //TODO : ajout de point par coordonnées (utile ?)
    //TODO : Activation/désactivation de la recherche par adresse / par organisme

    var localisations = mviewer.customLayers.meslocalisations;
    var allcategories = [];



  function _getCategorieById(id){
      for (categ in allcategories) {
          if (allcategories[categ].getId() == id){
              return allcategories[categ];
          }
      }
  }

  function _getCategoryNameOnForm(categorieid){
      return $("#"+categorieid+"-nameconf").val();
  }

  function _setCategoryNameOnForm(categorieid, name){
      $("#"+categorieid+"-nameconf").val(name);
  }

  function _getSelectedColor(categorieid){
      return $("#"+categorieid+"-markercolor ").val();
  }

  function _setSelectedColor(categorieid, color){
      $("#"+categorieid+"-markercolor ").val(color);
  }

  function _getSelectedShape(categorieid){
      return $("#"+categorieid+"-markershape option:selected").text();
  }

  function _getSelectedShapeURL(categorieid){
      return $("#"+categorieid+"-markershape option:selected").val();
  }

  function _setSelectedShapeURL(categorieid, url){
      $("#"+categorieid+"-markershape option[value='"+url+"']").prop('selected', true);
  }

  function _updateCategorie(id){
      var nom = _getCategoryNameOnForm(id);
      var forme = _getSelectedShape(id);
      var formeSrc= _getSelectedShapeURL(id);
      var couleur = _getSelectedColor(id);
      var scale = 1;

      // update attributs Categorie
      _getCategorieById(id).updateCategorie(nom, forme,couleur);
      // update shown marker
      _refreshSvgMarker(id);
      // update style couche meslocalisations
      _calculateStyle(id, formeSrc, couleur,_getCategorieById(id).getIconeAnchor());
      // update listes de categories
      _updateFicheInfoCateg();
      _refreshLegend();
  }


  function _refreshSvgMarker(categorieId){
      _showSvgMarker("showmarker"+categorieId, _getSelectedShapeURL(categorieId), _getSelectedColor(categorieId));

  }

      // retourne le style par défaut paramétré dans le fichier config
  function _setDefaultStyle(){
      icone = _config.options.defaultstyle["icone"];
      couleur = _config.options.defaultstyle["couleur"];
      src = l_markers[icone].src;
      anchor = l_markers[icone].anchor;

      setTimeout(_calculateStyle(null, src, couleur, anchor), 150); // Attente du chargement de la lib Snap

  }

  function _calculateStyle(id, url, couleur, anchor){
      // calcul de l'échelle par rapport à l'image svg
      var maxwidth=_config.options.maxmarkerwidth;
      var svgWidth = maxwidth;
      let svgContent ='';
      fetch(url).then((response)=>{
          response.text().then((xml)=>{
              svgContent = xml;
              let parser = new DOMParser();
              let xmlDOM = parser.parseFromString(svgContent, "image/svg+xml");
              let svgTag = xmlDOM.querySelectorAll('svg')[0];
              svgWidth = svgTag.width.baseVal.value;
              if (svgWidth > maxwidth) { return (maxwidth / svgWidth);}
              else {return 1; }
          }).then((echelle) => {
              localisations.updateStyle(id, _getOLStyle(couleur, url, echelle, anchor));
          }).then(() => {_refreshLegend()});
      });
  }


  function _showSvgMarker(svgid, url, color) {

      var s = Snap("#"+svgid);
      if (s) {
          var svgMarker = Snap.load(url, function ( f ) {
            var g = f.select("g");
            g.attr({fill: color});
            g.parent().attr({width:'100%', height:'100%'});
            s.clear();
            s.append( f );
            });
      }
  }

  function _showAllStyles(){
      // vider le tableau
      $("#configLCateg tr").remove();
      // ajouter le style par défaut
      _initDefaultCategConfig();
      // ajouter les styles existants
      for (categ in allcategories) {
        _addCategInConfigWindow(allcategories[categ].getId(), allcategories[categ].getNom(), allcategories[categ].getIconeURL(), allcategories[categ].getCouleur());
      }
  }

  function _addCategInConfigWindow(id, nom, iconeURL, couleur) {
      var newCateg=false;
      if ( id == undefined) {
        id = _getNextCategorieId();
        newCateg=true
        };
      var html = '<tr categorieId='+ id +'><td><input type="text" class="categNameInput" id="'+ id +'-nameconf" onchange="categories.updateCategorie('+id+');"  maxlength="60" /> </td>';
          html += '  <td id="'+ id +'-iconconf" class="categStyleConf">';
          html += '    <select id="'+id+'-markershape" class="icones-value" onchange="categories.updateCategorie('+id+');">';
          html += _getAvailableIconsHTMLList();
          html += '</select>';
          html += '    <input id="'+id+'-markercolor" type="color" list="presetColors" onchange="categories.updateCategorie('+id+');" />';
          html += '      <datalist id="presetColors"><option>#f78b12</option><option>#e04a3c</option><option>#33919d</option><option>#aa0c8b</option><option>#737543</option><option>#3e476c</option></datalist>';
          html += '<svg id="showmarker'+id+'" preserveAspectRatio="xMidYMid meet" class="confImg" ></svg></td>';
          html += '<td class="alig-center"><button id="delcategbtn'+id+'" type="button" class="btn btn-default navbar-btn mv-navbar-btn" data-toggle="modal" data-target="#delete-modal" i18n="help.modal.doc" title="Supprimer la catégorie"><i class="btn fa fa-trash-alt" ></i></button></td></tr>';

          $("#configLCateg").prepend(html);
          $("#"+id +"-nameconf").focus();

          $("#delcategbtn"+id).on("click",  function () {
              $("#categorieASuppr").attr('categid', id);
          });


          // ajout de la nouvelle catégorie dans la liste des catégories
          if (newCateg == true){
              allcategories.push(new Categorie(id, $("#"+ id +"-nameconf").attr("value"), $("#"+ id +"-markershape option:selected").text, couleur));
              _updateCategorie(id);
          } else {
              _setCategoryNameOnForm(id,nom);
              _setSelectedShapeURL(id, iconeURL);
              _setSelectedColor(id,couleur);
              _refreshSvgMarker(id);
              _updateFicheInfoCateg();
          }
  }

  function _getNextCategorieId(){
      let nextid=1;
      for (index in allcategories) {
          if (allcategories[index].getId() >= nextid){
          nextid =allcategories[index].getId() +1;
          }
      }
      return nextid;
  }



  function _getAvailableIconsHTMLList(){
      var html="";
      for (const [nom, url] of Object.entries(l_markers)) {
        html += '<option value="' + url.src + '" >' + nom + '</option>';
      }
      return html;
  }

  function _getOLStyle(couleur, IconeSrc, echelle, anchor){
      var style = new ol.style.Style({
            image: new ol.style.Icon({
              color: couleur,
              crossOrigin: 'anonymous',
              scale: echelle,
              src: IconeSrc,
            }),
          });
      if (anchor != undefined){style.getImage().setAnchor(anchor);}
      return style;
  }

  // retourne le style par défaut paramétré dans le fichier config
  function _getDefaultStyle(){
      icone = _config.options.defaultstyle["icone"];
      couleur = _config.options.defaultstyle["couleur"];
      src = l_markers[icone].src;
      anchor = l_markers[icone].anchor;

      var style = _getOLStyle(couleur, src, echelle, anchor)
      return style;
  }

  function _delCategorie(id, removePoints){
      // update configuration
      for (categ in allcategories) {
          if (allcategories[categ].getId() == id){
              allcategories.splice(categ,1);
              break;
          }
      }
      // update map
      localisations.deleteStyle(id, removePoints);
      // refresh configuration window
      _showAllStyles();
      _refreshLegend();
  }

  function _initDefaultCategConfig() {
      nom = "Points sans catégorie";
      var defaultStyle;
      defaultStyle = localisations.getDefaultStyle()[0];
      iconUrl = defaultStyle.getImage().getSrc();
      iconName = "icone par défaut";
      for (const [nomIcone, url] of Object.entries(l_markers)) {
        if (url.src == iconUrl) {
          iconName = nomIcone;
          break;
        }
      }
      couleurRGB = defaultStyle.getImage().getColor();
      couleurHex = _rgbToHex(couleurRGB[0], couleurRGB[1], couleurRGB[2]);
      var html = '<tr default><td><i>'+ nom + '</i> </td>';
          html += '  <td id="default" class="categStyleConf">';
          html += '    <label id="default-markershape" class="icones-value" >'+ iconName +'</label>';
          html += '    <input id="default-color" type="color" value="'+ couleurHex +'" disabled />';
          html += '<svg id="default-showmarker" preserveAspectRatio="xMidYMid meet" class="confImg" ></svg></td>';
          html += '<td></td></tr>';

      $("#configLCateg").append(html);

      _showSvgMarker("default-showmarker", iconUrl, couleurHex);
  }

  // Met à jour la liste des catégories des fiches d'info ouvertes
  function _updateFicheInfoCateg () {
    var categorieTrouvee = false;
    // vider la liste
    $(".categ-choice").html('');
    categid = $(".categ-choice").attr("ptcategorie");
    // insérer toutes les catégories enregistrées
    for (index in allcategories) {
        let selected = false;
        if(categid != undefined && allcategories[index].getId()==categid){
            selected=true;
            categorieTrouvee = true;
        }
        $(".categ-choice").append(new Option(allcategories[index].getNomForList(), allcategories[index].getId(),selected,selected));
    }
    // ajouter la catégorie par défaut en tete
    $(".categ-choice").prepend(new Option("-- Sans catégorie (défaut) --", "0", !categorieTrouvee, !categorieTrouvee));
  }


  function _refreshLegend(){
      legend_div=$("#leg-loctable");
      legend_div.empty();
      // ajouter toutes les catégories
      for (categ in allcategories) {
          let id = allcategories[categ].getId();
          let html='<tr categorieId='+ id +'>';
          html += '  <td><svg id="legendmarker'+id+'" preserveAspectRatio="xMidYMid meet" class="confImg" ></svg></td>';
          html += '  <td><span class="legendcategname">'+ allcategories[categ].getNomForList() +'</span></td>';
          html += '</tr>';
          legend_div.append(html);
          _showSvgMarker("legendmarker"+id, allcategories[categ].getIconeURL(), allcategories[categ].getCouleur());
      }
      // ajouter la "non catégorie" (catégorie par défaut)
      defaultStyle = localisations.getDefaultStyle()[0];
      iconUrl = defaultStyle.getImage().getSrc();
      couleurRGB = defaultStyle.getImage().getColor();
      couleurHex = _rgbToHex(couleurRGB[0], couleurRGB[1], couleurRGB[2]);
      let htmldef='<tr>';
          htmldef += '  <td><svg id="legendmarker-default" preserveAspectRatio="xMidYMid meet" class="confImg" ></svg></td>';
          htmldef += '  <td><span class="legendcategname"> Points sans catégorie </span></td>';
          htmldef += '</tr>';
          legend_div.append(htmldef);
      _showSvgMarker("legendmarker-default", iconUrl, couleurHex);
  }

  /** Fonctions liées aux points **/
  function _createNewEmptyPoint(coordonees){
      localisations.addNewFeature(coordonees);
  }

  function _delPoint(id){
      localisations.deleteFeature(id);
      $("#mv_marker").hide();
      $('#right-panel').removeClass("active");
  }
  function _delAllPoints(){
      localisations.deleteAllFeatures();
      if ($("#right-panel").hasClass("active")) {
        $("#right-panel").toggleClass("active");
      }
      $("#mv_marker").hide();
  }

  function _updatePoint(id){
      var fiche = $(".item[featId='"+id+"']");
      var nom = fiche.find(".nomdupoint").val();
      var selectedCateg = fiche.find(".categ-choice option:selected").val();
      var categorie = _getCategorieById(selectedCateg);
      $(".categ-choice").attr("ptcategorie",selectedCateg);
      var description = fiche.find(".descriptiondupoint").val();

      localisations.updateFeature(id, nom, categorie, description);
  }

  function _refreshCoordDisplay(pointid, newcoord) {
      $("#mv_marker").hide();
      $("#createPointOnMapTooltip").hide();
      var fiche = $(".item[featId='"+pointid+"']");
      if(fiche != undefined && fiche.length >0){
          fiche.find(".longval")[0].innerHTML = newcoord[0];
          fiche.find(".latval")[0].innerHTML = newcoord[1];
      }
  }

  /** Export des points **/
  function _exportGeoJSON(){
      jsfeatures = localisations.featuresToGeoJSON();
      jsFeatures_str = JSON.stringify(jsfeatures);
      filename = ""+new Date().getFullYear() + "" +(new Date().getMonth() + 1) + "" + new Date().getDate() +"_localisations.geojson";


      var link = document.createElement('a');
      link.download = filename;
      var blob = new Blob([jsFeatures_str], {type: 'application/json'});
      link.href = window.URL.createObjectURL(blob);
      link.click();
  }

  /** Fonctions liées aux couleurs **/
  function _componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

  function _rgbToHex(r, g, b) {
      return "#" + _componentToHex(r) + _componentToHex(g) + _componentToHex(b);
    }

  function _hidecreatebtn(){
      $("#createPointOnMapTooltip").hide();
  }
  
    function _showcreatebtn(){
      $("#createPointOnMapTooltip").show();
  }

  /** Fonctions d'initialisation **/
  function _initGUI () {
      $( document ).ready( function() {
          //Bouton acces configuration
          $("#iconconfig").prependTo($("#iconhelp").parent());

          //Affichage du titre de la carte
          $('#mapTitleInput').on('input', function (e) {
              $('.mv-title')[0].text = $('#mapTitleInput').val();
            });

          // Affichage de la légende
          $("#legend li[data-layerid='meslocalisations'] div.layerdisplay-legend").append ($("#legend-localisations"));

          // Bouton de creation de point
          _createBtn = new ol.Overlay({ positioning: 'top-center', element: $("#createPointOnMapTooltip")[0], stopEvent: true});
          _map.addOverlay(_createBtn);

          _map.on('singleclick', function(e){
            document.removeEventListener('infopanel-ready', _hidecreatebtn);
            _createBtn.setPosition( e.coordinate);
            _showcreatebtn();
            if ($('.popup-content ul.nav-tabs>li').length > 0 ){
                _hidecreatebtn();
            } else {
                document.addEventListener('infopanel-ready', _hidecreatebtn);
            }
          });

/*
          document.addEventListener('clickedNbFeaturesEvt', function(e){
          //document.addEventListener('infopanel-ready', (e) => {
              console.log(e);
              if ( e.detail.nbfeatures > 0) {
                $("#createPointOnMapTooltip").hide();
              }
          });
*/
          $("#createPointOnMapTooltip").on('click', function(e){
              let coord = _createBtn.getPosition();
              let coordProj = proj4('EPSG:3857', 'EPSG:4326', coord);
              // ajout d'un point sur la couche aux coordonnées cliquées
              _createNewEmptyPoint(coord);
              $("#createPointOnMapTooltip").hide();
              // simuler le clic sur les coordonnées pour ouverture automatique de la fiche créée
              var i = function () {
                    var ex = {
                        coordinate:coord,
                        pixel: _map.getPixelFromCoordinate(coord)
                    };
                    info.queryMap(ex);
                };
                setTimeout(i, 250); // timeout utile le temps que le point s'affiche sur la carte

          });

      });
  }


  return {
      init : ()  => {
          mviewer.getMap().once('rendercomplete', function(e) {
              // code d'initialisation
              _initGUI();

          });

          $(document).on('shown.bs.modal', $("#config-modal"), function() {
              _showAllStyles();
            });
      },
      updateCategorie: _updateCategorie,
      addCategInConfigWindow: _addCategInConfigWindow,
      delCategorie:_delCategorie,
      delPoint: _delPoint,
      delAllPoints: _delAllPoints,
      updateFicheInfoCateg: _updateFicheInfoCateg,
      updatePoint: _updatePoint,
      exportGeoJSON : _exportGeoJSON,
      refreshCoordDisplay : _refreshCoordDisplay,
      setDefaultStyle: _setDefaultStyle,
   };

})();

new CustomComponent("categories", categories.init());



/**************************************/
/****** Classe Catégorie **************/
/**************************************/
class Categorie {

  constructor(id, nom, icone, couleur) {
    this.id = id;
    this.nom = nom;
    this.icone = icone;
    this.couleur = couleur;
  }

   getId(){return this.id;}
   setId(id) {this.id=id;}
   getNom(){return this.nom;}
   getNomForList(){return (this.nom==undefined || this.nom.trim()=='')?"Catégorie sans nom #"+this.id:this.nom;}
   setNom(nom) {this.nom=nom;}
   getIcone(){return this.icone;}
   setIcone(icone) {this.icone=icone;}
   getCouleur(){return this.couleur;}
   setCouleur(couleur) {this.couleur=couleur;}

    updateCategorie(nom, icone, couleur){
       this.nom=nom;
       this.icone=icone;
       this.couleur=couleur;
    }
    getIconeURL() {
      return l_markers[this.icone].src;
    }

    getIconeAnchor() {
      // si non précisé, l'ancre est [0.5,0.5] au départ de l'angle haut-gauche. Ce qui indique un point d'ancrage au centre de l'icone
      return l_markers[this.icone].anchor;
    }
}

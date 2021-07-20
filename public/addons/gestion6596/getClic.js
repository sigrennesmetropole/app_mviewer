const clic = (function() {

  var _btn;
  var _map = mviewer.getMap();
  var _pinValues;
  var _containerPosition;
  var _layerFeature;
  var _pixelPosition;
  var _configurationPosition;
  var _categoryList = [];
  var _layerList = [];

  var _clic = function (evt) {
    _pixelPosition = evt.pixel;
    addPinOnMap(evt);
  };

  var addPinOnMap = function (evt) {
    _currentCoordinates = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');

      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(evt.coordinate),
        pinName: 'New Marker',
        categorie: 'New Category',
        description: 'Dummy',
        coordinates: _currentCoordinates
      });

      iconFeature = _getMarkerStyle(iconFeature);

      var vectorSource = new ol.source.Vector({
        features: [iconFeature]
      });
      this.dynamicPinLayer = new ol.layer.Vector({
        source: vectorSource
      });

      var clickInteraction = new ol.interaction.Select({
        condition: ol.events.condition.click,
        layer: [this.dynamicPinLayer]
      });

      _map.addInteraction(clickInteraction);

      clickInteraction.on('select', (e) => {
        if(e.selected[0] != undefined){
          _map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel_,function(feature,layer){
            _layerFeature = layer;
          })
          _pinValues = e.selected[0];
          _categoryList.forEach((item, i) => {
            if(item.name === _pinValues.getProperties().categorie){
              _getMarkerStyle(_pinValues,item.src);
            }else{
              _getMarkerStyle(_pinValues);
            }
          });

          _pixelPosition = e.mapBrowserEvent.pixel_;
          _getRightPanel();
        }
      });

      var modify = new ol.interaction.Modify({
        features: new ol.Collection([iconFeature]),
        pixelTolerance: 20
      });
      iconFeature.on('change',function(){
        var pinValues = _pinValues;
        pinValues.values_.coordinates = ol.proj.transform(this.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        _pinValues.setProperties(pinValues,false);
        if($("#pinLongitude")[0] != undefined){
          $("#pinLongitude")[0].value = _pinValues.getProperties().coordinates[0];
          $("#pinLatitude")[0].value = _pinValues.getProperties().coordinates[1];
        }
      },iconFeature);
      _map.addInteraction(modify);

      _map.addLayer(this.dynamicPinLayer);
      _pinValues = this.dynamicPinLayer.getSource().getFeatures()[0];
      _layerFeature = this.dynamicPinLayer;
      _layerList.push(this.dynamicPinLayer);

      _getRightPanel();
  }

  function _getRightPanel(){
    _containerPosition.empty();
    _closeConfig();
    _closeCreationByCoordinates();
    var pinValues = _pinValues.getProperties();
    _containerPosition.append(
      '<div id="closeCross">X</div>' +
      '<h2 class="wrapText">' + pinValues.pinName +
      '<svg id="editionCustomPanel" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0, 0, 400,400"><g id="svgg"><path id="path0" d="M300.391 12.504 C 294.523 13.318,286.530 16.197,280.671 19.607 C 275.834 22.423,58.825 238.125,56.590 242.339 C 55.976 243.497,45.617 274.174,33.569 310.512 C 9.961 381.714,10.652 379.096,14.270 383.630 C 19.144 389.736,17.536 390.112,91.406 365.542 L 157.422 343.584 268.037 232.925 C 390.724 110.189,382.290 119.338,385.959 104.993 C 391.948 81.576,386.806 69.609,358.607 41.351 C 331.904 14.591,321.721 9.545,300.391 12.504 M320.703 36.571 C 327.595 39.812,359.282 70.878,362.689 77.734 C 369.653 91.750,366.747 104.087,353.351 117.377 L 346.466 124.207 310.928 88.621 L 275.391 53.036 282.634 46.057 C 295.964 33.212,307.464 30.346,320.703 36.571 M295.901 104.104 L 331.248 139.458 241.797 228.906 L 152.346 318.355 116.797 282.812 L 81.248 247.270 170.506 158.010 C 219.597 108.917,259.941 68.750,260.158 68.750 C 260.376 68.750,276.460 84.659,295.901 104.104 M86.136 344.619 C 60.890 353.047,40.153 359.880,40.054 359.804 C 39.955 359.728,46.766 338.991,55.191 313.723 L 70.507 267.780 101.272 298.538 L 132.037 329.295 86.136 344.619 " stroke="none" ' +
      'fill="#4D4D4D" fill-rule="evenodd"></path></g></svg>' +
      ' </h2>' +
      '<p>' + pinValues.categorie + '</p>' +
      '<p class="wrapText">' + pinValues.description + '</p>' +
    '</div>');

    $("#custom-panel").css({'display':'block'});
    $('.wrapText').css({'overflow-wrap':'break-word'});
    $("#custom-panel #closeCross").css({'position':'fixed', 'right':'1em', 'padding-top':'40px'});
    $("#custom-panel h2").css({"padding": "36px 8px 6px 16px","text-decoration": "none","font-size": "25px","color": "#4D4D4D","display": "block"});
    $("#custom-panel svg").css({'width': '25px', 'height': '25px','align':'right', 'position':'fixed', 'right':'1em'});
    $("#custom-panel p").css({"padding": "6px 8px 6px 16px","text-decoration": "none","font-size": "15px","color": "#4D4D4D","display": "block"});

    var editionButton = document.getElementById("editionCustomPanel");
    editionButton.addEventListener('click', _setRightPanel);

    var closeButton = document.getElementById("closeCross");
    closeButton.addEventListener('click', _closeRightPanel);
  }

  function _setRightPanel(){
    _containerPosition.empty();
    // var pinValues = _pinValues.getProperties();
    _containerPosition.append(
      '<div id="closeCross">X</div>' +
      '<div id="editionContent">' +
        '<div class="divCenter">' +
          '<label for="name">Nom</label><br>' +
          '<input type="text" id="pinName" name="name" value="' + _pinValues.getProperties().pinName + '" maxlength="40"><br><br><br>' +
        '</div>' +
        '<div class="divCenter">' +
          '<label for="category">Categorie</label><br>' +
          '<select name="category" id="pinCategorie">' +
          '</select><br><br><br>' +
        '</div>' +
        '<div class="divCenter">' +
          '<label for="description">Description</label><br>' +
          '<textarea type="text" id="pinDescription" name="description" value="' + _pinValues.getProperties().description + '" maxlength="450"></textarea><br><br><br><br><br><br><br><br><br><br><br><br>' +
        '</div>' +
        '<div id="coordinatesContainer"><input type="text" id="pinLongitude" name="longitude" value="' + _pinValues.getProperties().coordinates[0] + '"> : <input type="text" id="pinLatitude" name="latitude" value="' + _pinValues.getProperties().coordinates[1] + '"></div>' +
        '<div id="validationContent">' +
          '<button id="pinSaveButton" type="button" class="btn">Enregistrer</button><br>' +
          '<button id="pinDeletionButton" type="button" class="btn cancel">Supprimer</button>' +
        '</div>' +
      '</div>'
    );

    _categoryList.forEach((item, i) => {
      if(_pinValues.getProperties().categorie === item){
        $("#pinCategorie").prepend(
          '<option value="' + item.name + '">' + item.name + '</option>'
        );
      }else{
        $("#pinCategorie").append(
          '<option value="' + item.name + '">' + item.name + '</option>'
        );
      }
    });

    $(".divCenter").css({'text-align':'center'});
    $("#pinName, #pinCategorie, #pinDescription").css({'width':'360px','padding':'10px','margin':'5px 5px 5px 5px','border':'none','background':'#eee'});
    $("#pinDescription").css({'height':'270px'});
    $("#pinLongitude, #pinLatitude").css({'width':'165px','padding':'10px','margin':'5px 5px 5px 5px','border':'none','background':'#eee'});
    $("#validationContent .btn").css({'background-color':'#8ebf42','color':'#fff','padding':'12px 12px','border':'none','cursor':'pointer','width':'100%','margin':'3px 3px 3px','margin-bottom':'8px','opacity':'0.8'});
    $("#validationContent .cancel").css({'background-color':'#cc0000'});
    $("#editionContent").css({"padding": "55px 8px 6px 16px","text-decoration": "none","font-size":"16px","color": "#4D4D4D","display": "block"});
    $("#custom-panel #closeCross").css({'position':'fixed', 'right':'1em', "padding-top": "40px"});
    $("#editionContent #pinName, #pinCategorie, #pinDescription").css({'position':'fixed', 'right':'1em'});
    $("#editionContent div").css({'margin':'2px'});
    $("#coordinatesContainer").css({'text-align': 'center'});

    var deletionButton = document.getElementById("pinDeletionButton");
    deletionButton.addEventListener('click', _deletePin);

    var saveButton = document.getElementById("pinSaveButton");
    saveButton.addEventListener('click', _savePin);

    var closeButton = document.getElementById("closeCross");
    closeButton.addEventListener('click', _closeRightPanel);
  }

  function _deletePin(){
    _layerFeature.getSource().removeFeature(_pinValues);
    _closeRightPanel();
  }

  function _savePin(){
    var pinValues = _pinValues.getProperties();
    pinValues.pinName = $("#pinName")[0].value;
    if($("#pinCategorie")[0].value === ""){
      pinValues.categorie = 'Catégorie Inconnue';
    }else{
      pinValues.categorie = $("#pinCategorie")[0].value;
    }

    if($("#pinDescription")[0].value === ""){
      pinValues.description = 'Pas de description fournie.';
    }else{
      pinValues.description = $("#pinDescription")[0].value;
    }
    pinValues.coordinates[0] = $("#pinLongitude")[0].value;
    pinValues.coordinates[1] = $("#pinLatitude")[0].value;

    _pinValues.setProperties(pinValues,false);

    // _pinValues.getGeometry().setCoordinates(pinValues.coordinates);

    if(_categoryList.length != 0){
      _categoryList.forEach((item, i) => {
        if(item.name === $("#pinCategorie")[0].value){
          _getMarkerStyle(_pinValues,item.src);
        }else{
          _getMarkerStyle(_pinValues);
        }
      });
    }else{
      _getMarkerStyle(_pinValues);
    }

    _getRightPanel();
  }

  function _closeRightPanel(){
      _containerPosition.empty();
      $("#custom-panel").css({'display':'none'});
  }

  function _setCreationByCoordinates(){
    _configurationPosition.append(
      '<li>' +
        '<img src="apps/dynMapPublic/picture/pen.svg" id="openCreationByCoordinates" class="openCreationByCoordinates" ' +
      '</li>'
    );

    $(".openCreationByCoordinates").css({'width':'35px','height':'35px','padding':'3px','background':'#ffffff','margin-top':'7px','margin-right':'25px'});

    _getCreationByCoordinates();

    var createByCoordinates = document.getElementById("openCreationByCoordinates");
    createByCoordinates.addEventListener('click', _openCreationByCoordinates);
  }

  function _setConfiguration(){
    _configurationPosition.append(
      '<li>' +
        '<img src="apps/dynMapPublic/picture/roue-crantée.svg" id="openConfigPopUp" class="openConfigPopUp" ' +
      '</li>'
    );
    _createConfiguration();

    $(".openConfigPopUp").css({'width':'35px','height':'35px','padding':'3px','background':'#ffffff','margin-top':'7px','margin-right':'25px'});

    var config = document.getElementById("openConfigPopUp");
    config.addEventListener('click', _openConfiguration);
  }

  function _createConfiguration(){
    $('#map').append(
      '<div class="login-popup">' +
        '<div class="form-popup" id="popupForm">' +
            '<div id="closeCrossConfig">X</div>' +
            '<h2>Configuration</h2>' +
            '<div id="mapTitlePart">' +
              '<label for="mapTitle">' +
                'Titre de la carte:' +
              '</label>' +
              '<input type="text" value="Carte dynamique pour le grand public" name="mapTitle" id="mapTitle">' +
            '</div>' +
            '<div id="categoryPart">' +
            '</div>' +
            '<div id="buttons">' +
              '<button id="deleteAll" class="btn">Supprimer tout les points</button>' +
              '<button id="exportGeoJSON" class="btn cancel">Export GeoJSON</button>' +
            '</div>' +
        '</div>' +
      '</div>'
    );

    $(".login-popup").css({'position':'relative','text-align':'center','width':'100%'});
    $(".form-popup").css({'display':'none','position':'fixed','left':'45%','top':'12%','transform':'translate(-45%,5%)','border':'2px solid #666','z-index':'9','max-width':'800px','padding':'20px','background-color':'#fff'});
    $(".form-popup #mapTitlePart input, #categoryPart input, #categoryPart select").css({'width':'100%','padding':'10px','margin':'5px 5px 5px 5px','border':'none','background':'#eee'});
    $(".form-popup input:focus").css({'background-color':'#ddd','outline':'none'});
    $(".form-popup #buttons .btn").css({'background-color':'#8ebf42','color':'#fff','padding':'12px 12px','border':'none','cursor':'pointer','width':'100%','margin':'3px 3px 3px','margin-bottom':'8px','opacity':'0.8'});
    $(".form-popup #buttons .cancel").css({'background-color':'#cc0000'});
    $("#popupForm #closeCrossConfig").css({'position':'fixed', 'right':'1em'});

    _getCategoryList();

    $('#mapTitle').on('input', function (e) {
      $('.mv-title')[0].text = $('#mapTitle').val();
    });

    var closeButton = document.getElementById("closeCrossConfig");
    closeButton.addEventListener('click', _closeConfig);

    var deleteAllPoints = document.getElementById("deleteAll");
    deleteAllPoints.addEventListener('click', _deleteAllMarkers);

    var exportGeoJSON = document.getElementById("exportGeoJSON");
    exportGeoJSON.addEventListener('click', _exportGeoJSON);
  }

  function _exportGeoJSON(){
    var customLayersArray = [];
    _map.getLayers().forEach((item, i) => {
      if(item instanceof ol.layer.Vector){
        if(item.ol_uid >= 65){
          customLayersArray.push(item);
        }
      }
    });

    var buffer = [];

    customLayersArray.forEach((item, i) => {
      buffer.push(['name:' + item.getSource().getFeatures()[0].getProperties().pinName,
                  'categorie:' + item.getSource().getFeatures()[0].getProperties().categorie,
                  'coordinates:' + item.getSource().getFeatures()[0].getProperties().coordinates,
                  'description:' + item.getSource().getFeatures()[0].getProperties().description
                ]);
    });
    buffer.push(_categoryList);

    var file = JSON.stringify(buffer);
    download('points_intéret.geoJSON',file);
  }

  function download(file, text) {
    //creation d'un élément invisible
    var element = document.createElement('a');
    element.setAttribute('href',
    'data:text/plain;charset=utf-8, '
    + encodeURIComponent(text));
    element.setAttribute('download', file);
    // Le code ci dessus est équivalent à
    // <a href="chemin du fichier" download="nom du fichier">

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function _deleteAllMarkers(){
    _layerList.forEach((layer, i) => {
      _map.removeLayer(layer);
    });
    _closeRightPanel();
  }

  function _addCategorie(){
    _categoryList.push({
      name: $('#categoryName').val(),
      src: $('#markerPreview')[0].src,
      marker: $('#markerList').val(),
      color: $('#colorList').val()
    });
    _getCategoryList();
  }

  function _updateCategorie(i){
    _categoryList[i].name = $('#categoryName').val();
    _categoryList[i].src = $('#markerPreview')[0].src;
    _categoryList[i].marker = $('#markerList').val();
    _categoryList[i].color = $('#colorList').val();
    _getCategoryList();
  }

  function _getCategoryList(){
    $('#categoryPart').empty();
    _categoryList.forEach((item, i) => {
      $('#categoryPart').append(
        '<div>' +
          '<div class="spaceItems">' +
              '<span class="textModifications">' + item.name + '</span>' +
              '<img src="' + item.src + '" class="markerPreview" />' +
              '<span class="separator">|</span>' +
              '<img src="apps/dynMapPublic/picture/penGreen.svg" class="markerPreview" id="categorie' + i + '" />' +
              '<img src="apps/dynMapPublic/picture/trash.svg" class="markerPreview" id="trashCategory' + i + '" />' +
          '</div>' +
        '</div>'
      )
      var selectCategory = document.getElementById('categorie' + i );
      selectCategory.addEventListener('click', function (){
        _createCategory(i)
      });

      var trashCategory = document.getElementById('trashCategory' + i );
      trashCategory.addEventListener('click', function (){
        _deleteCategory(i)
      });
    });
    $('#categoryPart').append(
      '<span id="addCategory" class="addCategory">+</span>'
    );
    $(".textModifications").css({'margin-top':'15px'});
    $(".separator").css({'color':'#8ebf42','font-size':'2em'});
    $(".spaceItems").css({'display':'flex','justify-content':'space-evenly'});
    $(".markerPreview").css({'width':'30px','height':'45px','margin-bottom':'5px'});
    $(".addCategory").css({'display': 'block','text-align': 'center','color':'green','font-size':'2em','border-top':'1px solid #8ebf42'});

    var addCategory = document.getElementById("addCategory");
    addCategory.addEventListener('click', _createCategory);
  }

  function _deleteCategory(i){
    _categoryList.splice(i,1);
    _getCategoryList();
  }

  function _createCategory(i = null){
    $('#categoryPart').empty();
    $('#categoryPart').append(
      '<label for="libelle">' +
        'Categorie:' +
      '</label>' +
      '<input type="text" placeholder="Libelle" name="libelle" id="categoryName">' +
      '<select name="markerList" id="markerList">' +
        '<option>Goutte</option>' +
        '<option>Panneau</option>' +
        '<option>Etoile</option>' +
      '</select>' +
      '<select name="colorList" id="colorList">' +
        '<option class="colorRed">Rouge</option>' +
        '<option class="colorYellow">Jaune</option>' +
        '<option class="colorGreen">Vert</option>' +
        '<option class="colorBrown">Marron</option>' +
        '<option class="colorBlue">Bleu</option>' +
        '<option class="colorViolet">Violet</option>' +
      '</select>' +
      '<img src="" id="markerPreview" class="markerPreview" /><br>' +
      '<button id="saveCategorie" class="btn">Sauvegarder la catégorie</button><button id="cancelCategorie" class="btn cancel">Annuler</button>'
    );

    var markerSelected = 'Goutte';
    var colorSelected = 'Rouge';

    if(!isNaN(i)){
      $("#categoryName").val(_categoryList[i].name);
      $("#markerPreview").attr('src',_categoryList[i].src);
      $("#markerList").val(_categoryList[i].marker);
      $("#colorList").val(_categoryList[i].color);
      markerSelected = _categoryList[i].marker;
      colorSelected = _categoryList[i].color;
    }

    $("#categoryPart input, #categoryPart select").css({'width':'100%','padding':'10px','margin':'5px 5px 5px 5px','border':'none','background':'#eee'});
    $(".form-popup #categoryPart .btn").css({'background-color':'#8ebf42','color':'#fff','padding':'12px 12px','border':'none','cursor':'pointer','width':'45%','margin':'3px 3px 3px','margin-bottom':'8px','opacity':'0.8'});
    $(".colorRed").css({'background-color':'#ff0000'});
    $(".colorYellow").css({'background-color':'#ffff00'});
    $(".colorGreen").css({'background-color':'#008000'});
    $(".colorBrown").css({'background-color':'#654321'});
    $(".colorBlue").css({'background-color':'#0000ff'});
    $(".colorViolet").css({'background-color':'#480945'});
    $("#colorList option").css({'color':'#000000'});
    $(".markerPreview").css({'width':'50px','height':'75px','margin-bottom':'5px'});
    $("#categoryPart .cancel").css({'background-color':'#cc0000'});
    $("#categoryPart").css({'border':'1px solid #8ebf42','margin-bottom':'5px','padding-right':'8px','padding-left':'3px','border-radius':'3px','box-shadow': '1px 1px 5px #555'})

    _setMarkerPreview(markerSelected,colorSelected);

    $('#markerList').on('change', function (e) {
      var optionSelected = $("option:selected", this);
      markerSelected = this.value;
      _setMarkerPreview(markerSelected,colorSelected);
    });

    $('#colorList').on('change', function (e) {
      var optionSelected = $("option:selected", this);
      colorSelected = this.value;
      _setMarkerPreview(markerSelected,colorSelected);
    });

    if(!isNaN(i)){
      var addCategory = document.getElementById("saveCategorie");
      addCategory.addEventListener('click', function (){
        _updateCategorie(i)
      });
    }else{
      var addCategory = document.getElementById("saveCategorie");
      addCategory.addEventListener('click', _addCategorie);
    }

    var cancelCategory = document.getElementById("cancelCategorie");
    cancelCategory.addEventListener('click', function(){
      if(_categoryList.length === 0 ){
        $("#categoryPart").css({'border':'none','box-shadow': 'none'})
      }
      _getCategoryList();
    });
  }

  function _setMarkerPreview(markerSelected,colorSelected){
    switch (markerSelected) {
      case 'Goutte':
        switch (colorSelected) {
          case 'Rouge':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerRed.svg');
            return 'apps/dynMapPublic/picture/markerRed.svg';
          break;
          case 'Jaune':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerYellow.svg');
            return 'apps/dynMapPublic/picture/markerYellow.svg';
          break;
          case 'Vert':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerGreen.svg');
            return 'apps/dynMapPublic/picture/markerGreen.svg';
          break;
          case 'Marron':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerBrown.svg');
            return 'apps/dynMapPublic/picture/markerBrown.svg';
          break;
          case 'Bleu':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerBlue.svg');
            return 'apps/dynMapPublic/picture/markerBlue.svg';
          break;
          case 'Violet':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerViolet.svg');
            return 'apps/dynMapPublic/picture/markerViolet.svg';
          break;
          default:
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerRed.svg');
            return 'apps/dynMapPublic/picture/markerRed.svg';
        }
      break;
      case 'Panneau':
        switch (colorSelected) {
          case 'Rouge':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/panneauRed.svg');
            return 'apps/dynMapPublic/picture/panneauRed.svg';
          break;
          case 'Jaune':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/panneauYellow.svg');
            return 'apps/dynMapPublic/picture/panneauYellow.svg';
          break;
          case 'Vert':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/panneauGreen.svg');
            return 'apps/dynMapPublic/picture/panneauGreen.svg';
          break;
          case 'Marron':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/panneauBrown.svg');
            return 'apps/dynMapPublic/picture/panneauBrown.svg';
          break;
          case 'Bleu':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/panneauBlue.svg');
            return 'apps/dynMapPublic/picture/panneauBlue.svg';
          break;
          case 'Violet':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/panneauViolet.svg');
            return 'apps/dynMapPublic/picture/panneauViolet.svg';
          break;
          default:
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/panneauRed.svg');
            return 'apps/dynMapPublic/picture/panneauRed.svg';
        }
      break;
      case 'Etoile':
        switch (colorSelected) {
          case 'Rouge':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/starRed.svg');
            return 'apps/dynMapPublic/picture/starRed.svg';
          break;
          case 'Jaune':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/starYellow.svg');
            return 'apps/dynMapPublic/picture/starYellow.svg';
          break;
          case 'Vert':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/starGreen.svg');
            return 'apps/dynMapPublic/picture/starGreen.svg';
          break;
          case 'Marron':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/starBrown.svg');
            return 'apps/dynMapPublic/picture/starBrown.svg';
          break;
          case 'Bleu':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/starBlue.svg');
            return 'apps/dynMapPublic/picture/starBlue.svg';
          break;
          case 'Violet':
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/starViolet.svg');
            return 'apps/dynMapPublic/picture/starViolet.svg';
          break;
          default:
            $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/starRed.svg');
            return 'apps/dynMapPublic/picture/starRed.svg';
        }
      break;
      default:
        $('#markerPreview').attr('src', 'apps/dynMapPublic/picture/markerRed.svg');
        return 'apps/dynMapPublic/picture/markerRed.svg';
    }
  }

  function _openConfiguration() {
    _closeRightPanel();
    _closeCreationByCoordinates();
    $("#popupForm").css({'display':'block'});
  }

  function _closeConfig() {
    $("#popupForm").css({'display':'none'});
  }

  function _openCreationByCoordinates() {
    _closeRightPanel();
    _closeConfig();
    $("#creationByCoordinatesPopup").css({'display':'block'});
  }

  function _closeCreationByCoordinates() {
    $("#creationByCoordinatesPopup").css({'display':'none'});
  }

  function _getCreationByCoordinates(){
    $('#map').append(
      '<div class="creationPopup">' +
        '<div class="form-popup" id="creationByCoordinatesPopup">' +
            '<div id="closeCrossCoosCreation">X</div>' +
            '<h2>Création par coordonnées</h2>' +
            '<div id="coordinatesSelector">' +
            '<input type="text" placeholder="Longitude" id="creationLongitude"> : <input type="text" placeholder="Latitude" id="creationLatitude">' +
            '</div>' +
            '<div id="buttons">' +
              '<button id="createMarker" class="btn">Créer</button>' +
            '</div>' +
        '</div>' +
      '</div>'
    );

    $(".creationPopup").css({'position':'relative','text-align':'center','width':'100%'});
    $(".form-popup").css({'display':'none','position':'fixed','left':'45%','top':'12%','transform':'translate(-45%,5%)','border':'2px solid #666','z-index':'9','max-width':'800px','padding':'20px','background-color':'#fff'});
    $(".form-popup #coordinatesSelector input").css({'width':'45%','padding':'10px','margin':'5px 5px 5px 5px','border':'none','background':'#eee'});
    $(".form-popup input:focus").css({'background-color':'#ddd','outline':'none'});
    $(".form-popup #buttons .btn").css({'background-color':'#8ebf42','color':'#fff','padding':'12px 12px','border':'none','cursor':'pointer','width':'100%','margin':'3px 3px 3px','margin-bottom':'8px','opacity':'0.8'});
    $("#creationByCoordinatesPopup #closeCrossCoosCreation").css({'position':'fixed', 'right':'1em'});

    var closeButton = document.getElementById("closeCrossCoosCreation");
    closeButton.addEventListener('click', _closeCreationByCoordinates);

    var createMarker = document.getElementById("createMarker");
    createMarker.addEventListener('click', function (){
      _createMarker($("#creationLongitude").val(),$("#creationLatitude").val())
    });
  }

  function _createMarker(lon,lat){
    var iconFeature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.transform([lon,lat], 'EPSG:4326', 'EPSG:3857')),
      pinName: 'New Marker',
      categorie: 'New Category',
      description: 'Dummy',
      coordinates: [parseFloat(lon),parseFloat(lat)]
    });

    iconFeature = _getMarkerStyle(iconFeature);

    var vectorSource = new ol.source.Vector({
      features: [iconFeature]
    });
    this.dynamicPinLayer = new ol.layer.Vector({
      source: vectorSource
    });

    var clickInteraction = new ol.interaction.Select({
      condition: ol.events.condition.click,
      layer: [this.dynamicPinLayer]
    });

    _map.addInteraction(clickInteraction);

    clickInteraction.on('select', (e) => {
      if(e.selected[0] != undefined){
        _map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel_,function(feature,layer){
          _layerFeature = layer;
        })
        _pinValues = e.selected[0];
        _categoryList.forEach((item, i) => {
          if(item.name === _pinValues.getProperties().categorie){
            _getMarkerStyle(_pinValues,item.src);
          }else{
            _getMarkerStyle(_pinValues);
          }
        });
        _pixelPosition = e.mapBrowserEvent.pixel_;
        _getRightPanel();
      }
    });

    var modify = new ol.interaction.Modify({
      features: new ol.Collection([iconFeature]),
      pixelTolerance: 20
    });
    iconFeature.on('change',function(){
      var pinValues = _pinValues;
      pinValues.values_.coordinates = ol.proj.transform(this.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
      _pinValues.setProperties(pinValues,false);
      $("#pinLongitude")[0].value = _pinValues.getProperties().coordinates[0];
      $("#pinLatitude")[0].value = _pinValues.getProperties().coordinates[1];
    },iconFeature);
    _map.addInteraction(modify);

    _map.addLayer(this.dynamicPinLayer);
    _pinValues = this.dynamicPinLayer.getSource().getFeatures()[0];
    _layerFeature = this.dynamicPinLayer;
    _layerList.push(this.dynamicPinLayer);

    _getRightPanel();
    _closeCreationByCoordinates();
  }

  function _getMarkerStyle(feature, featureSource = 'apps/dynMapPublic/picture/markerRed.svg'){
    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(({
        anchor: [0.38, 40],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        size: [48, 48],
        opacity: 1,
        src: featureSource
      }))
    });
    feature.setStyle(iconStyle);
    feature.changed();
    return feature;
  }

  function _onSimpleClick(){
    _closeRightPanel();
    _closeConfig();
    _closeCreationByCoordinates();
    var extent = _map.getView().calculateExtent(_map.getSize());
    var layers = _map.getLayers();
    layers.forEach((layer, i) => {
      if(layer instanceof ol.layer.Vector){
        if(layer.ol_uid >= 65){
          if(_categoryList.length === 0){
            _getMarkerStyle(layer.getSource().getFeatures()[0]);
          }else{
            _categoryList.forEach((item, i) => {
              if(item.name === layer.getSource().getFeatures()[0].getProperties().categorie){
                _getMarkerStyle(layer.getSource().getFeatures()[0],item.src);
              }else{
                _getMarkerStyle(layer.getSource().getFeatures()[0]);
              }
            });
          }
        }
      }
    });
  }

  return {
      init : function () {
        _containerPosition = $('#map').parent('.row');
        _containerPosition.append('<div id="custom-panel">');
        $("#custom-panel").css({"height": "100%","width": "400px","position": "fixed","z-index": "1","top": "0","right": "0","background-color": "#FFF","overflow-x": "hidden","padding-top": "20px"});
        _containerPosition = $('#custom-panel');
        $("#custom-panel").css({'display':'none'});
        _configurationPosition = $("#bs-example-navbar-collapse-1 .navbar-right");
        _setCreationByCoordinates();
        _setConfiguration();
        _map.on('dblclick', _clic);
        _map.on('click',function(){
          _onSimpleClick();
        });
      }
  };

})();

new CustomComponent("gestion6596", clic.init);

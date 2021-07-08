const clic = (function() {

  var _btn;
  var _map = mviewer.getMap();
  var _pinValues;
  var _containerPosition;
  var _layerFeature;
  var _pixelPosition;

  var _clic = function (evt) {
    _pixelPosition = evt.pixel;
    addPinOnMap(evt);
  };

  var addPinOnMap = function (evt) {
    _currentCoordinates = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');

      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(evt.coordinate),
        pinUniqueID: "",
        pinName: 'New Marker',
        categorie: 'New Category',
        description: 'Dummy',
        coordinates: _currentCoordinates
      });

      var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(({
          anchor: [0.32, 48],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          size: [48, 48],
          opacity: 1,
          src: 'https://openlayers.org/en/latest/examples/data/icon.png'
        }))
      });

      iconFeature.setStyle(iconStyle);
      iconFeature.values_.pinUniqueID = iconFeature.ol_uid;

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
          _pinValues = e.selected[0].values_;
          _layerFeature = e;
          _pixelPosition = e.mapBrowserEvent.pixel_;
          _getRightPanel();
        }
      });

      _map.addLayer(this.dynamicPinLayer);
      _pinValues = this.dynamicPinLayer.values_.source.uidIndex_[this.dynamicPinLayer.values_.source.ol_uid-1].values_
      _layerFeature = this.dynamicPinLayer;

      _getRightPanel();
  }

  function _getRightPanel(){
    _containerPosition.empty();
    _containerPosition.append(
      '<div id="closeCross">X</div>' +
      '<h2>' + _pinValues.pinName +
      '<svg id="editionCustomPanel" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0, 0, 400,400"><g id="svgg"><path id="path0" d="M300.391 12.504 C 294.523 13.318,286.530 16.197,280.671 19.607 C 275.834 22.423,58.825 238.125,56.590 242.339 C 55.976 243.497,45.617 274.174,33.569 310.512 C 9.961 381.714,10.652 379.096,14.270 383.630 C 19.144 389.736,17.536 390.112,91.406 365.542 L 157.422 343.584 268.037 232.925 C 390.724 110.189,382.290 119.338,385.959 104.993 C 391.948 81.576,386.806 69.609,358.607 41.351 C 331.904 14.591,321.721 9.545,300.391 12.504 M320.703 36.571 C 327.595 39.812,359.282 70.878,362.689 77.734 C 369.653 91.750,366.747 104.087,353.351 117.377 L 346.466 124.207 310.928 88.621 L 275.391 53.036 282.634 46.057 C 295.964 33.212,307.464 30.346,320.703 36.571 M295.901 104.104 L 331.248 139.458 241.797 228.906 L 152.346 318.355 116.797 282.812 L 81.248 247.270 170.506 158.010 C 219.597 108.917,259.941 68.750,260.158 68.750 C 260.376 68.750,276.460 84.659,295.901 104.104 M86.136 344.619 C 60.890 353.047,40.153 359.880,40.054 359.804 C 39.955 359.728,46.766 338.991,55.191 313.723 L 70.507 267.780 101.272 298.538 L 132.037 329.295 86.136 344.619 " stroke="none" ' +
      'fill="#4D4D4D" fill-rule="evenodd"></path></g></svg>' +
      ' </h2>' +
      '<p>' + _pinValues.categorie + '</p>' +
      '<p>' + _pinValues.description + '</p>' +
    '</div>');

    $("#custom-panel").css({'display':'block'});
    $("#custom-panel #closeCross").css({'position':'fixed', 'right':'1em', 'padding-top':'40px'});
    // $(".custom-panel").css({"height": "100%","width": "360px","position": "fixed","z-index": "1","top": "0","right": "0","background-color": "#FFF","overflow-x": "hidden","padding-top": "20px"});
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
    _containerPosition.append(
      '<div id="closeCross">X</div>' +
      '<div id="editionContent">' +
        '<div><label for="name">Nom:</label><input type="text" id="pinName" name="name" value="' + _pinValues.pinName + '"></div>' +
        '<div><label for="category">Categorie:</label><input type="text" id="pinCategorie" name="category" value="' + _pinValues.categorie + '"></div>' +
        '<div><label for="description">Description:</label><input type="text" id="pinDescription" name="description" value="' + _pinValues.description + '"></div>' +
        '<div id="coordinatesContainer"><input type="text" id="pinLongitude" name="longitude" value="' + _pinValues.coordinates[0] + '"> : <input type="text" id="pinLatitude" name="latitude" value="' + _pinValues.coordinates[1] + '"></div>' +
        '<div id="validationContent">' +
          '<button id="pinDeletionButton" type="button">Supprimer</button><button id="pinSaveButton" type="button">Enregistrer</button>' +
        '</div>' +
      '</div>'
    );
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
    console.log(_layerFeature);
    console.log
    // _layerFeature.removeFeatures(_layerFeature.getFeatureBy('pinUniqueID', _layerFeature.pinUniqueID));
    // console.log(ol.Overlay.prototype.getMap());
    // var feature = _map.getFeaturesAtPixel(_pixelPosition);
    // let feature = _layerFeature.getSource().getFeatureById('featureID');
    // console.log(feature[0]);
    // map = ol.Overlay.prototype.getMap();
    // _layerFeature.removeFeature(feature[0]);
    _map.render();
    _closeRightPanel();
  }

  function _savePin(){
    _pinValues.pinName = $("#pinName")[0].value;
    _pinValues.categorie = $("#pinCategorie")[0].value;
    _pinValues.description = $("#pinDescription")[0].value;
    _pinValues.coordinates[0] = $("#pinLongitude")[0].value;
    _pinValues.coordinates[1] = $("#pinLatitude")[0].value;

    _map.render();
    _getRightPanel();
  }

  function _closeRightPanel(){
      _containerPosition.empty();
      $("#custom-panel").css({'display':'none'});
      _map.render();
  }

  return {
      init : function () {
        _containerPosition = $('#map').parent('.row');
        _containerPosition.append('<div id="custom-panel">');
        $("#custom-panel").css({"height": "100%","width": "400px","position": "fixed","z-index": "1","top": "0","right": "0","background-color": "#FFF","overflow-x": "hidden","padding-top": "20px"});
        document.querySelector('style').textContent +=
        "'@media screen and (max-height: 450px) {.custom-panel {padding-top: 15px;}; .custom-panel p {font-size: 18px;}}";
        _containerPosition = $('#custom-panel');
        $("#custom-panel").css({'display':'none'});
        _map.on('dblclick', _clic);
        // _map.on('click', _simpleClic);
      }
  };

})();

new CustomComponent("gestion6596", clic.init);

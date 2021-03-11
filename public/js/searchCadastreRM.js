var searchCadastreRM = (function () {

    var baseUrl_cadastre;

    var selectCityInput = '<div id="communeSearchContainer"><select id="communeSearch" name="communeSearch" class="form-control">'
							+	'</select></div>';

    var sectionTag = '<div class="sectionInputContainer">'
                    + '<select id="section" class="sectionsList form-control"></select>'
                + '</div>';
    
    var parcelTag = '<div class="parcelleInputContainer">'
        		    +    '<select id="parcelle" class="parcellesList form-control" disabled></select>'
                +	'</div>';
    
    var selectedParcelLayer;

    
    var getCenterGeometry = function (geomCoords) {
        var nbCoords = geomCoords.length;
        var sumX = 0;
        var sumY = 0;
        geomCoords.forEach(function (coord) {
            sumX += parseFloat(coord[0]);
            sumY += parseFloat(coord[1]);
        });
        var x = sumX / nbCoords;
        var y = sumY / nbCoords;
        return [x, y];
    };

    var init = function () {

        baseUrl_cadastre = 'https://api-cadastre.sig.rennesmetropole.fr/v1/';

          /*var searchCadastreElement = '<ul class="nav navbar-nav navbar-right"><li class="parcelSelector"><div class="parcelSelectorsContainer">'
            + '<div><p class="labelRechercheParcelle">Recherche de parcelle</p></div><div class="parcelSelectors">' 
            + selectCityInput + sectionTag + parcelTag +'</div></li></ul>';
          $('#bs-example-navbar-collapse-1').append(searchCadastreElement);*/

          $('#page-content-wrapper').append('<div class="parcelSelectors">' + selectCityInput + sectionTag + parcelTag + '</div>');

        $.getJSON(baseUrl_cadastre + 'communes', function(dataApiJson) {
            //var htmlContent = '<option value="-1" disabled selected> rechercher la commune de la parcelle</option>';
            var htmlContent = '';
            dataApiJson.forEach(function (data) {
                htmlContent += '<option value="'+ data.idComm +'">'+ data.name +'</option>'
            });
            $('#communeSearch').html(htmlContent);
            $('#communeSearch').select2({
              placeholder: "commune",
              allowClear: true,
              dropdownAutoWidth: true,
              width: '210px',
            });
            $('#section').select2({
              placeholder: "section",
              allowClear: true,
              dropdownAutoWidth: true,
              width: '75px',
            });
            $('#parcelle').select2({
              placeholder: "parcelle",
              allowClear: true,
              dropdownAutoWidth: true,
              width: '75px',
            });
            $(".sectionsList").prop("disabled", true);
            $(".parcellesList").prop("disabled", true);
            $('#communeSearch').val('0').trigger('change');
        });

        $(document).on('change','#communeSearch', function (e) {
          var codeCom = '';
            if (typeof e.currentTarget.selectedOptions[0] !== 'undefined') {
              codeCom = e.currentTarget.selectedOptions[0].value;
            }
            $('.sectionsList').empty();
            $('.parcellesList').empty();
            $('.sectionsList').append('<option></option>');
            $('.parcellesList').append('<option></option>');
            // Liste sections
            if (typeof codeCom !== 'undefined' && codeCom !== null && codeCom.trim() !== '') {
                $.getJSON(baseUrl_cadastre + 'communes/'+ codeCom +'/sections', function(dataApiJson) {
                  //var htmlContent = '<option value="-1" disabled selected> code section</option>';
                  var htmlContent = '';
                  dataApiJson.forEach(function (data) {
                      htmlContent += '<option value="'+ data.idSect +'">'+ data.codSect +'</option>'
                  });
                  $('#section').html(htmlContent);
                  $('#section').select2({
                    placeholder: "section",
                    allowClear: true,
                    dropdownAutoWidth: true,
                    width: '75px',
                  });
                  $(".sectionsList").prop("disabled", false);
                  $(".parcellesList").prop("disabled", true);
                  $(".sectionsList").val("-1").trigger('change');
              });
            }
        });

        $(document).on('change','#section', function (e) {
          var codeSection = '';
            if (typeof e.currentTarget.selectedOptions[0] !== 'undefined') {
              codeSection = e.currentTarget.selectedOptions[0].value;
            }
            $('.parcellesList').val('').trigger('change');
            if (typeof codeSection !== 'undefined' && codeSection !== null && codeSection.trim() !== '') {
              $.getJSON(baseUrl_cadastre + 'sections/'+ codeSection +'/parcelles', function(dataApiJson) {
                  //var htmlContent = '<option value="-1" disabled selected> code parcelle</option>';
                  var htmlContent = '';
                  dataApiJson.forEach(function (data) {
                      htmlContent += '<option value="'+ data.idParc +'">'+ data.numero +'</option>'
                  });
                  $('#parcelle').html(htmlContent);
                  $('#parcelle').select2({
                    placeholder: "parcelle",
                    allowClear: true,
                    dropdownAutoWidth: true,
                    width: '75px',
                  });
                  $(".parcellesList").prop("disabled", false);
                  $(".parcellesList").val("-1").trigger('change');
              });
            }
        });

        $(document).on('change','#parcelle', function (e) {
          var codeParcelle = '';
            if (typeof e.currentTarget.selectedOptions[0] !== 'undefined') {
              codeParcelle = e.currentTarget.selectedOptions[0].value;
            }
              var styles = [
                new ol.style.Style({
                  stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 3
                  }),
                  fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.1)'
                  })
                })
              ];
             
              if (typeof codeParcelle !== 'undefined' && codeParcelle !== null && codeParcelle.trim() !== '') {
                $.getJSON(baseUrl_cadastre + 'epsg:3948/parcelles/' + codeParcelle, function(dataApiJson) {
                  var geomNewProj = [];
                  dataApiJson.coordonnees.geometry.coordinates[0][0].forEach(function (coordinates) {
                      geomNewProj.push( proj4('EPSG:3948', rmTools.getProjection(), coordinates) );
                  });
                  var geojsonObject = {
                    'type': 'FeatureCollection',
                    'crs': {
                      'type': 'name',
                      'properties': {
                        'name': 'EPSG:3857'
                      }
                    },
                    'features': [{
                      'type': 'Feature',
                      'geometry': {
                        'type': 'Polygon',
                        'coordinates': [geomNewProj]
                      }
                    } ]
                  };
                  var source = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
                  });
                  var layerCadatsreFound = false; 
                  mviewer.getMap().getLayers().array_.forEach(function (lay) {
                    if (lay.className_ === 'cadastreLayer' ) {
                      layerCadatsreFound = true;
                      lay.setSource(source);
                      layerExtent = lay.getExtent();
                      selectedParcelLayer = lay;
                    }
                  });
                  if (!layerCadatsreFound) {
                    var layer = new ol.layer.Vector({
                      source: source,
                      className: 'cadastreLayer',
                      style: styles,
                      zIndex: 0
                    });
                    mviewer.getMap().addLayer(layer);
                    selectedParcelLayer = layer;
                  }
                  var geometryCenter = getCenterGeometry(geomNewProj);
                  mviewer.getMap().getView().setCenter(geometryCenter);
                  mviewer.getMap().getView().setZoom(17);
    
                  var e = {
                    coordinate:geometryCenter,
                    pixel: mviewer.getMap().getPixelFromCoordinate(mviewer.getMap().getView().getCenter())
                  };
                  info.queryMap(e);
  
                });
              }
        });

        /*$(document).on('click','#cleanParcel', function (e) {
          if (typeof selectedParcelLayer !== 'undefined') {
            mviewer.getMap().removeLayer(selectedParcelLayer);
            $('#parcelle').val(-1);
          }
        });*/

    }

    return {
        init: init
    };

})();


setTimeout(function () {
  if (configuration.getConfiguration().searchparameters.searchCadastre === 'true' && API.mode !== 'u' && API.mode !== 's') {
    searchCadastreRM.init();
  }
}, 2000);
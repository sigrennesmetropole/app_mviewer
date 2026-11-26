
mviewer.customLayers.vergers = (function () {
  var data =
    "https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:ev_verger_partage&outputFormat=application/json&srsName=EPSG:4326";

  let format = new ol.format.GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: _map.getView().getProjection()
  });

  // Source ponctuelle
  let pointSource = new ol.source.Vector();

  // Source surfacique
  let surfaceSource = new ol.source.Vector({
    url: data,
    format: format
  });

  // Style ponctuel
  function pointStyle() {
    return new ol.style.Style({
      image: new ol.style.Icon({
        color: "#ba8e02",
        crossOrigin: "anonymous",
        scale: 1,
        anchor: [0.5, 1],
        src: "apps/site_internet/customlayer/picture/marker.svg"
      })
    });
  }

  // Style surfacique
  function surfaceStyle() {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(186, 142, 2, 0.4)"
      }),
      stroke: new ol.style.Stroke({
        color: "#ba8e02",
        width: 2
      })
    });
  }

  // Définition de la couche
  let customLayer = new ol.layer.Vector({
    source: surfaceSource,
    style: surfaceStyle
  });

  // Conversion des polygones en points après chargement WFS
  surfaceSource.once("featuresloadend", function () {

    let features = surfaceSource.getFeatures();

    features.forEach(function (feature) {

      let geometry = feature.getGeometry();

      if (!geometry) return;

      let pointGeom = new ol.geom.Point(
        ol.extent.getCenter(geometry.getExtent())
      );

      let newFeature = new ol.Feature();
      newFeature.setProperties(feature.getProperties());
      newFeature.setGeometry(pointGeom);

      pointSource.addFeature(newFeature);
    });

    _updateStyle();
  });

  // Gestion du zoom
  function _updateStyle() {

    if (_map.getView().getZoom() < 16) {
      customLayer.setSource(pointSource);
      customLayer.setStyle(pointStyle);
    } else {
      customLayer.setSource(surfaceSource);
      customLayer.setStyle(surfaceStyle);
    }
  }

  _map.getView().on("change:resolution", _updateStyle);

  return {
    layer: customLayer
  };

})();

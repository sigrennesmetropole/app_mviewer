
mviewer.customLayers.arbresornement = (function () {

  let data_url =
    "https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeNames=espub_esv:arbre&outputFormat=application/json&srsName=EPSG:4326";

  let filter =
    "<PropertyIsEqualTo>" +
      "<PropertyName>fonction</PropertyName>" +
      "<Literal>Ornement</Literal>" +
    "</PropertyIsEqualTo>";

  let complete_url = data_url + "&filter=" + encodeURIComponent(filter);

  let datacolor = "#bfbf30";

  // Style des arbres sur la carte
  function markerStyle() {
    return [
      new ol.style.Style({
        image: new ol.style.Icon({
          color: datacolor,
          crossOrigin: "anonymous",
          src: "apps/site_internet/customlayer/picture/rond_default.svg",
        }),
      }),
    ];
  }

  // Légende : pastille verte + texte
  let legend = {
    items: [
      {
        label: "(Zoomer pour voir apparaître)",
        geometry: "Point",
        styles: [
          new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({
                color: datacolor
              }),
              stroke: new ol.style.Stroke({
                color: "#555555",
                width: 1
              })
            })
          })
        ]
      }
    ]
  };

  let dataLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: complete_url,
      format: new ol.format.GeoJSON(),
    }),
    style: null,
  });

  _map.getView().on("change", function () {
    if (_map.getView().getZoom() >= 16) {
      dataLayer.setStyle(markerStyle);
    } else {
      dataLayer.setStyle(null);
    }
  });

  return {
    layer: dataLayer,
    legend: legend
  };

})();

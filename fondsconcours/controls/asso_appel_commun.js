const layerid = "asso_appel_commun";
const cc = (function () {
  /*
   * Private
   */

  var _layer;
  
  var data = 'https://public.sig.rennesmetropole.fr/geoserver/wfs?service=WFS&version=2.0.0&request=GetPropertyValue&outputFormat=application/json&typeNames=eq_autres:asso_appel_commun&valueReference=edition';
  var l_editions = [];
  

  function getFeaturesData(){
      return new Promise ((successCallback, failureCallback) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', data);
        xhr.onload = function() {
          if (xhr.status === 200 && xhr.responseText) {
            const parser = new DOMParser();
            var response = xhr.responseText.length ? parser.parseFromString(xhr.responseText, "application/xml") : null;
            const values = response.querySelectorAll("edition");
            
            for (var i = 0; i < values.length; i++) {
              let valeur = values[i].textContent;
              if (!l_editions.includes(values[i].textContent)){
                l_editions.push(values[i].textContent);
                l_editions.sort();
                console.log(l_editions);
              }
            }
            successCallback('request OK');
          } else {
            failureCallback('fail request');
          }
        };
        xhr.send();
    });
  }





  return {
    /*
     * Public
     */

    init: function () {
      // mandatory - code executed when layer is added to legend panel
      //mviewer.getLayer("geofla_commune_2015").layer.setVisible(true);
      console.log('INIT CUSTOMCONTROL');
      getFeaturesData().then(function () {
          var default_value = l_editions[l_editions.length -1 ];
          //mviewer.getLayer(layerid).attributevalues=["1981","2023","2025"];
          mviewer.getLayer(layerid).attributevalues=l_editions;
          var customselector = document.getElementById("asso_appel_commun-attributes-selector");
          customselector.options.length = 0;
          mviewer.getLayer(layerid).attributevalues.forEach(function (attribute) {
            const opt = document.createElement("option");
            opt.value = attribute;
            opt.text = attribute;
            customselector.add(opt);
            });
          customselector.value = default_value;
          customselector.dispatchEvent(new Event('change'));
      });
    },

    destroy: function () {
      // mandatory - code executed when layer panel is closed
      //mviewer.getLayer("geofla_commune_2015").layer.setVisible(false);
      console.log('KO');
    },
  };
})();
new CustomControl(layerid, cc.init, cc.destroy);


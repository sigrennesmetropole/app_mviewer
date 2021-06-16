const aerial = new ol.layer.Heatmap({
    source: new ol.source.Vector({
        url: 'https://data.anfr.fr/api/records/2.0/search/resource_id=1a279a02-cabf-466e-b2a7-9b52af187f59&filters=%7B%22code_insee%22%3A%2235238%22%7D&fields=%22id%22%2C%22adm_lb_nom%22%2C%22emr_lb_systeme%22%2C%22emr_dt%22%2C%22generation%22%2C%22date_maj%22%2C%22adr_lb_add1%22%2C%22coordonnees%22%2C%22statut%22',
        maxZoom: 20,
        format: new ol.format.GeoJSON()
    })
});
// Classe qui étend la classe 'CustomLayer' et décrit le custom Layer
class DataElectromagnetique extends CustomLayer {

    // Initialiser le custom layer
    constructor(id, layer, legend, handle = false) {

        // Initialiser les attributs de la classe parent
        super(id, layer, legend, handle);

    }

    // rennesANFRData(){
    //   console.log(this.layer);
    // }

}
// Créer le Custom Layer
new DataElectromagnetique("DataElectromagnetique",aerial);

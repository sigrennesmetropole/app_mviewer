var categories = (function() {
 // Toutes les interactions de gestion de categories
 // TODO : fonction addCateg = new Categorie + ajout dans la liste des styles portés par la couche meslocalisations (mviewer.customLayers.meslocalisations.addStyle)
 // TODO : delete categorie = suppression de tous les points de cette categorie ou on laisse les poitns = style par défaut ==> demander à l'utilisateur
 // TODO : update du nom d'une catégorie = 
 //   modification de la valeur categorie des points concernés 
 //   + suppression de l'ancienne categ de la liste de styles de la couche mviewer.customLayers.meslocalisations 
 //   + ajout de la nouvelle catégorie dans la liste de styles de la couche mviewer.customLayers.meslocalisations
 // TODO : update du style d'une catégorie = on ecrase l'ancien style de cette categorie dans la liste de styles de la couche mviewer.customLayers.meslocalisations
 
 // Toutes les interactions de gestion de point
 // TODO : ajout de point = addFeature sur la source de la couche meslocalisations avec categorie = nom de la categorie
 // TODO : changement de categorie du point = update de l'attribut categorie du point
  
  return {
      init : ()  => {
          mviewer.getMap().once('postrender', m => {
              //console.log("Initialisation customComponent Categories");
              // code d'initialisation
          });
      }
   };

})();

new CustomComponent("categories", categories.init());

{
// Définition des variables relatives à la couche.
const GEOSERVER_URL = "https://public.sig.rennesmetropole.fr/geoserver";
const WORKSPACE = "eq_educ";
const LAYER = "v_distribution_aide_alimentaire";


const LAYER_URL =
  `${GEOSERVER_URL}/${WORKSPACE}/ows?service=WFS&version=1.0.0&request=GetFeature&typeNames=${WORKSPACE}:${LAYER}&outputFormat=application/json&srsName=EPSG:4326`;

const LAYER_ID = "v_distribution_aide_alimentaire";

/**
 * Fonction utilitaire pour générer proprement une icône SVG compatible OpenLayers.
 * Elle force la création d'un élément Image HTML pour contourner le problème 
 * de redimensionnement et de CORS des SVG distants.
 */
function createSvgIcon(url, size) {
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Règle les blocages de sécurité CORS
  img.src = url;
  
  return new ol.style.Style({
    image: new ol.style.Icon({
      img: img,
      imgSize: [size, size], // Taille réelle du canvas SVG
      size: [size, size]     // Taille d'affichage souhaitée
    })
  });
}

// 1. Définition des styles pour chaque type de distribution
const stylesMap = {

  epicerie: [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 12.5,
        fill: new ol.style.Fill({ color: '#ff0000' })
      })
    }),
    new ol.style.Style({
      image: new ol.style.Icon({
        src: 'apps/site_internet/img/icons/commerce.svg',
        scale: 0.2,
        anchor: [0.5, 0.5],
        declutter: false
      })
    })
  ],

  colis: [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 12.5,
        fill: new ol.style.Fill({ color: '#0080a3' })
      })
    }),
    new ol.style.Style({
      image: new ol.style.Icon({
        src: 'apps/site_internet/img/icons/marche.svg',
        scale: 0.2,
		color: '#ffffff',
        anchor: [0.5, 0.5],
        declutter: false
      })
    })
  ],

  repas: [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 12.5,
        fill: new ol.style.Fill({ color: '#ffbf00' })
      })
    }),
    new ol.style.Style({
      image: new ol.style.Icon({
        src: 'apps/site_internet/img/icons/repas.svg',
        scale: 0.2,
        anchor: [0.3, 0.4],
        declutter: false
      })
    })
  ]

};
// 2. Fonction de style dynamique (Interprète les filtres <ogc:Filter> du SLD)
const featureStyleFunction = function (feature) {
  const props = feature.getProperties();

  // Test des propriétés (gère le type Boolean et le type String "true")
  if (props.epicerie_solidaire === 'true' || props.epicerie_solidaire === true) {
    return stylesMap.epicerie;
  }
  if (props.colis_paniers === 'true' || props.colis_paniers === true) {
    return stylesMap.colis;
  }
  if (props.repas === 'true' || props.repas === true) {
    return stylesMap.repas;
  }

  // Style de secours (vide) si aucun attribut ne correspond
  return null;
};

// Configuration de la légende adaptée aux 3 catégories pour l'affichage de l'IHM
const legend = {
  items: [
    {
      label: "Épicerie solidaire",
      geometry: "Point",
      styles: stylesMap.epicerie,
    },
    {
      label: "Distribution de colis et paniers",
      geometry: "Point",
      styles: stylesMap.colis,
    },
    {
      label: "Repas",
      geometry: "Point",
      styles: stylesMap.repas,
    },
  ],
};

// Source WFS
const source = new ol.source.Vector({
  url: LAYER_URL,
  format: new ol.format.GeoJSON(),
});

// DEBUG IMPORTANT
source.on("featuresloadend", function () {
  console.log("Features chargées :", source.getFeatures().length);
  if (source.getFeatures().length > 0) {
    // Affiche la structure des propriétés du premier point dans la console pour vérification
    console.log("Exemple de propriétés reçues :", source.getFeatures()[0].getProperties());
  }
});

// Création de la couche vecteur avec la fonction de style dynamique
const layer = new ol.layer.Vector({
  source: source,
  style: featureStyleFunction,
});

handle = false;
new CustomLayer(LAYER_ID, layer, legend);
}
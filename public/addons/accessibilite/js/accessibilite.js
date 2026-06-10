// Outil facilitant l'accessibilité aux données d'une carte
// Présentation des données sous une forme de tableau
// chaque couche est présentée par un onglet
// pas de relation dynamique entre tableau et carte
// URL d'accès au tableau (mode=data)
document.addEventListener(
  "accessibilite-componentLoaded",
  (e) => {
    setTimeout(_init, 500);
  },
  { once: true },
);

let layerAttributes = [];
let reloadTable = [];
let runningReload = [];

/*
    function getFeatures(layer){
        return new Promise (resolve => {
            switch (layer.type) {
                case 'wms':
                    // un appel WFS pour ne récupérer toutes les données visualisables sur la carte et pas seulement celles de l'emprise visible
                    // Attention à bien conserver le CQLFilter si défini dans la structure
                    // LIMITE : si la couche appelle un style, le filtre porté par ce style ne peut pas être appliqué sur cette extension
                    const url = layer.url + "?service=WFS&version=1.0.0&request=GetFeature&typeName=" + layer.layername + "&outputFormat=application%2Fjson&srsname=EPSG:3948";
                    if (layer.filter && layer.filter != "") {
                        url += "&CQL_FILTER=" + encodeURIComponent(layer.filter);
                    }
                    fetch(url).then((response) => response.json())
                        .then((data) => {
                            resolve({'response': data.features});
                        });
                    break;
                case 'customlayer':
                    setTimeout(function (){
                        resolve({'response': layer.layer.getSource().getFeatures()});
                      }, 1500);
                    break;
                default:
                    setTimeout(function (){
                        resolve({'response': layer.layer.getSource().getFeatures()});
                      }, 1500);
            }
        });
    }
    */

function getFeatures(layer) {
  switch (layer.type) {
    case "wms":
      // un appel WFS pour ne récupérer toutes les données visualisables sur la carte et pas seulement celles de l'emprise visible
      // Attention à bien conserver le CQLFilter si défini dans la structure
      // LIMITE : si la couche appelle un style, le filtre porté par ce style ne peut pas être appliqué sur cette extension
      return new Promise(waitForDataWMS);
    case "customlayer":
      return new Promise(waitForData);
    default:
      return new Promise(waitForData);
  }

  function waitForDataWMS(resolve, reject) {
    let url =
      layer.url +
      "?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
      layer.layername +
      "&outputFormat=application%2Fjson&srsname=EPSG:3948";
    if (layer.filter && layer.filter != "") {
      url += "&CQL_FILTER=" + encodeURIComponent(layer.filter);
    }
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        resolve({ response: data.features });
      });
  }

  function waitForData(resolve, reject) {
    if (layer.layer.getSource().getFeatures().length > 0) {
      resolve({ response: layer.layer.getSource().getFeatures() });
    } else {
      setTimeout(waitForData.bind(this, resolve, reject), 30);
    }
  }
}

let parsed_template;

// recherche des champs affichés selon le template de couche
async function getAttributes(template) {
  // nettoyage des textes entre commentaires (HTML)
  template = template.replaceAll(/<!--([. \S\s])*?-->/gs, "");
  // nettoyage des expressions techniques pour l'extension carousel photo
  template = template.replaceAll(/slide[a-zA-Z0-9_-]+{{+([^\^#\/]*?)}}+/gi, "");
  parsed_template = Mustache.parse(template);
  // calculer les attributs de données
  const attributes = await _resolveContent(Mustache.parse(template)[0]);

  return attributes;
}

// cherche dans le template parsé les attributs à conserver
// prise en compte des attributs de type tableau
function _resolveContent(_parsedcontent) {
  let attributes = [];
  let _filteredContent = _parsedcontent.find((element) =>
    Array.isArray(element),
  );
  let _ct;
  for (let i = 0; i < _filteredContent.length; i++) {
    switch (_filteredContent[i][0]) {
      case "name":
      case "&":
        // cas attribut xx.yy (yy = propriété de xx)
        if (_filteredContent[i][1].indexOf(".") > 0) {
          let _name = _filteredContent[i][1].split(".")[0];
          let _attr = _filteredContent[i][1].split(".")[1];
          let newattrib = {};
          newattrib[_name] = [_attr];
          _addElement(attributes, newattrib);
        } else {
          // cas simple
          _addElement(attributes, _filteredContent[i][1]);
        }
        break;
      case "#":
        //console.log('Attribut complexe détecté : ' + _filteredContent[i][0]+ _filteredContent[i][1]);
        _ct = _resolveContent(_filteredContent[i]);
        // si _filteredContent[i][1] contient .length alors on l'enregistre comme un tableau
        if (_filteredContent[i][1].indexOf(".length") > 0) {
          let _name = _filteredContent[i][1].substring(
            0,
            _filteredContent[i][1].indexOf(".length"),
          );
          for (const j = 0; j < _ct.length; j++) {
            _addElement(attributes, _ct[j]);
          }

          // les autres fils sont traités comme des noeuds frères de attributes[_name]
          // exemple : {{#joursFermes.variationCongesScolaires}} qui se trouve après {{#horairesOuvertures.length}}, mais pas dans {{#horairesOuvertures}}
        } else if (_filteredContent[i][1].indexOf(".") > 0) {
          let _name = _filteredContent[i][1].split(".")[0];
          let _attr = _filteredContent[i][1].split(".")[1];
          if (_ct.length > 0) {
            for (let j = 0; j < _ct.length; j++) {
              _addElement(attributes, _ct[j]);
            }
          } else {
            let newattrib = {};
            newattrib[_name] = [_attr];
            _addElement(attributes, newattrib);
          }
        } else {
          //chercher si l'attribut est une valeur "feuille" ou si c'est une branche
          // si branche, ajouter un attribut du nom
          let _name = _filteredContent[i][1];
          if (_ct.length > 0) {
            if (!_ct.includes(_name)) {
              let newattrib = {};
              newattrib[_name] = _ct;
              _addElement(attributes, newattrib);
            } else {
              //si feuille chaque attribut est propre au noeud parent
              for (let j = 0; j < _ct.length; j++) {
                _addElement(attributes, _ct[j]);
              }
            }
          } else {
            _addElement(attributes, _filteredContent[i][1]);
          }
        }
        break;
      case "^":
        _ct = _resolveContent(_filteredContent[i]);
        for (let j = 0; j < _ct.length; j++) {
          _addElement(attributes, _ct[j]);
        }
        break;
      default:
    }
  }

  return attributes;
}

// Mutualisation du push dans le tableau attributes + avant le push d'un objet, vérifier s'il n'existe pas déjà un objet sur le même noeud
function _addElement(destination, element) {
  if (typeof element === "object") {
    let foundNode = false;
    for (const cle_attrib of Object.keys(element)) {
      for (let i = 0; i < destination.length; i++) {
        if (typeof destination[i] === "object") {
          if (destination[i].hasOwnProperty(cle_attrib)) {
            foundNode = true;
            destination[i][cle_attrib] = destination[i][cle_attrib].concat(
              element[cle_attrib],
            );
          }
        }
      }

      if (!foundNode) {
        destination.push(element);
      }
    }
  } else {
    // propriété simple (tableau) à ajouter
    if (!destination.includes(element)) {
      destination.push(element);
    }
  }
}

// creation de l'onglet et du tableau
async function buildTable(layer) {
  // ici : créer la structure de base pour toutes les couches (y compris la div qui contient le tableau, le tableau )
  // puis appeler la fonction de remplissage du tableau updateLayerTable pour remplir le tbody du tableau

  // CREATION ONGLET
  const menu = document.getElementById("accessibility_tabs");
  const isFirstTab = !menu.hasChildNodes();
  const li = document.createElement("li");
  li.setAttribute("role", "presentation"); // Obligatoire pour les enfants de tablist
  li.classList.add("nav-item");

  const tabButton = document.createElement("button");
  tabButton.classList.add("nav-link");
  tabButton.id = "button_" + layer.layerid;
  tabButton.setAttribute("role", "tab");
  tabButton.setAttribute("type", "button");
  tabButton.setAttribute("aria-controls", "data_" + layer.layerid);
  tabButton.setAttribute("tabindex", isFirstTab ? "0" : "-1");
  tabButton.setAttribute("data-bs-toggle", "tab");
  tabButton.setAttribute("data-bs-target", `#data_${layer.layerid}`);
  tabButton.textContent = layer.name;

  li.appendChild(tabButton);
  menu.appendChild(li);

  // ✅ Initialiser l'onglet avec Bootstrap
  const bsButton = new bootstrap.Tab(tabButton);

  // CREATION TABLEAU
  const contenu = document.getElementById("accessibility_main_");
  const maindiv = document.createElement("div");
  maindiv.id = "data_" + layer.layerid;
  maindiv.setAttribute("role", "tabpanel");
  maindiv.setAttribute("aria-labelledby", "button_" + layer.layerid);
  maindiv.classList.add("tab-pane", "fade");
  maindiv.setAttribute("originallayer", layer.layerid);

  let attributes = await getAttributes(layer.template);
  attributes = await _analyseAttributes(attributes);
  layerAttributes[layer.layerid] = await _sortAttributes(attributes);

  const header = await _setTableHeader(layerAttributes[layer.layerid]);
  const _table = document.createElement("table");
  _table.appendChild(header);

  const _tblBody = document.createElement("tbody");
  maindiv.appendChild(_table);
  _table.appendChild(_tblBody);
  contenu.appendChild(maindiv);

  // Remplir le tableau avec les données
  updateLayerTable(layer);
  return bsButton;
}

async function _sortAttributes(attributes) {
  const objattr = [];
  const simpleattr = [];

  for (let i = 0; i < attributes.length; i++) {
    if (typeof attributes[i] === "object") {
      let label;
      for (const cle_attrib of Object.keys(attributes[i])) {
        if (cle_attrib !== "colspan" && cle_attrib !== "descendants") {
          label = cle_attrib;
          break;
        }
      }
      let childAttrib = await _sortAttributes(attributes[i][label]);
      childAttrib.label = label;
      childAttrib.colspan = attributes[i].colspan;
      childAttrib.descendants = attributes[i].descendants;
      objattr.push(childAttrib);
    } else {
      simpleattr.push(attributes[i]);
    }
  }
  return { simpleattr: simpleattr, objattr: objattr };
}

async function _analyseAttributes(attributes) {
  for (let i = 0; i < attributes.length; i++) {
    if (typeof attributes[i] === "object") {
      _setRowColspan(attributes[i]);
    }
  }
  return attributes;
}

async function _setTableHeader(attributes) {
  let max_rows = 1;
  const tbl_objattrib = attributes.objattr;
  for (let i = 0; i < tbl_objattrib.length; i++) {
    max_rows = Math.max(max_rows, tbl_objattrib[i].descendants + 1);
  }

  const _tblHead = document.createElement("thead");
  const _thead_tr = [];
  for (let i = 0; i < max_rows; i++) {
    _thead_tr[i] = document.createElement("tr");
    _tblHead.appendChild(_thead_tr[i]);
  }

  await _createTHObjects(_thead_tr, 0, max_rows, attributes);
  return _tblHead;
}

async function _createTHObjects(_thead_tr, level, max_row, attributes) {
  const simpleattr =
    attributes.simpleattr != "undefined" ? attributes.simpleattr : [];
  const objattr = attributes.objattr != "undefined" ? attributes.objattr : [];

  for (let i = 0; i < simpleattr.length; i++) {
    const _thead_th = document.createElement("th");
    _thead_th.setAttribute("tabindex", i === 0 ? "0" : "-1");
    _thead_th.setAttribute("scope", "col");
    _thead_th.setAttribute("rowspan", max_row);
    attributes.simplerowspan = max_row;
    _thead_th.appendChild(document.createTextNode(simpleattr[i]));
    _thead_tr[level].appendChild(_thead_th);
  }
  for (let i = 0; i < objattr.length; i++) {
    const _thead_th = document.createElement("th");
    _thead_th.setAttribute("tabindex", i === 0 ? "0" : "-1");
    _thead_th.setAttribute("scope", "col");
    _thead_th.setAttribute("colspan", objattr[i].colspan);
    _thead_th.appendChild(document.createTextNode(objattr[i].label));
    _thead_tr[level].appendChild(_thead_th);

    await _createTHObjects(_thead_tr, level + 1, max_row - 1, objattr[i]);
  }
}

// calcule les valeurs de rowspan et colspan des attributs
function _setRowColspan(element) {
  for (const cle_attrib of Object.keys(element)) {
    let descendants = 1;
    let colspan = 0;

    for (let i = 0; i < element[cle_attrib].length; i++) {
      if (typeof element[cle_attrib][i] === "object") {
        _setRowColspan(element[cle_attrib][i]);
        descendants = Math.max(
          element[cle_attrib][i].descendants + 1,
          descendants,
        );
        colspan += element[cle_attrib][i].colspan;
      } else {
        colspan += 1;
      }
    }
    element.colspan = colspan;
    element.descendants = descendants;
  }
}

// mise à jour du contenu du tableau
function updateLayerTable(layer) {
  runningReload[layer.layerid] = true;
  reloadTable[layer.layerid] = false;
  try {
    getFeatures(layer)
      .then(async function (res) {
        const features = res.response;
        const _tblBody = document.querySelector(
          "#data_" + layer.layerid + "> table > tbody",
        );
        _tblBody.innerHTML = "";

        for (let i = 0; i < features.length; i++) {
          const maxRowSpan = await _calculateMaxRowSpan(
            features[i],
            layerAttributes[layer.layerid].objattr,
          );
          const _tbody_tr = [];
          await _createTDObjects(
            _tbody_tr,
            features[i],
            maxRowSpan,
            0,
            layerAttributes[layer.layerid].simpleattr,
            layerAttributes[layer.layerid].objattr,
          );
          for (let j = 0; j < _tbody_tr.length; j++) {
            _tblBody.appendChild(_tbody_tr[j]);
          }
        }
      })
      .then(function () {
        runningReload[layer.layerid] = false;
        if (reloadTable[layer.layerid]) {
          updateLayerTable(layer);
        }
      });
  } catch (err) {
    console.log(err);
  }
}

async function _createTDObjects(
  _tbody_tr,
  feature,
  maxRowSpan,
  level,
  simpleattr,
  objattr,
) {
  // Produire les éléments DOM

  // attributs simples
  for (let j = 0; j < simpleattr.length; j++) {
    const _tbody_td = document.createElement("td");
    _tbody_td.setAttribute("tabindex", "-1"); // Les autres cellules ne sont accessibles que via les flèches
    if (maxRowSpan && maxRowSpan > 0) {
      _tbody_td.setAttribute("rowspan", maxRowSpan);
    }
    const propriete = simpleattr[j];

    let texte = "";
    if (feature) {
      if (Object.hasOwn(feature, propriete)) {
        texte = feature[propriete];
      } else if (feature.properties) {
        texte = feature.properties[propriete];
      } else {
        try {
          texte = feature.get(propriete);
        } catch (err) {
          texte = "";
        }
      }
      texte = texte ? texte : "";
      // rectifications basiques de données
      try {
        if (typeof texte == "boolean") {
          texte = texte ? "oui" : "non";
        } else if (String(texte).indexOf("1970-01-01") >= 0) {
          // soit mauvaise date si heure = 00:00
          // soit on ne veut garder que l'heure
          let _dtHR = new Date(texte).getHours();
          let _dtMN = new Date(texte).getMinutes();

          if (_dtHR == 0 && _dtMN == 0) {
            texte = "";
          } else {
            texte =
              String(_dtHR).padStart(2, "0") +
              "h" +
              String(_dtMN).padStart(2, "0");
          }
        } else if (String(texte).indexOf("T00:00:00+") >= 0) {
          texte = new Date(texte).toLocaleDateString("fr-FR");
        }
      } catch (e) {
        console.log(e);
      }
    }
    _tbody_td.textContent = texte;
    if (!_tbody_tr[level]) {
      let _tr = document.createElement("tr");
      _tbody_tr.push(_tr);
    }
    _tbody_tr[level].appendChild(_tbody_td);
  }
  // attributs complexes
  if (objattr) {
    for (let j = 0; j < objattr.length; j++) {
      let obj;
      if (feature) {
        if (Object.prototype.hasOwnProperty.call(feature, objattr[j].label)) {
          obj = feature[objattr[j].label];
        } else if (feature.properties) {
          obj = feature.properties[objattr[j].label];
        } else {
          try {
            obj = feature.get(objattr[j].label);
          } catch (err) {}
        }
      }
      if (obj && Array.isArray(obj) && obj.length > 0) {
        let childlevel = level;
        for (let k = 0; k < obj.length; k++) {
          let childMaxRowSpan = await _calculateMaxRowSpan(
            obj[k],
            objattr[j].objattr,
          );
          await _createTDObjects(
            _tbody_tr,
            obj[k],
            childMaxRowSpan,
            childlevel,
            objattr[j].simpleattr,
            objattr[j].objattr,
          );
          childlevel += Math.max(childMaxRowSpan, 1);
        }
        // créer une case vide de la hauteur restante

        if (childlevel < maxRowSpan) {
          comblertable(
            childlevel,
            _tbody_tr,
            maxRowSpan - childlevel,
            objattr[j].colspan,
          );
        }
      } else {
        comblertable(level, _tbody_tr, maxRowSpan, objattr[j].colspan);
      }
    }
  }
}

function comblertable(level, tbody_tr, rowspan, colspan) {
  if (!tbody_tr[level]) {
    let _tr = document.createElement("tr");
    tbody_tr.push(_tr);
  }
  const _td_comble = document.createElement("td");
  _td_comble.setAttribute("rowspan", rowspan);
  _td_comble.setAttribute("colspan", colspan);
  tbody_tr[level].appendChild(_td_comble);
}

async function _calculateMaxRowSpan(feature, modele) {
  let maxRowSpan = 0;

  for (let i = 0; i < modele.length; i++) {
    let value;
    if (Object.prototype.hasOwnProperty.call(feature, modele[i].label)) {
      value = feature[modele[i].label];
    } else if (feature.properties) {
      value = feature.properties[modele[i].label];
    } else {
      try {
        value = feature.get(modele[i].label);
      } catch (e) {}
    }

    if (Array.isArray(value)) {
      // si type = tableau, alors il peut y avoir plusieurs occurences (elles s'additionnent)
      let totalchildMaxRowSpan = 0;
      if (modele[i].objattr && modele[i].objattr.length > 0) {
        // si fils de type complexe
        for (let j = 0; j < value.length; j++) {
          let childMaxRowSpan = await _calculateMaxRowSpan(
            value[j],
            modele[i].objattr,
          );
          totalchildMaxRowSpan += childMaxRowSpan;
        }
      } else {
        // si fils de type feuille uniquement
        totalchildMaxRowSpan = value.length;
      }
      // on ne conserve que le maxrowspan le plus élevé entre tous les fils
      maxRowSpan = Math.max(maxRowSpan, totalchildMaxRowSpan);
    }
  }
  return Math.max(1, maxRowSpan);
}

function _isDate(date) {
  return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
}

function _decodedHTMLEntity(string) {
  const txtarea = document.createElement("textarea");
  txtarea.innerHTML = string;
  return txtarea.value;
}

function relaunch(layer) {
  if (runningReload[layer.layerid] === true) {
    reloadTable[layer.layerid] = true;
  } else {
    updateLayerTable(layer);
  }
}

async function _init() {
  if (API.mode == "data") {
    const layers = mviewer.getLayers();
    let firstTabButton = null;
    for (const layerid of Object.keys(layers)) {
      const layer = layers[layerid];

      layer.layer.getSource().on("changefeature", () => {
        relaunch(layer);
      });
      layer.layer.getSource().on("change", () => {
        relaunch(layer);
      });

      if (layer.queryable) {
        if (layer.visible == "false") {
          mviewer.addLayer(layer);
        }
        const layerTabButton = await buildTable(layer);
        if (!firstTabButton) {
          firstTabButton = layerTabButton;
        }
      }
    }
    firstTabButton.show();

    // Affichage du tableau et masquage de la carte
    document.getElementById("accessibilite-custom-component").style.display =
      "block";
    document.getElementById("wrapper").style.display = "none";
    document.getElementById("mv-navbar").style.display = "none";
    if (configuration.getConfiguration().application.showhelp == "true") {
      $("#help").modal("hide");
    }
    // Écouteur pour la navigation au clavier dans les tables
    document.addEventListener("keydown", function (e) {
      // Vérifier si l'élément actif est une cellule de tableau
      const activeElement = document.activeElement;
      if (activeElement.tagName === "TD" || activeElement.tagName === "TH") {
        const table = activeElement.closest("table");
        if (!table) return;

        const cells = table.querySelectorAll("td, th");
        const currentIndex = Array.from(cells).indexOf(activeElement);

        // Gestion des flèches
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            moveFocus(cells, currentIndex, -1, table); // Monter d'une ligne
            break;
          case "ArrowDown":
            e.preventDefault();
            moveFocus(cells, currentIndex, 1, table); // Descendre d'une ligne
            break;
          case "ArrowLeft":
            e.preventDefault();
            moveFocus(cells, currentIndex, -1, table, true); // Aller à gauche
            break;
          case "ArrowRight":
            e.preventDefault();
            moveFocus(cells, currentIndex, 1, table, true); // Aller à droite
            break;
        }
      }
    });
  }
}
// Fonction pour déplacer le focus
function moveFocus(cells, currentIndex, step, table, isHorizontal = false) {
  const rows = table.querySelectorAll("tr");
  const currentCell = cells[currentIndex];
  const currentRow = currentCell.closest("tr");
  const currentRowIndex = Array.from(rows).indexOf(currentRow);

  let nextIndex;
  if (isHorizontal) {
    // Navigation horizontale (gauche/droite)
    const rowCells = currentRow.querySelectorAll("td, th");
    const currentRowCellIndex = Array.from(rowCells).indexOf(currentCell);
    nextIndex = currentRowCellIndex + step;
    if (nextIndex < 0 || nextIndex >= rowCells.length) return; // Limites de la ligne
    rowCells[nextIndex].focus();
  } else {
    // Navigation verticale (haut/bas)
    const currentColIndex = Array.from(
      currentRow.querySelectorAll("td, th"),
    ).indexOf(currentCell);
    const nextRowIndex = currentRowIndex + step;
    if (nextRowIndex < 0 || nextRowIndex >= rows.length) return; // Limites de la table
    const nextRow = rows[nextRowIndex];
    const nextRowCells = nextRow.querySelectorAll("td, th");
    if (currentColIndex < nextRowCells.length) {
      nextRowCells[currentColIndex].focus();
    }
  }
}

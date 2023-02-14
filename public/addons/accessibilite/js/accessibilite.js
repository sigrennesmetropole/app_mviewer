// Outil facilitant l'accessibilité aux données d'une carte
// Présentation des données sous une forme de tableau
// chaque couche est présentée par un onglet
// pas de relation dynamique entre tableau et carte
// URL d'accès au tableau (mode=data)
    var layerAttributes = [];
    
    function getFeatures(layer){
        return new Promise (resolve => {
            switch (layer.type) {
                case 'wms':
                    // un appel WFS pour ne récupérer toutes les données visualisables sur la carte et pas seulement celles de l'emprise visible
                    // Attention à bien conserver le CQLFilter si défini dans la structure
                    var url = layer.url + "?service=WFS&version=1.0.0&request=GetFeature&typeName=" + layer.layername + "&outputFormat=application%2Fjson&srsname=EPSG:3948";
                    if (layer.filter && layer.filter != "") {
                        url += "&CQL_FILTER=" + encodeURIComponent(layer.filter);
                    }
                    fetch(url).then((response) => response.json())
                        .then((data) => {
                            //console.log(data.features);
                            resolve({'response': data.features});
                        });
                    break;
                case 'customlayer':
                //console.log( layer.layer.getSource().getFeatures());
                    resolve({'response': layer.layer.getSource().getFeatures()});
                    //return layer.layer.getSource().getFeatures();
                    break;
                default:
                    resolve({'response': layer.layer.getSource().getFeatures()});
                    //return layer.layer.getSource().getFeatures();
            }
        });
    }
    var parsed_template;
    
    // recherche des champs affichés selon le template de couche
    function getAttributes(template){
        
        // nettoyage des textes entre commentaires (HTML)
        template = template.replaceAll(/<!--([. \S\s])*?-->/gs, '');
        // nettoyage des expressions techniques pour l'extension carousel photo
        template = template.replaceAll(/slide[a-zA-Z0-9_-]+{{+([^\^#\/]*?)}}+/gi,'');
        parsed_template = Mustache.parse(template);
        // calculer les attributs de données
        var attributes  = _resolveContent(Mustache.parse(template)[0]);
                
        //console.log(attributes);
        return attributes;
        
        /*
        var regex = /{{+([^\^#\/]*?)}}+/gi;
        // rechercher tous les attributs au format {{(.*?)}} dans le template, mais pas {{(#.*)}} ni {{(/.*)}} ni {{(^.*)}} => regex "{{+([^\^#\/]*?)}}+"
        return Array.from(new Set(template.match(regex).map(function(x){ return x.replace(/{|}/g,'') })));
        */
    }
    
    
    
    // cherche dans le template parsé les attributs à conserver
    // prise en compte des attributs de type tableau
    function _resolveContent(_parsedcontent){
        let attributes=[];
        let _filteredContent = _parsedcontent.find(element => Array.isArray(element));
        let _ct;
        for (var i=0;i<_filteredContent.length; i++){
            switch (_filteredContent[i][0]) {
                case 'name':
                case '&':
                    // cas attribut xx.yy (yy = propriété de xx)
                    if (_filteredContent[i][1].indexOf('.') > 0) {
                        let _name = _filteredContent[i][1].split('.')[0];
                        let _attr = _filteredContent[i][1].split('.')[1];
                        let newattrib={};
                        newattrib[_name] = [_attr];
                        _addElement(attributes, newattrib);
                        //attributes.push(newattrib);
                    } else { // cas simple
                        _addElement(attributes, _filteredContent[i][1]);
                        //attributes.push(_filteredContent[i][1]);
                    }
                    break;
                case '#':
                    console.log('Attribut complexe détecté : ' + _filteredContent[i][0]+ _filteredContent[i][1]);
                    _ct = _resolveContent(_filteredContent[i]);
                    console.log(_ct);
                    // si _filteredContent[i][1] contient .length alors on l'enregistre comme un tableau
                    if (_filteredContent[i][1].indexOf('.length') > 0) {
                        let _name = _filteredContent[i][1].substring(0, _filteredContent[i][1].indexOf('.length'));
                        for (var j=0; j<_ct.length; j++) {
                            _addElement(attributes, _ct[j]);
                            //attributes.push(_ct[j]);
                        }
                        
                        // les autres fils sont traités comme des noeuds frères de attributes[_name]
                        // exemple : {{#joursFermes.variationCongesScolaires}} qui se trouve après {{#horairesOuvertures.length}}, mais pas dans {{#horairesOuvertures}}
                    } else if (_filteredContent[i][1].indexOf('.') > 0) {
                        
                        let _name = _filteredContent[i][1].split('.')[0];
                        let _attr = _filteredContent[i][1].split('.')[1];
                        if (_ct.length > 0 ) {
                            for (let j=0; j<_ct.length;j++){
                                _addElement(attributes, _ct[j]);
                                //attributes.push(_ct[j]);
                            }
                        } else {
                            let newattrib={};
                            newattrib[_name] = [_attr];
                            _addElement(attributes, newattrib);
                            //attributes.push(newattrib);
                        }
                    } else { 
                        //chercher si l'attribut est une valeur "feuille" ou si c'est une branche
                        // si branche, ajouter un attribut du nom 
                        let _name = _filteredContent[i][1];
                        if (! _ct.includes(_name)) {
                            let newattrib={};
                            newattrib[_name] = _ct;
                            _addElement(attributes, newattrib);
                            //attributes.push(newattrib);
                        }
                        //si feuille chaque attribut est propre au noeud parent
                        else {
                            for (let j=0; j<_ct.length;j++){
                                _addElement(attributes, _ct[j]);
                                //attributes.push(_ct[j]);
                            }
                        }
                    }
                    break;
                case '^':
                    console.log('Attribut complexe détecté : ' + _filteredContent[i][0]+ _filteredContent[i][1]);
                    _ct = _resolveContent(_filteredContent[i]);
                    for (let j=0; j<_ct.length;j++){
                        _addElement(attributes, _ct[j]);
                        //attributes.push(_ct[j]);
                    }
                    break;
                default:
            }
        }
        
        return attributes;
    }
    
    // Mutualisation du push dans le tableau attributes + avant le push d'un objet, vérifier s'il n'existe pas déjà un objet sur le même noeud
    function _addElement(destination, element){
        if( typeof element === "object"){
            var foundNode = false;
            for (const cle_attrib of Object.keys(element)) {
//TODO            // pour être sûr du résultat, faire une boucle sur toutes les entrées de element
            //var cle_attrib = Object.keys(element)[0];
                for (let i=0; i<destination.length;i++){
                    if(typeof destination[i] === "object") {
                        if (destination[i].hasOwnProperty(cle_attrib)) {
                            foundNode=true;
                            destination[i][cle_attrib] = destination[i][cle_attrib].concat(element[cle_attrib]);
                        }
                    }
                }
            
                if (!foundNode){
                    destination.push(element);
                }
            }
        } else { // propriété simple (tableau) à ajouter
            destination.push(element);
        }
    }
    
    

    // creation de l'onglet et du tableau
    async function buildTable(layer) {
        // TODO : séparer la construction de l'onglet de la création du tableau => fonction de creation du tableau
        // ici : créer la structure de base pour toutes les couches (y compris la div qui contient le tableau, le tableau )
        // puis appeler la fonction de remplissage du tableau updateLayerTable pour remplir le tbody du tableau
        
        const attributes = getAttributes(layer.template);
        layerAttributes[layer.layerid] = attributes;
        
        //CREATION ONGLET
        var menu = document.getElementById('accessibility_tabs');
        var firstChild=!menu.hasChildNodes();
        var li = document.createElement('li');
        var a = Object.assign(document.createElement('a'), {id:"a_"+layer.layerid, href:'#data_'+layer.layerid, role:"tab"});
        a.setAttribute("data-toggle", "tab");
        
        a.appendChild(document.createTextNode(layer.name));
        li.appendChild(a);
        menu.appendChild(li);
        
        //CREATION TABLEAU
        var contenu = document.getElementById('accessibility_main_');
        var maindiv = Object.assign(document.createElement('div'), {id:'data_'+layer.layerid, role:"tabpanel"});
        maindiv.classList.add("tab-pane", "fade", "in");
        maindiv.setAttribute('originallayer',  layer.layerid);

        //maindiv.classList.add("tab-pane");
        var _table = document.createElement('table');
        var _tblHead = document.createElement('thead');
        var _thead_tr = document.createElement('tr');
        for (let i = 0; i < attributes.length; i++) {
            var _thead_th = document.createElement('th');
            _thead_th.appendChild(document.createTextNode(attributes[i]));
            _thead_tr.appendChild(_thead_th);
        }
        var _tblBody = document.createElement("tbody");
        maindiv.appendChild(_table);
        _tblHead.appendChild(_thead_tr);
        _table.appendChild(_tblHead);
        _table.appendChild(_tblBody);
        contenu.appendChild(maindiv);
        
        //Ouverture par défaut sur le premier onglet
        // solution ci-dessous ne marche pas
        if (firstChild){
            li.classList.add("active");
            a.setAttribute("aria-expanded","true");
            maindiv.classList.add("active");
        }
        
        // Remplir le tableau avec les données
        updateLayerTable(layer, attributes);
    }
    
    // mise à jour du contenu du tableau
    function updateLayerTable(layer, attributes){
        var _tblBody = document.querySelector('#data_' + layer.layerid + '> table > tbody');
        try {
            getFeatures(layer).then(function(res) { 
                //console.log("FEATURES OK");
                const features = res.response;
                _tblBody.innerHTML = '';
                
                for (let k = 0; k < features.length; k++) {
                    var _tbody_tr = document.createElement('tr');
                    for (let j = 0; j < attributes.length; j++) {
                        var _tbody_td = document.createElement('td');
                        var texte = "";
                        if (features[k].properties){
                            texte = features[k].properties[attributes[j]];
                        } else {
                            texte = features[k].get(attributes[j]);
                        }
                        if (texte != null) {_tbody_td.appendChild(document.createTextNode(texte));}
                        _tbody_tr.appendChild(_tbody_td);
                    }
                    _tblBody.appendChild(_tbody_tr);
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
    
    function _init() {
        if (API.mode=='data'){
            //récupération de la liste des couches de la TOC pour conserver l'ordre
            var layers = document.querySelectorAll("#menu li.mv-nav-item");
            for (var i =0; i< layers.length; i++){
                var layer  = mviewer.getLayer(layers[i].getAttribute('data-layerid'));
                buildTable(layer);
                // cas des ajouts/suppr de features
                layer.layer.getSource().once('change', () => {
                    updateLayerTable(layer, layerAttributes[layer.layerid]);
                });
                // cas des modifications d'attributs de features
                layer.layer.getSource().once('changefeature', () => {
                    console.log("rechargement de la couche " + layer.layerid);
                    updateLayerTable(layer, layerAttributes[layer.layerid]);
                });
            }
            
            // Affichage du tableau et masquage de la carte
            document.getElementById('accessibilite-custom-component').style.display = 'block';
            document.getElementById('wrapper').style.display = 'none';
            document.getElementById('mv-navbar').style.display = 'none';
        }
    }

_map.once('rendercomplete', _init);
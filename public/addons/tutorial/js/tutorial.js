var ordersTabSorted = [];

var applicationOptions = configuration.getConfiguration().application;
var configFile = getExtensionConfigFile();
var tutorialCode = '';



/*
* Récupération de la configuration du tutorial dans le fichier précisé avec l'attribut configFile de l'extension
*/
function getExtensionConfigFile(){
  var configPerso;
  
  var extension = configuration.getConfiguration().extensions.extension.find(element => element.id=='tutorial');
  if (extension != undefined) {
      if (extension.configFile != undefined) {
            configPerso=extension.configFile;
      } else {
        console.log("Err : l'attribut configfile du fichier de personnalisation de la recherche est manquant sur l'extension");
      }
  } else {
      console.log("Err: L'extension n'a pas pu être trouvée dans la liste des extensions.")
  }
  return configPerso;
}

/*
* Préparation du contenu DOM
*/
function loadDOM(){
    $.getJSON(configFile, function (tutorialData) {
        var ordersTab = [];
        for (index in tutorialData) {
            let data = tutorialData[index];
            if (typeof data.height === 'undefined') {data.height = "auto";}
            if (typeof data.width === 'undefined') {data.width = "auto";}
            if (typeof data.top === 'undefined') {data.top = "auto";}
            if (typeof data.left === 'undefined') {data.left = "auto";}

            // set tutorial item
            var tutoHtml =  '<div id="tutorial' + data.order + '" class="didacticiel">'
                    +'<div class="didact-content" style="width: ' + data.width +'; top: ' + data.top +'; left: ' + data.left +'">'
                    +    '<div class="quote-container">'
                    +        '<i class="pin"></i>'
                    +        '<blockquote class="note postit" style="height: '+ data.height +'">' + data.content + '</blockquote>'
                    +    '</div>'
                    + '</div></div>';
            tutorialCode += tutoHtml;
            ordersTab.push( parseFloat(data.order) );
        }
        ordersTabSorted = ordersTab.sort();
        $('#tutorialContainer').html(tutorialCode);
        const tutoDOMReadyEvent = new CustomEvent('tutoDOM-ready', { detail: {nbMessages: ordersTabSorted.length } });
        document.dispatchEvent(tutoDOMReadyEvent);
    });
}

/*
* Démarrage du tutorial et préparation du passage aux messages suivants
*/
function _start() {
    //event on click to show next message
    $('#tutorialContainer').click(_nextmessage);
    $('#tutorialContainer').show();
    $('#tutorial' + ordersTabSorted[0]).show();
}

/*
* Mise en attente du démarrage si aide affichée
*/
function _waittostart() {
    const tutoStartEvent = new CustomEvent('startTuto');
    if (applicationOptions.showhelp === 'true') {
        $('#help').on('hidden.bs.modal', function () {
            document.dispatchEvent(tutoStartEvent);
        });
    } else {
        document.dispatchEvent(tutoStartEvent);
    }
    document.removeEventListener('tutoDOM-ready', function(){});
}

function _nextmessage(){
    var activeMsg = $('#tutorialContainer .didacticiel:visible')[0].id;
    var activeid = parseInt(activeMsg.substr('tutorial'.length, activeMsg.length - 'tutorial'.length));
    
    if (activeid < ordersTabSorted.length){
        $('#tutorial' + activeid).hide();
        $('#tutorial' + (activeid + 1) ).show();
    } else {
          $('#tutorialContainer').remove();
          $('#map').focus();
    }
}

function waitForElementToDisplay(selector, callback, checkFrequencyInMs, timeoutInMs) {
  var startTimeInMs = Date.now();
  (function loopSearch() {
    if (document.querySelector(selector) != null) {
      callback();
      return;
    }
    else {
      setTimeout(function () {
        if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs)
          return;
        loopSearch();
      }, checkFrequencyInMs);
    }
  })();
}


document.addEventListener('startTuto', (e) => _start());
if(configFile !== '' && !configuration.getConfiguration().mobile){
    document.addEventListener('tutoDOM-ready', (e) => {_waittostart()}, { once: true });
    waitForElementToDisplay("#tutorialContainer",loadDOM,100,9000);
}

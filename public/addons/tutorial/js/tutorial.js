
var initTutorial = function () {
    // insert tutorial container
    if ( document.querySelector('#tutorialContainer') === null ) {
        $('#main').append('<div id="tutorialContainer" class="tutocontainer" role="dialog"></div>');
    } else {
        $('#tutorialContainer').css('z-index', '1');
    }
};

var displayTutorial = function (tutorialFile) {
    $.getJSON(tutorialFile, function (tutorialData) {
        initTutorial();

        var tutorialCode = ''; // code of all tutorial
        var ordersTab = [];

        tutorialData.forEach(function (data) {
            if (typeof data.height === 'undefined') {
                data.height = "auto";
            }
            if (typeof data.width === 'undefined') {
                data.width = "auto";
            }
            if (typeof data.top === 'undefined') {
                data.top = "auto";
            }
            if (typeof data.left === 'undefined') {
                data.left = "auto";
            }

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
        });
        $('#tutorialContainer').html(tutorialCode);
        // display first element
        var ordersTabSorted = ordersTab.sort();
        $('#tutorial' + ordersTabSorted[0]).show();
        if ( document.querySelector('#forewordContainer') !== null ) {
            $('#tutorialContainer').hide();
        }
        $('#tutorialContainer').click(function (e) {
            var target = getFirstParentWithClass(e.target, 'didacticiel');
            for (var i =0; i < ordersTabSorted.length; i++) {
                if ('tutorial' + ordersTabSorted[i] === target.id) {
                    $('#tutorial' + ordersTabSorted[i]).hide();
                    if (i+1 < ordersTabSorted.length) {
                        $('#tutorial' + ordersTabSorted[i+1]).show();
                        break;
                    } else if (i === (ordersTabSorted.length - 1) ) {
                        $('#tutorialContainer').remove();
                        $('#help').removeClass('showtuto');
                        $('#map').focus();
                    }
                }
            }
        });
    });
};

//That function returns the first parent of a DOM element which respects the given className
function getFirstParentWithClass(element, className){
    if (element.classList.contains(className)){
        return element;
    } else {
        return getFirstParentWithClass(element.parentElement, className);
    }

}

var applicationOptions = rmOptionsManager.getApplicationConfiguration();
var configFile = getExtensionConfigFile();
if(applicationOptions.tutorial === 'true' && configFile !== '' && !configuration.getConfiguration().mobile){
    if (applicationOptions.showhelp === 'true') {
        $('#help').addClass('showtuto');
            $('#help').on('hidden.bs.modal', function () {
                if ($('#help').hasClass('showtuto')){
                    displayTutorial(configFile);
                }
            });
    } else {
        displayTutorial(configFile);
    }
}

function getExtensionConfigFile(){
  var extensions = configuration.getConfiguration().extensions;
  var configPerso;
  for (index in extensions.extension){
    var loopIndex = extensions.extension[index];
    if(loopIndex.id=="tutorial"){
      if (loopIndex.configFile != undefined) {
        configPerso=loopIndex.configFile;
      } else {
        console.log("Err : l'attribut configfile du fichier de personnalisation de la recherche est manquant sur l'extension");
      }
      break;
    }else{
      if(index === extensions.extension.length){
        console.log("Err: L'extension n'a pas pu être trouvée dans la liste des extensions.")
      }
    }
  }
  return configPerso;
}

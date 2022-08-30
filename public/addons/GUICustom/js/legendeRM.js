/**
 * Interdit la suppression de couche depuis la légende en cas d'affichage en mode mobile
 **/
$('#legend-modal').on('show.bs.modal', function (e) {
    if (configuration.getConfiguration().mobile) {
    $("#legend").addClass("active");
    //$("#legend .mv-layer-remove").hide();
    $("#layers-container-box-header").hide();
    }
})



/**
 * Gestion de l'icone pour déplier/replier les options de couche par détection d'ajout dans la légende
 **/
 
 const _modifiedLegend = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                _adjustLegend();
                break;
            }
        }
    };

if ($('#layers-container')){
    _initListeners();
} else {
    $(document).on('map-ready', function(){
        _initListeners();
    });
}
    
function _initListeners(){
    const observer = new MutationObserver(_modifiedLegend);
    observer.observe( $('#layers-container')[0], { childList: true });
    _adjustLegend();
}
    
function _adjustLegend() {
    $('#layers-container .icon-options').remove();
    $('#layers-container .layerdisplay-title>i.mv-grip').replaceWith('<i class="state-icon glyphicon glyphicon-chevron-down" onclick="mviewer.toggleLayerOptions(this);"></i>');
    $('#layers-container .layerdisplay-title>a:not(.mv-layer-remove)').attr( "onClick", "mviewer.toggleLayerOptions(this);" );
    
    $('#layers-container .layerdisplay-title>a:not(.mv-layer-remove)').on("click", function(){_switchchevron ($( this )); });
    $('#layers-container .layerdisplay-title>i.state-icon').on("click", function(){_switchchevron ($( this )); });
};

function _switchchevron(clickedElem){
    if (clickedElem.closest("li").find(".state-icon").hasClass("glyphicon glyphicon-chevron-down")) {
        clickedElem.closest("li").find(".state-icon").removeClass("glyphicon glyphicon-chevron-down").addClass("glyphicon glyphicon-chevron-up");
    } else {
        clickedElem.closest("li").find(".state-icon").removeClass("glyphicon glyphicon-chevron-up").addClass("glyphicon glyphicon-chevron-down");
    }
}
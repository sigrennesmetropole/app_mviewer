/**
* Déplace la toolbar à l'ouverture et à la fermeture du panneau de droite
**/
var _map = mviewer.getMap();
var opendivwidth = 0;
var opendivheight = 0;

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === "class") {
      var attributeValue = $(mutation.target).prop(mutation.attributeName);
      if(attributeValue === 'active'){
        setTimeout(function(){
          mutationId = $(mutation.target)[0].id;
          if(mutationId === "right-panel"){
            var panelWidth = document.getElementById(mutationId).offsetWidth;
            opendivwidth=parseInt(panelWidth,10);
            decaleMap([panelWidth/3,0]);
            $('#searchtool').animate({'right':panelWidth + 45});
            $('#parcelSelectors').animate({'right':panelWidth + 92});
            $('#zoomtoolbar').animate({'right':panelWidth +10});
            $('#toolstoolbar').animate({'right':panelWidth +10});
            $('#backgroundlayerstoolbar-default').animate({'right':panelWidth +10});
            $('#searchresults').animate({'right': panelWidth + 25});
            $('#right-panel .mv-header .close').click(function(){
              $('#searchresults').css({'display':'none'});
            });
          }
          if(mutationId === "bottom-panel"){
            var panelHeight = document.getElementById(mutationId).offsetHeight;
            opendivheight=parseInt(panelHeight,10);
            decaleMap([0,opendivheight/3*-1]);
            $('#backgroundlayerstoolbar-default').animate({'height':panelHeight +40});
            $('.ol-attribution').animate({'height':panelHeight +35});
            $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
            $('.ol-scale-line').animate({'height':panelHeight +20});
            $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
          }
        }, 500);
      }else{
        $('#searchtool').animate({'right':'60px'});
        $('#parcelSelectors').animate({'right':'105px'});
        $('#zoomtoolbar').animate({'right':'10px'});
        $('#toolstoolbar').animate({'right':'10px'});
        $('#backgroundlayerstoolbar-default').animate({'right':'10px'});
        $('#backgroundlayerstoolbar-default').animate({'height':'50px'});
        $('.ol-attribution').animate({'height':'30px'});
        $('.ol-scale-line').animate({'height':'15px'});
        $('.ol-attribution').css({"background-color":"rgba(255,255,255,0.7)"});
        $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0.7)"});
        decaleMap([opendivwidth/3 * -1 ,opendivheight/3]);
      }
    }
  });
});
observer.observe($("#right-panel")[0], {
  attributes: true
});
observer.observe($("#bottom-panel")[0], {
  attributes: true
});

function decaleMap([x, y]) {
  if (_map) {
    var center = _map.getView().getCenter();
    var resolution = _map.getView().getResolution();
    _map.getView().animate({
      center : [center[0] + x*resolution, center[1]+ y*resolution],
      duration: 500,
    });
  } else {
    console.warn('Erreur decalage');
  }
};

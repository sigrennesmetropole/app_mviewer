/**
* Déplace la toolbar à l'ouverture et à la fermeture du panneau de droite
**/
var _map = mviewer.getMap();
var opendivwidth = 0;
var opendivheight = 0;

var observer = new MutationObserver(function(mutations) {
  if(mutations.length >= 2){
    if(mutations[0].target.id != mutations[1].target.id){
      setTimeout(function(){
        if (mutations[0].target.classList[0] === "active" && mutations[1].target.classList[0] === "active") {
          var panelWidth;
          var panelHeight;
          mutations.forEach((mutation, i) => {
            if(mutation.target.id == "right-panel"){
              panelWidth = document.getElementById(mutation.target.id).offsetWidth;
            }
            if(mutation.target.id == "bottom-panel"){
              panelHeight = document.getElementById(mutation.target.id).offsetHeight;
            }
            opendivwidth = panelWidth;
            opendivheight = panelHeight;
          });
          $('#searchtool').animate({'right':panelWidth + 45});
          $('#parcelSelectors').animate({'right':panelWidth + 92});
          $('#zoomtoolbar').animate({'right':panelWidth +10});
          $('#toolstoolbar').animate({'right':panelWidth +10});
          $('#backgroundlayerstoolbar-default').animate({'right':panelWidth +10,'height':panelHeight +45});
          $('#searchresults').animate({'right': panelWidth + 25});
          $('#right-panel .mv-header .close').click(function(){
            $('#searchresults').css({'display':'none'});
          });
          $('.ol-attribution').animate({'height':panelHeight +35});
          $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
          $('.ol-scale-line').animate({'height':panelHeight +20});
          $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
          decaleMap([parseInt(panelWidth,10)/3,parseInt(panelHeight,10)/3*-1]);
        }
        if(mutations[0].target.classList[0] != "active" && mutations[1].target.classList[0] === "active"){
          if (mutations[0].target.id == 'right-panel' && mutations[1].target.id == 'bottom-panel') {
            //On ferme right on ouvre bottom
            var panelHeight = document.getElementById(mutations[1].target.id).offsetHeight;
            var panelWidth = document.getElementById(mutations[0].target.id).offsetWidth;
            opendivheight=parseInt(panelHeight,10);
            decaleMap([opendivwidth/3*-1,opendivheight/3*-1]);
            $('#searchtool').animate({'right':panelWidth + 45});
            $('#parcelSelectors').animate({'right':panelWidth + 92});
            $('#zoomtoolbar').animate({'right':panelWidth +10});
            $('#toolstoolbar').animate({'right':panelWidth +10});
            $('#backgroundlayerstoolbar-default').animate({'right':panelWidth +10,'height':panelHeight +45});
            $('#searchresults').animate({'right': panelWidth + 25});
            $('#right-panel .mv-header .close').click(function(){
              $('#searchresults').css({'display':'none'});
            });
            $('.ol-attribution').animate({'height':panelHeight +35});
            $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
            $('.ol-scale-line').animate({'height':panelHeight +20});
            $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
          }
          if (mutations[0].target.id == 'bottom-panel' && mutations[1].target.id == 'right-panel') {
            // on ferme bottom on ouvre right
            var panelHeight = document.getElementById(mutations[0].target.id).offsetHeight;
            var panelWidth = document.getElementById(mutations[1].target.id).offsetWidth;
            opendivwidth=parseInt(panelWidth,10);
            decaleMap([opendivwidth/3,opendivheight/3]);
            $('#backgroundlayerstoolbar-default').animate({'height':panelHeight +45,'right':panelWidth +10});
            $('.ol-attribution').animate({'height':panelHeight +35});
            $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
            $('.ol-scale-line').animate({'height':panelHeight +20});
            $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
            $('#searchtool').animate({'right':panelWidth + 45});
            $('#parcelSelectors').animate({'right':panelWidth + 92});
            $('#zoomtoolbar').animate({'right':panelWidth +10});
            $('#toolstoolbar').animate({'right':panelWidth +10});
            $('#searchresults').animate({'right': panelWidth + 25});
            $('#right-panel .mv-header .close').click(function(){
              $('#searchresults').css({'display':'none'});
            });
          }
        }
        if(mutations[0].target.classList[0] === "active" && mutations[1].target.classList[0] != "active"){
          if (mutations[1].target.id == 'right-panel' && mutations[0].target.id == 'bottom-panel') {
            // On ouvre right on ferme bottom
            var panelWidth = document.getElementById(mutations[1].target.id).offsetWidth;
            var panelHeight = document.getElementById(mutations[0].target.id).offsetHeight;
            opendivwidth=parseInt(panelWidth,10);
            decaleMap([opendivwidth/3*-1,opendivheight/3*-1]);
            $('#searchtool').animate({'right':panelWidth + 45});
            $('#parcelSelectors').animate({'right':panelWidth + 92});
            $('#zoomtoolbar').animate({'right':panelWidth +10});
            $('#toolstoolbar').animate({'right':panelWidth +10});
            $('#backgroundlayerstoolbar-default').animate({'right':panelWidth +10,'height':panelHeight +45});
            $('#searchresults').animate({'right': panelWidth + 25});
            $('#right-panel .mv-header .close').click(function(){
              $('#searchresults').css({'display':'none'});
            });
            $('.ol-attribution').animate({'height':panelHeight +35});
            $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
            $('.ol-scale-line').animate({'height':panelHeight +20});
            $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
          }
          if (mutations[1].target.id == 'bottom-panel' && mutations[0].target.id == 'right-panel') {
            // On ferme bottom on ouvre right
            var panelHeight = document.getElementById(mutations[1].target.id).offsetHeight;
            var panelWidth = document.getElementById(mutations[0].target.id).offsetWidth;
            opendivwidth=parseInt(panelWidth,10);
            decaleMap([opendivwidth/3,opendivheight/3]);
            $('#backgroundlayerstoolbar-default').animate({'height':panelHeight +45,'right':panelWidth +10});
            $('.ol-attribution').animate({'height':panelHeight +35});
            $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
            $('.ol-scale-line').animate({'height':panelHeight +20});
            $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
            $('#searchtool').animate({'right':panelWidth + 45});
            $('#parcelSelectors').animate({'right':panelWidth + 92});
            $('#zoomtoolbar').animate({'right':panelWidth +10});
            $('#toolstoolbar').animate({'right':panelWidth +10});
            $('#searchresults').animate({'right': panelWidth + 25});
            $('#right-panel .mv-header .close').click(function(){
              $('#searchresults').css({'display':'none'});
            });
          }
        }
        if (mutations[0].target.classList[0] != "active" && mutations[1].target.classList[0] != "active") {
          $('#searchtool').animate({'right':'60px'});
          $('#parcelSelectors').animate({'right':'105px'});
          $('#zoomtoolbar').animate({'right':'10px'});
          $('#toolstoolbar').animate({'right':'10px'});
          $('#backgroundlayerstoolbar-default').animate({'right':'10px','height':'55px'});
          $('.ol-attribution').animate({'height':'30px'});
          $('.ol-scale-line').animate({'height':'15px'});
          $('.ol-attribution').css({"background-color":"rgba(255,255,255,0.7)"});
          $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0.7)"});
          decaleMap([opendivwidth/3 * -1 ,opendivheight/3]);
          opendivwidth = 0;
          opendivheight = 0;
        }
      }, 500);
    }
  }else{
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === "class") {
        var attributeValue = $(mutation.target).prop(mutation.attributeName);
        if(attributeValue === 'active'){
          setTimeout(function(){
            mutationId = $(mutation.target)[0].id;
            if(mutationId === "right-panel"){
              var panelWidth = document.getElementById(mutationId).offsetWidth;
              opendivwidth=parseInt(panelWidth,10);
              decaleMap([opendivwidth/3,0]);
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
              $('#backgroundlayerstoolbar-default').animate({'height':panelHeight +45});
              $('.ol-attribution').animate({'height':panelHeight +35});
              $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
              $('.ol-scale-line').animate({'height':panelHeight +20});
              $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
            }
          }, 500);
        }else{
          setTimeout(function(){
            mutationId = $(mutation.target)[0].id;
            if(mutationId === "right-panel"){
              var panelWidth = document.getElementById(mutationId).offsetWidth;
              decaleMap([opendivwidth/3 *-1,0]);
              $('#searchtool').animate({'right':panelWidth + 45});
              $('#parcelSelectors').animate({'right':panelWidth + 92});
              $('#zoomtoolbar').animate({'right':panelWidth +10});
              $('#toolstoolbar').animate({'right':panelWidth +10});
              $('#backgroundlayerstoolbar-default').animate({'right':panelWidth +10});
              $('#searchresults').animate({'right': panelWidth + 25});
              $('#right-panel .mv-header .close').click(function(){
                $('#searchresults').css({'display':'none'});
              });
              opendivwidth = 0;
            }
            if(mutationId === "bottom-panel"){
              var panelHeight = document.getElementById(mutationId).offsetHeight;
              decaleMap([0,opendivheight/3]);
              $('#backgroundlayerstoolbar-default').animate({'height':panelHeight +45});
              $('.ol-attribution').animate({'height':panelHeight +35});
              $('.ol-attribution').css({"background-color":"rgba(255,255,255,0)"});
              $('.ol-scale-line').animate({'height':panelHeight +20});
              $('.ol-scale-line').css({"background-color":"rgba(255,255,255,0)"});
              opendivheight = 0;
            }
          }, 500);
        }
      }
    });
  }
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

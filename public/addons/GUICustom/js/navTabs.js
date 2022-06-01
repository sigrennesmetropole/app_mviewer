confColors = configuration.getConfiguration().themes.theme[0].layer;
$(document).on('click', '#map', function (e) {


  setTimeout(function(){
    var navTabChilds = $('.nav-tabs')[0].childNodes;

    navTabChilds.forEach(function(child){
      confColors.forEach((confColor, i) => {

        if(mviewer.getLayer(child.getAttribute("data-layerid")).name === confColor.name){
          child.children[0].style.backgroundColor = confColor.tabColor;
        }

      });
    });
  }, 500);

 });

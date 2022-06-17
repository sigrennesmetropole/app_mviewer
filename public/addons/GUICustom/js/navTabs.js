confColors = configuration.getConfiguration().themes.theme; //[0].layer;
$(document).on('click', '#map', function (e) {

  setTimeout(function(){
    var navTabChilds = $('.nav-tabs')[0].childNodes;

    navTabChilds.forEach(function(child){

      confColors.forEach((themes, i) => {
        themes.layer.forEach((confColor, i) => {

          if(mviewer.getLayer(child.getAttribute("data-layerid")).name === confColor.name){

            if(child.className === 'active'){
              child.children[0].style.backgroundColor = confColor.tabColor || '#000000';
              child.children[0].children[0].style.color = '#ffffff';
            }else{
              child.children[0].style.backgroundColor = '#ffffff';
              child.children[0].children[0].style.color = '#000000';
              child.children[0].children[0].style.opacity = '0.55';
            }

            if(confColor.tabColor){
              child.children[0].children[0].style.color = confColor.tabColor;
            }

            if(child.className === 'active' && confColor.tabColor){
              child.children[0].children[0].style.color = '#ffffff';
            }

          }

        });

      });
    });
  }, 500);

 });

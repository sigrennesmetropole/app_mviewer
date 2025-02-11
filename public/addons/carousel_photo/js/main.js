  var carousel = (function() {

    // Fenetre de consultation des images (avec carousel)
    function _getpopupslide(idSlider, posSlide, sliderType = "img"){

        var premiernumSlide="";
        var codeHTML="";

        var aRecuperer=document.getElementById(idSlider).getElementsByClassName("slick-slide");
        var numPhoto=1;
        for (var i = 0, len = aRecuperer.length; i < len; i++ ) {
            if (aRecuperer.length == 1 || aRecuperer[i].getAttribute("role") && aRecuperer[i].getAttribute("role")=="tabpanel"){
                //let src = aRecuperer[i].querySelectorAll('img')[0].src;
                if(sliderType == "p"){
                  $(".carousel-inner").css("color", "inherited");
                  /*let blob = fetch(src).then(r => r.blob());
                  let objectURL = URL.createObjectURL(blob);
                  */
                  let datasource = aRecuperer[i].querySelectorAll('p');
                  codeHTML +="<div style='height: 100%;width:500px;'>";
                  /*if (blob) {codeHTML +="<a class='img_downld' href='"+ objectURL + "' download>Télécharger l'image</a>";}*/
                  // codeHTML +="<a class='img_downld' target='_blank' href='"+ src + "' download>Télécharger l'image</a>";
                  codeHTML +="<center style='height: 90%;'>"+ datasource[0].textContent +"</center>";
                  codeHTML +="</div>";
                  numPhoto++;
                }else{
                  let src = aRecuperer[i].querySelectorAll('img')[0].src;
                  /*let blob = fetch(src).then(r => r.blob());
                  let objectURL = URL.createObjectURL(blob);
                  */
                  let datasource = aRecuperer[i].querySelectorAll('img')[0].getAttribute('data-sources');
                  let credit = aRecuperer[i].querySelector('.text-credit').innerHTML;
                  codeHTML +="<div style='height: 100%;'>";
                  /*if (blob) {codeHTML +="<a class='img_downld' href='"+ objectURL + "' download>Télécharger l'image</a>";}*/
                  codeHTML +="<a class='img_downld' target='_blank' href='"+ src + "' download>Télécharger l'image</a>";
                  codeHTML +="<center style='height: 90%;'><img id='car_photo"+ numPhoto +"' class='car_photo' src='" + src + "'  data-sources='"+ datasource + "' />";
                  codeHTML +="<span class='text-credit car-text-credit'>" + credit + "</span></center>";
                  codeHTML +="</div>";
                  numPhoto++;
                }
            }
        }

        $("#car-slideauto")[0].innerHTML=codeHTML;

        $("#carousel-modal").on("hidden.bs.modal", function () {
            $('.slide-car').slick('unslick');
            if($('.modal-backdrop').length > 0){
                $('.modal-backdrop')[$('.modal-backdrop').length-1].remove();
            }
        });

        $("#carousel-modal").modal("toggle");

          $("#car-slideauto").ready(function(){
              setTimeout(function(){
                  $('.slide-car').slick({
                      dots:true,
                      arrows:true,
                      slidesToScroll:1,
                      slidesToShow: 1,
                      lazyLoad: 'ondemand',
                      centerMode:true,
                      initialSlide: posSlide });

               }, 180);
          });
    }

    // Instanciation carousel des fiches d'info
    function rmSlickPhotoCarousel(){
        $("div.slide-feature").each(function () {
            var l_photos=$(this).find(".slick-slide-image");
            var idElement = l_photos.context.attributes[0].value;
            var sliderType = $('#' + idElement).attr("class").split(/\s+/)[2];

            if (l_photos.length==1) {
                rmReplaceSliderWithOnePic($(this));
            } else {
                var carousel_cls = $( this ).attr('class').split(/\s+/)[1];
                if(sliderType === 'p'){
                  $('.'+carousel_cls).not('.slick-initialized').slick({
                      dots: true,
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      autoplay: false,
                      arrows : true,
                      centerMode: false,
                      variableWidth: true,
                      lazyLoad: 'ondemand',
                      infinite:false
                  });
                  $('.slick-slide').css({'width':'1.495%'});
                  if(screen.width <= '500'){
                    $('.slick-slide').css({'width':'1.065%'});
                  }
                  $('.inSliderPClass').css({'height':'100%'});
                  $('.thumbnail').css({'width':'250px'});
                  $('.slick-slide').css({'display':'none'});
                  $('.slick-current').css({'display':'block'});
                }else{
                  $('.'+carousel_cls).not('.slick-initialized').slick({
                      dots: true,
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      autoplay: true,
                      infinite: true,
                      arrows : true,
                      autoplaySpeed:2000,
                      centerMode: true,
                      variableWidth: true,
                      centerPadding: '60px',
                      lazyLoad: 'ondemand'
                  });
                }
            }
        });
    }

    function rmReplaceSliderWithOnePic(slider){
        slider.removeClass("slide-feature");
        slider.find(".thumbnail").each(function () {
            $(this).removeClass();
            $(this).addClass("picture slick-slide");
            $(this).show();
            $(this).append('<p class="labelPictureEnlarge rm-popup-label">Cliquez pour agrandir cette image</p>');
        });
    }


    // MAJ icone de couleur catégorie de projet
    function rmCategorieProjUrbain() {
        // utilisation de font awesome
        pj_tab=$("#p_categ > i");
        for (var cpt = 0, len_cpt = pj_tab.length; cpt < len_cpt; cpt++) {
            valeur = pj_tab[cpt].getAttribute("categorie");
            switch(valeur) {
            case "Espace public":
                pj_tab[cpt].classList.add('marker-categ-vert');
                break;
            case "Projet d'aménagement":
                pj_tab[cpt].classList.add('marker-categ-bleu');
                break;
            default:
                url="";
        }
        }
    }



    // initialisation des événements
    function _init(){
        var activeTabs;
        var oldTabs;


    const targetNode1 = document.getElementById("right-panel").getElementsByClassName("popup-content");
    const targetNode2 = document.getElementById("modal-panel").getElementsByClassName("popup-content");
    
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
            var l_tabs = $("h4.title-feature");
            activeTabs=[];
            for(var i= 0; i < l_tabs.length; i++){
                activeTabs.push(l_tabs[i].innerHTML);
            }
            if(!oldTabs || oldTabs.length==0 ||activeTabs.sort().join() != oldTabs.sort().join()){
                oldTabs =  [].concat(activeTabs);
                rmCategorieProjUrbain();
                rmSlickPhotoCarousel();
            }
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode1[0], config);
    observer.observe(targetNode2[0], config);



    
    }


    return {
        init:_init,
        getpopupslide:_getpopupslide
    }

})();
//This instruction is only necessary if init function is needed.
//Very important first parameter is customComponent id + '-componentLoaded',
//second parameter is init function to execute
//document.addEventListener('graph3d-componentLoaded', graph3d.init);
new CustomComponent("carousel", carousel.init());

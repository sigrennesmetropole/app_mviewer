$("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
     //$("#menu-toggle-2, .navbar-brand").click(function(e) {
     $(".menu-toggle").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
       mviewer.toggleMenu(true);

    });

     function initMenu() {
      $('#menu ul').hide();
      $('#menu ul').children('.current').parent().show();
      $('#menu li a').click(
        function() {
           // debut modif CT 04/02/2020
           var appliConf = rmOptionsManager.getApplicationConfiguration();
           // fin
          if ($("#wrapper").hasClass("toggled-2")) {
            mviewer.toggleMenu(true);
          }
          var checkElement = $(this).next();
          //Si l'élément suivant est une  liste (ul) et déja visible et que  l'élément est un sous-groupe on masque le menu cliqué
          if (($(this).parent().hasClass("level-2")) && (checkElement.is('ul')) && (checkElement.is(':visible'))) {
              $(checkElement).slideUp('normal');
              return false;
          }
          //Si l'élément suivant est une  liste (ul) et déja visible et que  l'élément n'est pas un sous-groupe --> ras
          if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
            //$('#menu ul:visible').slideUp('normal');
            // debut modif CT 04/02/2020
            var alwaysOpen = rmOptionsManager.getThemeConfiguration( $(checkElement).parent()[0].id ).alwaysOpen;
            if (alwaysOpen !== "true") {
              $(checkElement).slideUp('normal');
              $(this).closest("li").removeClass("opened");
            }
            // fin
            //$(this).closest("li").removeClass("opened");
            return false;
            }
          //Si l'élément suivant est une liste (ul) et pas visible --> Referme le menu visible et affiche le menu cliqué
          if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
            if (!$(this).parent().hasClass("level-2")) {
                // debut modif CT 22/01/2020 - l'option openMultipleTheme permet de déplier plusieurs thèmes dans le menu de couches
                if ( appliConf.openMultipleTheme !== 'true' ) {
                  $('#menu ul:visible').slideUp('normal');
                }
                //$('#menu ul:visible').slideUp('normal');
                // fin
            } else {
                //Si niveau 2 , on referme les autres niveaux 2
                $('#menu .level-2 ul:visible').slideUp('normal');
            }
            /*if (!$(this).parent().hasClass("level-2")) {
                $("#menu li").removeClass("opened");
            }*/
            checkElement.slideDown('normal');
            if (!$(this).parent().hasClass("level-2")) {
                $(this).closest("li").addClass("opened");
            }
            return false;
            }

          }
        );
      }

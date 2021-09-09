if(screen.width <= 767){
  var titre = $('#mv-navbar a.mv-title');
  if(titre.text().length > 22){
    titre.css({'cssText': 'font-size: 15px;max-width: 250px;top:-10px;position:relative;'});
    if(titre.text().length > 50){
      titre.css({'cssText': 'font-size: 10px;max-width: 250px;top:-10px;position:relative;'});
      if(titre.text().length > 80){
        //can add 156 characters on the map title
        titre.css({'cssText': 'font-size: 5px;max-width: 250px;top:-10px;position:relative;'});
      }
    }
  }
}

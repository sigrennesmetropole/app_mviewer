// textLength = 85;
if(screen.width <= 767){
  console.log($('#mv-navbar a.mv-title').text().length);
  if($('#mv-navbar a.mv-title').text().length > 22){
  // if(textLength > 22){
    $('#mv-navbar a.mv-title').css({'cssText': 'font-size: 15px;max-width: 250px;top:-10px;position:relative;'});
    if(textLength > 50){
      $('#mv-navbar a.mv-title').css({'cssText': 'font-size: 10px;max-width: 250px;top:-10px;position:relative;'});
      if(textLength > 80){
        //can add 156 characters on the map title
        $('#mv-navbar a.mv-title').css({'cssText': 'font-size: 5px;max-width: 250px;top:-10px;position:relative;'});
      }
    }
  }
}

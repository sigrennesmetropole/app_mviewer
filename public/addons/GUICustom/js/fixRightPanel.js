var $div = $("#right-panel");
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === "class") {
      var attributeValue = $(mutation.target).prop(mutation.attributeName);
      if(attributeValue === 'active'){
        setTimeout(function(){
          var toolbarWidth = $div.outerWidth() + 5;
          var searchToolBar = toolbarWidth + 45;
          var searchToolBar2 = toolbarWidth + 92;
          var searchResultBar = toolbarWidth + 25;
          $('#searchtool').animate({'right':searchToolBar});
          $('#parcelSelectors').animate({'right':searchToolBar2});
          $('#zoomtoolbar').animate({'right':toolbarWidth});
          $('#toolstoolbar').animate({'right':toolbarWidth});
          $('#backgroundlayerstoolbar-default').animate({'right':toolbarWidth});
          $('#searchresults').animate({'right': searchResultBar});
          $('#right-panel .mv-header .close').click(function(){
            $('#searchresults').css({'display':'none'});
          })
        }, 500);
      }else{
        $('#searchtool').animate({'right':'60px'});
        $('#parcelSelectors').animate({'right':'105px'});
        $('#zoomtoolbar').animate({'right':'10px'});
        $('#toolstoolbar').animate({'right':'10px'});
        $('#backgroundlayerstoolbar-default').animate({'right':'10px'});
      }
    }
  });
});
observer.observe($div[0], {
  attributes: true
});

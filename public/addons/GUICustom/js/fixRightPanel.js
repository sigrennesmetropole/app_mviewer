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
          toolbarWidth = toolbarWidth + 'px';
          searchToolBar = searchToolBar + 'px';
          $('#searchtool').animate({'right':searchToolBar});
          $('#parcelSelectors').animate({'right':searchToolBar2});
          $('#zoomtoolbar').animate({'right':toolbarWidth});
          $('#toolstoolbar').animate({'right':toolbarWidth});
          $('#backgroundlayerstoolbar-default').animate({'right':toolbarWidth});
        }, 1000);
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

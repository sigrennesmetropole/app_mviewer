var $div = $("#right-panel");
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === "class") {
      var attributeValue = $(mutation.target).prop(mutation.attributeName);
      if(attributeValue === 'active'){
        $('#searchtool').animate({'right':'400px'});
        $('#parcelSelectors').animate({'right':'417px'});
        $('#zoomtoolbar').animate({'right':'325px'});
        $('#toolstoolbar').animate({'right':'325px'});
        $('#backgroundlayerstoolbar-default').animate({'right':'325px'});
      }else{
        $('#searchtool').animate({'right':'90px'});
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

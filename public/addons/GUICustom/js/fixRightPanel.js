var $div = $("#right-panel");
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.attributeName === "class") {
      var attributeValue = $(mutation.target).prop(mutation.attributeName);
      if(attributeValue === 'active'){
        $('#searchtool').css({'right':'360px'});
        $('#parcelSelectors').css({'right':'377px'});
      }else{
        $('#searchtool').css({'right':'90px'});
        $('#parcelSelectors').css({'right':'105px'});
      }
    }
  });
});
observer.observe($div[0], {
  attributes: true
});

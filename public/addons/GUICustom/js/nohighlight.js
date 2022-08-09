
var mapLayers = mviewer.getMap().getLayers().getArray();
for(var i= 0; i < mapLayers.length; i++)
{
    if(mapLayers[i].get('mviewerid') == 'selectoverlay' || mapLayers[i].get('mviewerid') == 'subselectoverlay'){
        mapLayers[i].setVisible(false);
    } 
}
    
    
_map.on('singleclick', function (evt) {
  setTimeout(function(){
    coordinate = evt.coordinate;
    mviewer.showLocation(mviewer.getProjection().getCode(), coordinate[0], coordinate[1], true);
  },250);
});


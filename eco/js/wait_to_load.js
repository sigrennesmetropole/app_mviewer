const mv_url="https://mviewer.sig.rennesmetropole.fr/";

var urlParams = new URL(document.location).searchParams;
let next_url = mv_url;
    if (urlParams.size >0){
        next_url += "?" +urlParams.toString();
    }
document.getElementById("a_link").href=next_url;


document.getElementById("button_label").onclick = function() {
    var els = document.querySelectorAll('#mveco_modal>.modal-content');
    for (var i=0; i < els.length; i++) {
        els[i].setAttribute("clicked", "");
    }
    
    els = document.querySelectorAll('#mveco_modal>.loader');
    for (var i=0; i < els.length; i++) {
        els[i].setAttribute("visible", "");
    }
};

const mv_url="http://mviewer.sig.rennesmetropole.fr/";

var urlParams = new URL(document.location).searchParams;


document.getElementById("button_label").onclick = function() {
    let next_url = mv_url;
    if (urlParams.size >0){
        next_url += "?" +urlParams.toString();
    }
    document.getElementById("a_link").href=next_url;
};


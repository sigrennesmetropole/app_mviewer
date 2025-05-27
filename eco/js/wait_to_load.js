const mv_url="https://mviewer.sig.rennesmetropole.fr/";

var urlParams = new URL(document.location).searchParams;
let next_url = mv_url;
    if (urlParams.size >0){
        next_url += "?" +urlParams.toString();
    }
document.getElementById("a_link").href=next_url;


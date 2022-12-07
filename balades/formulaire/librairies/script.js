
document.getElementById('geojson').addEventListener('change', () => {
    const [file] = document.querySelector('#geojson').files;
    const reader = new FileReader();
    if (file) {
        reader.readAsText(file);
    }

    reader.addEventListener("load", () => {
        if (file.name.split('.').at(-1) == 'geojson') {
            conversionJSON(reader.result);
            document.getElementById('message').innerHTML = "";
        } else {
            document.getElementById('message').innerHTML = "Le fichier n'est pas sous le bon format GeoJSON.";
        }
    }, false);
});

function conversionJSON(objetTexte) {
    const objetJSON = JSON.parse(objetTexte);
    var objetConvertPoints = {
        "type": "FeatureCollection",
        "name": "points",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } },
        "features": []
    };
    var objetConvertLignes = {
        "type": "FeatureCollection",
        "name": "balades",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::3857" } },
        "features": []
    };

    objetJSON.features.forEach(feature => {
        if (feature.geometry.type == "Point") {
            feature.geometry.coordinates = convertCoordinates4326to3857(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
            feature.properties.id = parseInt(feature.properties.id);
            feature.properties.rang = parseInt(feature.properties.rang);
            feature.properties.idbalade = parseInt(feature.properties.idbalade);
            objetConvertPoints.features.push(feature);
        } else if (feature.geometry.type == "LineString") {
            feature.geometry.coordinates = feature.geometry.coordinates.map(coordinate => convertCoordinates4326to3857(coordinate[0], coordinate[1]));
            feature.properties.id = parseInt(feature.properties.id);
            objetConvertLignes.features.push(feature);
        }

    });
    console.log(objetConvertPoints);
    console.log(objetConvertLignes);

    // var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objetConvertPoints));
    // var dlAnchorElem = document.getElementById('downloadAnchorElem');
    // dlAnchorElem.setAttribute("href", dataStr);
    // dlAnchorElem.setAttribute("download", "points_test.json");
    // dlAnchorElem.click();
    // var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objetConvertLignes));
    // var dlAnchorElem = document.getElementById('downloadAnchorElem');
    // dlAnchorElem.setAttribute("href", dataStr);
    // dlAnchorElem.setAttribute("download", "balades_test.geojson");
    // dlAnchorElem.click();
}

function convertCoordinates4326to3857(lon, lat) {
    var x = (lon * 20037508.34) / 180;
    var y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
    y = (y * 20037508.34) / 180;
    return [x, y];
}

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-1.67, 48.11]),
        zoom: 12
    })
});
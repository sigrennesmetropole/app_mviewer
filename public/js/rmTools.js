var rmTools = (function() {

    /**
     * gather all layers informations from mviewer.getLayers and configuration file
     */
    var gatherLayersInformations = function () {

        var layersInformations = [];

        layers = mviewer.getLayers();

        for (const layer in layers) {

            configuration.getConfiguration().themes.theme.forEach(function (theme) {

                if (typeof theme.layer !== 'undefined') {

                    theme.layer.forEach(function (confLayer) {
                        var layerInformations = {};

                        if (layers[layer].layername === confLayer.id) {

                            layerInformations = Object.assign(layerInformations, layers[layer]);
                            layerInformations.id2 = layerInformations.id;
                            layerInformations = Object.assign(layerInformations, confLayer);
                            layersInformations.push(layerInformations);
                        }

                    });

                }

            });

        }
        return layersInformations;
    };

    var displayMessageModal = function (message) {

        $('body').append('<div id="messageModalContainer"></div>');

        var modal = '<div id="messageModal" class="modal-dialog">'
        + '<div class="modal-content">'
         + '<div class="modal-header">'
         +   '<span class="modalCloseBtn">&times;</span>'
         + '</div>'
         + '<div class="modal-body">'
         +   '<div>' + message + '</div>'
         + '</div> </div> </div>';

         $('#messageModalContainer').html(modal);

         $('#messageModal').css({ 'position': 'fixed', 'top': '10%', 'left': '20%', 'width': '50%', 'height': 'auto'});

         $('.modalCloseBtn').click(function () {
             $('#messageModalContainer').remove();
         });

    };

    var getVisibleLayers = function () {

        var visibleLayers = [];
        var layers = mviewer.getLayers();

        for (layer in layers ) {

            if (layers[layer].layer.state_.visible) {
                visibleLayers.push( layers[layer] );
            }

        }

        return visibleLayers;

    };

    // Function call to generate NRU PDF - API Urba
    function generatePDFNru(pdfUrl) {
        $('body').css('cursor','wait');
        $.get(pdfUrl, function(dataApi) {
            var blob = b64toBlob(dataApi.payload, dataApi.contenttype);
            saveAs(blob, dataApi.filename);
            $('body').css('cursor','auto');
        });
    };

    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);

            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };

    var getProjection = function () {
        return  mviewer.getProjection().getCode();
    };


    return {
        gatherLayersInformations: gatherLayersInformations,
        displayMessageModal: displayMessageModal,
        getVisibleLayers: getVisibleLayers,
        generatePDFNru: generatePDFNru,
        getProjection: getProjection
    }

})();

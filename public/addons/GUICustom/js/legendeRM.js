
$('#legend-modal').on('show.bs.modal', function (e) {
    if (configuration.getConfiguration().mobile) {
    $("#legend").addClass("active");
    //$("#legend .mv-layer-remove").hide();
    $("#layers-container-box-header").hide();
    }
})

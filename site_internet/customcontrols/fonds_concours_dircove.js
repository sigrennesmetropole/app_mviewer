// Modifier fonds_concours_dircove par l'id de votre couche

mviewer.customControls.fonds_concours_dircove = (function () {

    const _idlayer = "fonds_concours_dircove";
    const _layer = mviewer.getLayer(_idlayer);

    let noFilterLabel = "All";
    let logicalOperator = "AND";

    return {

        init: function () {

            const _html = [];
            let filters = [];

            if (_layer.ccfilters && _layer.ccfilters.filter) {

                if (!Array.isArray(_layer.ccfilters.filter)) {
                    _layer.ccfilters.filter = [_layer.ccfilters.filter];
                }

                if (_layer.ccfilters.logicaloperator) {
                    logicalOperator = _layer.ccfilters.logicaloperator;
                }

                if (_layer.ccfilters.nofilterlabel) {
                    noFilterLabel = _layer.ccfilters.nofilterlabel;
                }

                filters = _layer.ccfilters.filter.map(function (f) {
                    return {
                        label: f.label,
                        field: f.field,
                        values: f.values.split(","),
                        multiple: (f.multiselection && f.multiselection === "true")
                    };
                });

            } else {
                console.log(`ccfilters manquant pour ${_idlayer}`);
            }

            // Création HTML filtres
            filters.forEach(function (f) {

                const options = [];

                if (!f.multiple) {
                    options.push(`<option>${noFilterLabel}</option>`);
                }

                f.values.forEach(function (v) {
                    options.push(`<option>${v.trim()}</option>`);
                });

                _html.push(`
                    <div class="form-group">

                        <label for="${_idlayer}-${f.field}">
                            ${f.label} :
                        </label>

                        <div class="col-md-10 col-md-offset-1">

                            <select
                                ${f.multiple ? "multiple" : ""}
                                id="${_idlayer}-${f.field}"
                                data-source="${f.field}"
                                class="form-control cql-filter"
                                onchange="mviewer.customControls.${_idlayer}.filter(this);">

                                ${options.join("")}

                            </select>

                        </div>

                    </div>
                `);

            });

            // Bouton reset
            _html.push(`
                <div class="form-group text-center" style="margin-top:15px;">
                    <button
                        type="button"
                        class="btn btn-default"
                        onclick="mviewer.customControls.${_idlayer}.resetFilters();">
                        Réinitialiser les filtres
                    </button>
                </div>
            `);

            const container = document.querySelector(".cql-filter-list>style");

            if (container) {
                container.insertAdjacentHTML("afterend", _html.join("\n"));
            } else {
                document.querySelector(".cql-filter-list")
                    .insertAdjacentHTML("beforeend", _html.join("\n"));
            }
        },

        filter: function (element) {

            const _filter = [];

            element.closest(".cql-filter-list")
                .querySelectorAll(".cql-filter")
                .forEach(function (q) {

                    const values = Array.from(q.selectedOptions)
                        .map(o => o.value.trim())
                        .filter(v => v && v !== noFilterLabel);

                    if (values.length === 1) {

                        _filter.push(
                            `${q.dataset.source} = '${values[0].replace(/'/g, "''")}'`
                        );

                    } else if (values.length > 1) {

                        const list = values.map(v =>
                            `'${v.replace(/'/g, "''")}'`
                        );

                        _filter.push(
                            `${q.dataset.source} IN (${list.join(",")})`
                        );
                    }

                });

            const layer = _layer.layer;
            const source = layer.getSource();
            const params = source.getParams();

            params.t = Date.now();

            if (_filter.length > 0) {
                params.CQL_FILTER = _filter.join(` ${logicalOperator} `);
            } else {
                delete params.CQL_FILTER;
            }

            source.updateParams(params);
            source.changed();
        },

        resetFilters: function () {

            const container = document.querySelector(".cql-filter-list");
            if (!container) return;

            container.querySelectorAll("select.cql-filter").forEach(select => {

                if (select.multiple) {

                    Array.from(select.options).forEach(opt => {
                        opt.selected = false;
                    });

                } else {
                    select.selectedIndex = 0;
                }

                // IMPORTANT : déclenche filter()
                select.dispatchEvent(new Event("change", { bubbles: true }));

            });

            console.log("Reset filtres OK");
        },

        destroy: function () {}

    };

})();
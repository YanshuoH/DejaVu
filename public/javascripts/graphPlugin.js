if (document.querySelector('#graph-canvas')) {
    loadGraphData();
}

function loadGraphData() {
    var path = window.location.pathname.split('/');
    path[path.length-1] = 'graphJson';
    path = path.join('/');
    $.getJSON(path, function(data) {
        if (data.status == 1) {
            $.getJSON('/queries/' + data.query_id + '/json', function(queryObj) {
                displayStriped(queryObj, false);
            });
        }
        else {
            displayStriped({}, true);
        }
        // var settings = new sigma.classes.configurable();
        var sig = new sigma({
            graph: data.data,
            container: 'graph-canvas',
            settings: {
                // drawLabels: false,
                // defaultLabelSize: 1,
                defaultNodeColor: '#ec5148'
            }
        });
        sig.bind('overNode', function(e) {
            e.data.node.label = e.data.node.content;
        });
        sig.bind('outNode', function(e) {
            e.data.node.label = '';
        });
    });
}

if ($('#graph-export-btn')) {
    $('#graph-export-btn').on('click', exportGraph);
}

function exportGraph(event) {
    html2canvas($("#graph-canvas"), {
        onrendered: function(canvas) {
            theCanvas = canvas;
            // document.body.appendChild(canvas);
            var dataUrl = canvas.toDataURL();
            window.open(dataUrl, "toDataURL() image", "height=550");
        }
    });
}

// function displayStriped(queryObj, finished) {
//     var content = '';
//     if (!finished) {
//         var until = new Date(queryObj.end_date).setHours(new Date(queryObj.end_date).getHours(), new Date(queryObj.end_date).getMinutes() + 5);
//         var until = new Date(until);
//         content += '<div class="alert alert-info">Still in process until ' + until + '</div>';
//         content += '<div class="progress progress-striped active">';
//         content += '<div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">';
//         content += '<span class="sr-only">45% Complete</span>';
//         content += '</div></div>';
//     }
//     else {
//         content += '<div class="alert alert-info"> - Finished - </div>';
//     }
//     $('.info-box').html(content);
// }
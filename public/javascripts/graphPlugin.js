if (document.querySelector('#graph-canvas')) {
    loadGraphData();
    displayTimeline();
}

// Select a timeline
$(document.body).on('click', '.timeline-button', function() {
    var current_id = $(this).attr('id').split('-');
    current_id = current_id[current_id.length - 1];

    var buttons = $(document.querySelector('.timeline-buttons')).children();
    for (var index=0; index<buttons.length; index++) {
        // Release first
        $(buttons[index]).removeClass('active');
        var button_id = $(buttons[index]).attr('id').split('-');
        button_id = button_id[button_id.length - 1];
        if (button_id <= current_id) {
            $(buttons[index]).addClass('active');
        }
    }
    loadGraphData(current_id);
});


function displayTimeline() {
    var path = getJsonPath(false);
    $.getJSON(path, function(data) {
        var content = '<div class="timeline-buttons btn-group">';
        for (var index=0; index<data.results.length; index++) {
            if (index > 0
                && (new Date(data.results[index].calculat_time).getTime() - new Date(data.results[index - 1].calculat_time).getTime()) < 1000 * 60
                && index !== data.results.length
                && data.results[index].groups.length == 0
                ) {
                continue;
            }
            content+= '<button type="button" id="timeline-button-' + index + '" class="btn btn-default timeline-button" value="' + data.results[index].calculat_time + '">' + data.results[index].calculat_time + '</button>';
        }
        content += '</div><hr>';
        $('#timeline').html(content);
    });
}

function getJsonPath(isGraph) {
    var path = window.location.pathname.split('/');
    if (isGraph) {
        path[path.length-1] = 'graphJson';
    }
    else {
        path[path.length-1] = 'json';
    }
    path = path.join('/');
    return path;
}

function loadGraphData(timeline) {
    path = getJsonPath(true);
    path += '?timelineid=' + timeline;
    $('#graph-canvas').empty()
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
        sig.refresh();
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
$(document).ready(function() {
    /* date pickers in query form */
    $('.input-date').datetimepicker();

    $('#start_date').on('change', function() {
        $('#end_date').val($(this).val());
    });
    $('#add-event').on('click', addEventInput);
});

$(document.body).on('click', '#remove-event', function(){
    $(this).parents('.form-group').remove();
});
$(document.body).on('change', '.input-event', displayDashboard);
$(document.body).on('change', '#input-frame-number', displayFramesCheck);
$(document.body).on('click', '#remove-event', displayDashboard);
$(document.body).on('click', '#btnRun', displayStriped);
$(document.body).on('click', '.switch-left, .switch-right', streamingManager);

var refreshIntervalId;
if (document.querySelector('#streaming-info')) {
    streamingInfo();
    refreshIntervalId = setInterval(streamingInfo, 45*1000);
    //streamingInfo();
} else {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
    }
}
// if (document.querySelector('#streaming-switch')) {
//     streamingStatus();
// }

function displayFramesCheck(event) {
    var end_date;
    var start_date;
    var n;
    var dt;
    var content = '';
    if ($('#end_date').val()) {
        end_date = $('#end_date').val();
    }
    if ($('#start_date').val()) {
        start_date = $('#start_date').val()
    }
    if ($('#input-frame-number').val()) {
        n = $('#input-frame-number').val();
    }
    if ($('#dt').val()) {
        dt = $('#dt').val();
    }
    if (start_date && end_date && n) {
        var steptime = (new Date(end_date).getTime() - new Date(start_date).getTime())/ n;
        content += '<h4>Frame check</h4>';
        content += '<div class="well well-sm">';
        content += '<ul>';
        content += '<li> δt: ' + dt + '</li>';
        content += '<li> Step Time: ' + steptime + '</li>';
        content += '</ul>';
        if (steptime <= dt) {
            content += '<b>Number of frames too large</b>';
        }
        else {
            content += '<b>Number of frames: OK</b>';
        }
        content += '</div>';
        $('.check-frames').html(content);
    }

}

function displayDashboard(event) {
    var event_input = makeEventQuery();
    var event_count = event_input.length;
    if (event_count > 140) {
        var message = '<div class="alert alert-danger">Maximum query charactor 140.</div>';
        $('.event-message').html(message);
    }
    else {
        $('.event-message').empty();
    }
    var content = '<label for="event-output">Events Query:</label><div id="add-dashboard" class="well well-sm">' + event_input + '</div>';
    var event_count = '<label for="event-count">Count.</label><div id="event-count" class="well well-sm">' + event_count + '</div>';
    $('.event-output').html(content);
    $('.event-count').html(event_count);
}

function displayStriped(event) {
    event.preventDefault();
    var event_input = makeEventQuery();
    // event_input = event_input.split(' ');
    // console.log(event_input);
    // for (var index=0; index<event_input.length; index++) {
    //     if (event_input[index] === 'RT') {
    //         event_input[index] = 'RT OR';
    //     }
    // }
    // event_input = event_input.join(' ');
    // console.log(event_input);
    var input_elem = $("<input />")
        .attr("type", "hidden")
        .attr("name", "events")
        .attr("value", event_input)
        .appendTo('#query-form');
    $('#query-form').submit();
}


function makeEventQuery() {
    var inputs = [];
    var inputGroups = $('.input-event').children('.input-group');
    inputGroups.each(function() {
        var input = ''
        input += $(this).children().children('#content-operator').val();
        if ($(this).children().children('#retweet').is(':checked')) {
            input += 'RT ';
        }
        input += $(this).children().children('#type-event').val();
        input += $(this).children().children('#content-event').val();
        inputs.push(input);
    });
    var inputs_sort = [];
    var inputs_and = [];
    for (var i=0; i<4; i++) {
        for (var index=0; index<inputs.length; index++) {
            if (i === 0 && inputs[index].substring(0,2) === "OR") {
                inputs_sort.push(inputs[index]);
            }
            else if (i === 1 && inputs[index][0] === "-") {
                inputs_sort.push(inputs[index]);
            }
            else if (i === 2 && inputs[index].substring(0,2) !== "OR" && inputs[index][0] !== "-") {
                inputs_sort.unshift(inputs[index]);
                inputs_and.push(inputs[index]);
            }
        }
    }
    if (inputs_and.length > 0) {
        for (var index=0; index<inputs_and.length; index++) {
            inputs_sort[index] = inputs_and[index];
        }
    }
    var event_input = inputs_sort.join(' ');
    if (event_input.substring(0,2) === "OR") {
        event_input = event_input.substring(3);
    }
    return event_input.trim();
}


function addEventInput(event) {
    event.preventDefault();
    var content = '<div class="row">';
    content = '<div class="form-group input-event">';
    content += '<div class="input-group">';
    // content += '<div class="input-group-addon">';
    content += '<div class="col-md-2">';
    content += retweetCheckbox;
    content += '</div>';
    content += '<div class="col-md-2">';
    content += operatorSelect;
    content += '</div>';
    content += '<div class="col-md-2">';
    content += typeSelect;
    content += '</div>';
    // content += '</div>';
    content += '<div class="col-md-4">';
    content += '<input id="content-event" type="text" name="event_name" placeholder="Event" class="form-control">';
    content += '</div>';
    content += '<div class="col-lg-1">';
    content += '<button type="button" class="btn btn-danger btn-sm" id="remove-event">Remove</button>';
    // content += '<span><a href="#" class="glyphicon glyphicon-minus-sign red" id="remove-event"></a></span>';
    content += '</div>';
    content += '</div>';
    content += '</div></div>';
    // content += '<hr>'
    if (document.querySelector('.input-event')) {
        var input_events = $('.input-event');
        if (input_events.length === 1) {
            input_events.after(content);
        }
        else {
            input_events.last().after(content);
        }
    }
    else {
        $('#adding-space').after(content);
    }
}


function removeEventInput(event) {
    event.preventDefault();

}
var retweetCheckbox = '<label>RT:&nbsp;&nbsp;&nbsp;</label><input id="retweet" type="checkbox" name="rt" value="RT">';
var operatorSelect = '<select id="content-operator" type="select" name="operator" class="btn btn-default dropdown-toggle"><option value="">Operator</option><option value=""></option><option value="">AND</option><option value="OR ">OR</option><option value="-">EXCLU</option></select>';
var typeSelect = '';
    typeSelect += '<select type="select" id="type-event" name="event_type" data-toggle="dropdown" class="btn btn-default dropdown-toggle">';
    typeSelect += '<option value="">Type</option>';
    typeSelect += '<option value=""></option>';
    typeSelect += '<option value="@">@</option>';
    typeSelect += '<option value="#">#</option>';
    //content += '<option value="retweet">RT</option>';
    typeSelect += '</select>';


// function streamingStatus() {
//     $('#streaming-switch').bootstrapSwitch();
//     $.getJSON('/streaming/status', function(data) {
//         if (data.status === 0) {
//             $('.switch-animate').attr('class', 'has-switch switch-animate switch-off');
//         }
//         else if (data.status === 1) {
//             $('.switch-animate').attr('class', 'has-switch switch-animate switch-on');
//         }
//     });
// }

var lastOpt;
function streamingManager(event) {
    event.preventDefault();
    var opt_ok = false;
    // console.log(lastOpt);
    if (lastOpt) {
        if (new Date() - lastOpt < 5*1000) {
            opt_ok = false;
        }
        else {
            opt_ok = true;
        }
    }
    else {
        opt_ok = true;
    }
    if (opt_ok) {
        lastOpt = new Date();
        var switchStatus = $(document.querySelector('.switch-animate')).attr('class');
        if (switchStatus.indexOf('switch-on') > -1) {
            $.getJSON('/streaming/run', function(data) {
                $('#streaming-message').html(data.message);
            });
        }
        else if (switchStatus.indexOf('switch-off') > -1) {
            $.getJSON('/streaming/stop', function(data) {
                $('#streaming-message').html(data.message);
            });
        };
    }
    else {
        streamingInfo();
        var content = '<div class="alert alert-warning alert-dismissable">';
        content += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
        content += '<strong>Warning!</strong> Please slow down your operation, the system needs time to shut down the Streaming API(5s). Thanks!';
        content += '</div>';
        $('#streaming-info-box').html(content);
    }
    // streamingInfo();
}

if (document.querySelector('#streaming-switch')) {
    $('#streaming-switch').bootstrapSwitch();
}
function streamingInfo() {
    // $('#streaming-switch').bootstrapSwitch();
    // console.log('streaming info');
    var content = '';
    $.getJSON('/streaming/info', function(data) {
        if (data.status === 0) {
            $('.switch-animate').attr('class', 'has-switch switch-animate switch-off');
        }
        else if (data.status === 1) {
            $('.switch-animate').attr('class', 'has-switch switch-animate switch-on');
        }

        content += '<ul>';
        content += '<li>Number of Users : ' + data.info.user_count + '</li>';
        content += '<li>Size Storage of Users : ' + data.info.user_size + 'M</li>';
        content += '<li>Number of Tweets : ' + data.info.tweet_count + '</li>';
        content += '<li>Size Storage of Tweets : ' + data.info.tweet_size + 'M</li>';
        content +='</ul>';
        $('#streaming-info').html(content);
    });
}


var streaming_strip = '<div class="progress progress-striped"><div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span class="sr-only">20% Complete</span></div></div>';
$(document.body).on('click', '#export-streaming button', streamingExport);
function streamingExport() {
    var show_progress = streaming_strip;
    show_progress += '<div><b>Making files...<b></div>';
    $('#export-streaming').html(show_progress);
    $.getJSON('/streaming/export', function(data) {
        if (data.status === 1) {
            var content = '';
            content += '<a href="/tmp/users.json" class="btn btn-success">Users.json</a>';
            content += '<a href="/tmp/tweets.json" class="btn btn-success">Tweets.json</a>';
            $('#export-streaming').html(content);
        }
    });
}


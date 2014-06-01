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
$(document.body).on('click', '#remove-event', displayDashboard);
$(document.body).on('click', '#btnRun', displayStriped);
$(document.body).on('click', '.switch-left, .switch-right, #streaming-status, .has-switch', streamingManager);


if (document.querySelector('#streaming-info')) {
    streamingInfo();
}
if (document.querySelector('#streaming-switch')) {
    streamingStatus();
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
    inputs_sort = []
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
            }
        }
    }
    var event_input = inputs_sort.join(' ');
    if (event_input.substring(0,2) === "OR") {
        event_input = event_input.substring(3);
    }
    return event_input;
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


    $('#adding-space').after(content);
}


function removeEventInput(event) {
    event.preventDefault();

}
var retweetCheckbox = '<label>RT:&nbsp;&nbsp;&nbsp;</label><input id="retweet" type="checkbox" name="rt" value="RT">';
var operatorSelect = '<select id="content-operator" type="select" name="operator" class="btn btn-default dropdown-toggle"><option value="">Operator</option><option value="">AND</option><option value="OR ">OR</option></select>';
var typeSelect = '';
    typeSelect += '<select type="select" id="type-event" name="event_type" data-toggle="dropdown" class="btn btn-default dropdown-toggle">';
    typeSelect += '<option value="">Type</option>';
    typeSelect += '<option value="@">@</option>';
    typeSelect += '<option value="#">#</option>';
    //content += '<option value="retweet">RT</option>';
    typeSelect += '</select>';


function streamingStatus() {
    $('#streaming-switch').bootstrapSwitch();
    $.getJSON('/streaming/status', function(data) {
        if (data.status === 0) {
            $('.switch-animate').attr('class', 'has-switch switch-animate switch-off');
        }
        else if (data.status === 1) {
            $('.switch-animate').attr('class', 'has-switch switch-animate switch-on');
        }
    });
}

function streamingManager(event) {
    event.preventDefault();

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

function streamingInfo() {
    var content = '';
    $.getJSON('/streaming/info', function(data) {
        content += '<ul>';
        content += '<li>Number of Users : ' + data.info.user_count + '</li>';
        content += '<li>Size Storage of Users : ' + data.info.user_size + 'M</li>';
        content += '<li>Number of Tweets : ' + data.info.tweet_count + '</li>';
        content += '<li>Size Storage of Tweets : ' + data.info.tweet_size + 'M</li>';
        content +='</ul>';
        $('#streaming-info').html(content);
    });
}
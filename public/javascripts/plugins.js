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


function displayDashboard(event) {
    var event_input = makeEventQuery();
    var content = '<label for="event-output">Events Query:</label><div id="add-dashboard" class="well well-sm">' + event_input + '</div>';
    $('.event-output').html(content);
}

function displayStriped(event) {
    event.preventDefault();
    var event_input = makeEventQuery();
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
        input += $(this).children('#content-operator').val();
        input += $(this).children('#type-event').val();
        input += $(this).children('#content-event').val();
        inputs.push(input);
    });
    inputs_sort = []
    for (var i=0; i<3; i++) {
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
    var content = '<div class="form-group input-event">';
    content += '<div class="input-group">';
    // content += '<div class="input-group-addon">';
    content += '<select type="select" id="type-event" name="event_type" data-toggle="dropdown" class="btn btn-default dropdown-toggle">';
    content += '<option value="">Type</option>';
    content += '<option value="@">@</option>';
    content += '<option value="#">#</option>';
    //content += '<option value="retweet">RT</option>';
    content += '</select>';
    // content += '</div>';
    content += operatorSelect;
    content += '<span><a href="#" class="glyphicon glyphicon-minus-sign red" id="remove-event"></a></span>';
    content += '<input id="content-event" type="text" name="event_name" placeholder="Event" class="form-control">';
    content += '</div></div>';
    // content += '<hr>'


    $('#adding-space').after(content);
}


function removeEventInput(event) {
    event.preventDefault();
    console.log('oyeah==========');

}

var operatorSelect = '<select id="content-operator" type="select" name="operator" class="btn btn-default dropdown-toggle"><option value="">Operator</option><option value="">AND</option><option value="OR ">OR</option><option value="-">EXCLUE</option></select>';

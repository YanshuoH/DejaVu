$(document).ready(function() {
    /* date pickers in query form */
    $('.input-date').datepicker();

    $('#start_date').on('change', function() {
        $('#end_date').val($(this).val());
    });
    $('#query-form').submit(displayStriped);
});

function displayStriped(event) {
    event.preventDefault();
    var content = '';
    content += '<div class="alert alert-info">In process, please wait a few secondes...</div>';
    content += '<div class="progress progress-striped active">';
    content += '<div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">';
    content += '<span class="sr-only">45% Complete</span>';
    content += '</div></div>';
    $('.main-head').html(content);
}
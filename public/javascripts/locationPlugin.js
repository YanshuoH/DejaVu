
$(function() {
    initialize();
    $("#address").autocomplete({
        source: function(request, response) {
            geocoder.geocode( {'address': request.term }, function(results, status) {
                response($.map(results, function(item) {
                    return {
                        label: item.formatted_address,
                        value: item.formatted_address,
                    }
                }));
            })
        },
        select: function (event, ui){
            var address = ui.item.value;
            geocoder.geocode( {'address': address }, function(results, status) {
                $("#geocode").val(results[0].geometry.location);
            })
        },
        // Cache the shitty result messages
        messages: {
            noResults: '',
            results: function() {}
        }
    });
});

var geocoder;

function initialize(){
    geocoder = new google.maps.Geocoder();
}

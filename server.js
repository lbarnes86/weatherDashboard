(function ($) {
    "use strict";
    $(document).ready(function () {
        var appid = "96404ebac51d984e233fe3941651e4ab";
        var weatherKey = "weatherHistory";

        $("#srchButton").click(function (index, element) {
            var query = $("#cityInput").val().trim();
            OnSearch(query);
        });
        $("ul.cities").on("click", "li", function () {
            var query = $(this).html();
            OnSearch(query);
        });
        $("#cityInput").keypress(function (event) {
            if (event.which == 13) {

                var query = $("#cityInput").val().trim();
                OnSearch(query);
            }
        });
        function updateSearchHistory() {
            var cities = storageService.getHistory();

            $("ul.cities").empty();

            cities.reverse().forEach((city, index) => {
                $("ul.cities").append(`<li class="city-history list-group-item">${city.Name}</li>`);
            });

            
        }

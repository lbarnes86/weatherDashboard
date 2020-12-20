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

        function uviCalc(value) {
            var decorator = '';

            if (value >= 0 && value < 3) {
                
                decorator = 'bg-success';
            } else if (value >= 3 && value < 5) {
                
                decorator = 'bg-warning';
            } else if (value >= 5 && value < 7) {
                
                decorator = 'bg-dark';
            } else if (value >= 7 && value < 11) {
                
                decorator = 'bg-danger';
            } else if (value >= 11) {
                
                decorator = 'bg-light';
            }
            return decorator;
        };
        function updateWeatherInfoView(weatherInfo) {
            var icon_href = `https://openweathermap.org/img/wn/${weatherInfo.current.weather[0].icon}@2x.png`;

            $("#icon").attr("src", icon_href)
            $("#city").html(weatherInfo.current.name);
            $("#date").html(moment().format('MM/DD/YYYY'));
            $("#temp").html(weatherInfo.forecast.current.temp);
            $("#humidity").html(weatherInfo.forecast.current.humidity);
            $("#windSpeed").html(weatherInfo.forecast.current.wind_speed);
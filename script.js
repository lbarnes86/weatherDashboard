(function ($) {
    "use strict";
    $(document).ready(function () {
        var appid = "ef34ba3ab0a5fd5e48614afa8d90459e";
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
            $("#windSpeed").html(weatherInfo.forecast.current.wind_speed);
            $("#humidity").html(weatherInfo.forecast.current.humidity);

            $("#uvIndex").html(weatherInfo.forecast.current.uvi);
            $("#uvIndex").removeClass('bg-success bg-warning bg-dark bg-danger bg-light');
            var indexClass = uviCalc(weatherInfo.forecast.current.uvi);
            $("#uvIndex").addClass(indexClass);

            $(".forecast").html('');
            weatherInfo.forecast.daily.forEach( (daily, index) => {
             
                if (index > 4)
                    return;

                var html = htmlTemplate(moment().add('days', index + 1).format('MM/DD/YYYY'), daily.weather[0].icon, daily.weather[0].description, daily.temp.day, daily.humidity);

                $(".forecast").append(html);

            });
        }

        function htmlTemplate(date, icon, description, temp, humidity) {
            //`` allows me to accomplish javascript string interpolation
            var template = `
            <div class="card text-white bg-primary my-2" style="min-width: 11rem; max-width: 11rem;">
                    <div class="card-body">
                        <h5 class="card-title">${date}</h5>
                        <p class="card-text"><img src="https://openweathermap.org/img/wn/${icon}@2x.png"></p>
                        <p class="card-text"><span>${description}</span></p>
                        <p class="card-text">Temp: <span>${temp}</span>&nbsp;&deg;F</p>
                        <p class="card-text">Humidity: <span>${humidity}</span>&nbsp;%</p>
                    </div>
                </div>
            `;

            return template;

        }

        function addCityToHistory(city) {
            var history = getHistory() ?? [];

            if (history.filter(e => e.Id == city.Id && e.Name == city.Name).length == 0) {

                //Add new city to object array
                history.push(city);

                //update local storage with new array
                localStorage.setItem(weatherKey, JSON.stringify(history));
            }
        }
        function getHistory() {
            var history = JSON.parse(localStorage.getItem(weatherKey));

            if (!history) {
                history = [];
            }

            return history;
        }

        function getLastCity() {
            var cities = getHistory();
            return cities[cities.length - 1];
        }

        var storageService = {
            saveToHistory: addCityToHistory,
            getHistory: getHistory,
            getLastCity: getLastCity
        }
        var weatherService = {
            getCurrentWeatherInfo: getCurrentWeatherInfo,
            getCurrentUVInfo: getCurrentUVInfo,
            get5DayWeatherForecast: get5DayWeatherForecast
        }

        function OnLoad() {
          
            updateSearchHistory();


            var lastCity = storageService.getLastCity();

            if (lastCity) {
                $('.results').removeClass("d-none");
                OnSearch(lastCity.Name);
            }

        }
        function OnSearch(query) {
            if (!query) {
                alert('Please enter a valid city!');
                return;
            }

            getCurrentWeatherWithForecast(query);
        }

        function getCurrentWeatherWithForecast(query) {
            weatherService.getCurrentWeatherInfo(query, function (weatherResponse) {

                var weatherInfo = weatherResponse;

                if (weatherInfo.cod !== 200) {
                    alert(weatherInfo.messsage);
                    return;
                }

                weatherService.get5DayWeatherForecast(weatherInfo.coord.lat, weatherInfo.coord.lon, function (forecastResponse) {
                    var forecastInfo = forecastResponse;

                    var weather = {
                        current: weatherInfo,
                        forecast: forecastInfo
                    }
                    storageService.saveToHistory(
                        {
                            Id: weather.current.id,
                            Name: weather.current.name
                        }
                    );

                    
                    updateSearchHistory();

                    
                    updateWeatherInfoView(weather);

                    $('.results').removeClass("d-none");
                }, function (error) {
                    alert('Unable to get forecast information for: ', query);
                });
            }, function (error) {
                alert('Unable to get weather information for: ', query);
            });
        }

        function getCurrentWeatherInfo(query, success, error) {
            
            var url = `https://api.openweathermap.org/data/2.5/weather?appid=${appid}&q=${query}`;

            return apiConnect(url, success, error);
        }
        function getCurrentUVInfo(lat, lon, success, error) {
           

            var url = `https://api.openweathermap.org/data/2.5/uvi?appid=${appid}&lat=${lat}&lon=${lon}`;

            return apiConnect(url, success, error);
        }
        function get5DayWeatherForecast(lat, lon, success, error) {
            

            var url = `https://api.openweathermap.org/data/2.5/onecall?appid=${appid}&exclude=hourly,minutely&units=imperial&lat=${lat}&lon=${lon}`;

            return apiConnect(url, success, error);
        }

        function apiConnect(endpoint, successCallback, errorCallback) {
            $.ajax(
                {
                    dataType: "json",
                    url: endpoint,
                    type: "GET",
                    success: function (data) {
                        

                        if (successCallback) {
                            successCallback(data);
                            }
                    },
                    error: function (error) {
                        

                        if (errorCallback) {
                            errorCallback(error);
                        }
                    }
                }
            );
        }
        OnLoad();

    });
})(window.jQuery);
// If the user's browser supports the service workers api then register a service worker
/* Uncomment this for PWA
if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        // Once the service worker is successfully registered use the .then promise function to log text to the console
        .then(reg => console.log('service worker registered'))
        // If there is an error registering the service worker use the .catch promise function to catch that error and log text to the console
        .catch(err => console.log('service worker not registered', err));
}
*/

window.addEventListener('load', () => {
    // Dom manipulation
    const temperatureDescription = document.querySelector('.temperature-description');
    const temperatureDegree = document.querySelector('.temperature-degree');
    const temperatureSection = document.querySelector('.temperature');
    const temperatureSpan = document.querySelector('.temperature span');
    const currentDate = document.querySelector('.current-date');
    const daily = document.querySelector('.day');
    const hourly = document.querySelector('.hourly');
    const weatherIcon = document.querySelector('#current-weather-icon');
    const randomDadJoke = document.querySelector('#dad-joke');

    // Proxy to get around cors for api development locally 
    const proxy = 'https://cors-anywhere.herokuapp.com/';

    // Use Google places api to search for weather
    const searchElement = document.querySelector('[data-city-search]');
    const searchBox = new google.maps.places.SearchBox(searchElement);
    searchBox.addListener('places_changed', () => {
        const place = searchBox.getPlaces()[0]
        if (place == null) return
        // Get longitude and latitude of location for weather
        const lat = place.geometry.location.lat();
        const long = place.geometry.location.lng();
        // Insert latitude and longitude to fetch the weather data from Dark Sky's API
        const weather = `${proxy}https://api.darksky.net/forecast//${lat},${long}`;
        fetch(weather, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(forecast => {
            return forecast.json();
        })
        .then(forecast => {
            //console.log(forecast.currently);
            //console.log(forecast.daily.summary);
            console.log(forecast.hourly.data);

            // Pulls all data from current weather and each piece can be added in between brackets
            const {temperature, summary, icon} = forecast.currently;

            // Set DOM Elements from the API
            temperatureSection.innerHTML = `<h2 class="temperature-degree">${parseInt(temperature)}</h2> <i class="wi wi-fahrenheit"></i>`;
            temperatureDescription.textContent = summary;
            currentDate.textContent = new Date().toString().substr(0,10);

            // formula for celsius conversion
            // let celsius = (temperature - 32) * (5 /9);

            // set icon
            weatherIcon.className += " " + icon;

            // change temperature to celsius/fahrenheit
            temperatureSection.addEventListener('click', () => {
                if(temperatureSpan.textContent === 'F'){
                    temperatureSpan.textContent === 'C';
                    temperatureDegree.textContent = Math.floor(celsius);
                } else {
                    temperatureSpan.textContent === 'F';
                    temperatureDegree.textContent = temperature;
                }
            });

            // Get 7 day forecast and iterate over each day
            let dailyForecast = forecast.daily.data;
            dailyForecast.forEach(function(el) {
                const date = new Date(el.time * 1000).toString().substr(0,10);
                const sunriseTime = new Date(el.sunriseTime * 1000).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
                const sunsetTime = new Date(el.sunsetTime * 1000).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
                daily.innerHTML += `
                    <div class="row daily-summary">
                        <div class="col-2">
                            <div class="sideways-date">${date}</div>
                        </div>
                        <div class="col-1">
                            <i class="wi wi-small ${el.icon}"></i>
                        </div>
                        <div class="col-8">
                            ${el.summary}
                        </div>
                        <div class="col-1">
                            <button class="right btn-daily-details"><i class="wi wi-medium wi-direction-down"></i></button>
                        </div>
                    </div>
                    <div class="row daily-details">
                        <div class="col-12">
                            <div class="row">
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-direction-down"></i> Low<br/> <span class="weather-value">${Math.round(el.temperatureLow)} <i class="wi wi-small wi-fahrenheit"></i></span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-direction-up"></i> High<br/> <span class="weather-value">${Math.round(el.temperatureHigh)} <i class="wi wi-small wi-fahrenheit"></i></span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wind"></i> Wind<br/> <span class="weather-value">${Math.round(el.windSpeed)} mph ${windDirection(el.windBearing)}</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-humidity"></i> Humidity<br/>  <span class="weather-value">${Math.round(el.humidity * 100)} %</span>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-sunrise"></i> Sunrise<br/> <span class="weather-value">${sunriseTime}</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-sunset"></i> Sunset<br/> <span class="weather-value">${sunsetTime}</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-wu-rain"></i> Precipitation<br/> <span class="weather-value">${parseInt(el.precipProbability * 100)} %</span>
                                    </div>
                                </div>
                                <div class="col-3">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-thermometer"></i> Dew Point<br/>  <span class="weather-value">${Math.round(el.dewPoint)} <i class="wi wi-small wi-fahrenheit"></i></span>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-4">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-day-haze"></i> Visibility<br/> <span class="weather-value">${Math.round(el.visibility)} mi</span>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-wu-sunny"></i> UV Index<br/> <span class="weather-value">${el.uvIndex}</span>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="weather-details-block">
                                        <i class="wi wi-small wi-barometer"></i> Pressure<br/> <span class="weather-value">${Math.round(el.pressure)} mb</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr/>`
                    //console.log(el);
                    });
            
            // Get Hourly forecast and iterate over each hour
            let hourlyForecast = forecast.hourly.data;
            hourlyForecast.forEach(function(el) {
                const hour = new Date(el.time * 1000).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
                hourly.innerHTML += `
                    <div class="row hourly-details">
                        <div class="col-2">
                            <div>${hour}</div>
                        </div>
                        <div class="col-2">
                            <div><i class="wi wi-medium ${el.icon}"></i></div>
                        </div>
                        <div class="col-4">
                            <div class="hourly-summary">${el.summary}</div>
                        </div>
                        <div class="col-2">
                            <i class="wi wi-small wi-wu-rain"></i> ${parseInt(el.precipProbability * 100)} %
                        </div>
                        <div class="col-2">
                            ${Math.round(el.apparentTemperature)} <i class="wi wi-small wi-fahrenheit"></i>
                        </div>
                    </div>
                    <hr/> `;
                    });
                });
            })

            // Get a random dad joke and display it using the API
            const dadJoke = `${proxy}https://icanhazdadjoke.com/`;
            fetch(dadJoke, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(dj => {
                return dj.json();
            })
            .then(dj => { 
                let joke = dj.joke;
                //console.log(joke);
                randomDadJoke.innerHTML = `${joke}`
            });

            // Function to calculate wind directions
            const windDirection = (degree) => {
                if (degree>337.5) return 'N';
                if (degree>292.5) return 'NW';
                if (degree>247.5) return 'W';
                if (degree>202.5) return 'SW';
                if (degree>157.5) return 'S';
                if (degree>122.5) return 'SE';
                if (degree>67.5) return 'E';
                if (degree>22.5) return 'NE';
                return 'North';
                }
            });

            // Hide/Show Daily details
            $(document).on("click", '.btn-daily-details', function(event) { 
                var el = $(this).parents('.daily-summary').next('.daily-details');
                if(el.css('display') == 'none') {
                    el.show('slow');
                    $(this).children().removeClass('wi-direction-down').addClass('wi-direction-up');
                } else {
                    el.hide('slow');
                    $(this).children().removeClass('wi-direction-up').addClass('wi-direction-down');
                }
            });               

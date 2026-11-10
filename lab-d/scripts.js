const API_KEY = 'a29019f68148414e44457c95735143c3';
const API_URL = 'https://api.openweathermap.org/data/2.5/';

const addressInput = document.getElementById('address');
const currentElement = document.getElementById('current');
const forecastElement = document.getElementById('forecast');

// AI (model Claude Fable 5.2) zasugerowało sposob łączenia tekstu
function getUrl(endpoint, address) {
  return API_URL + endpoint + '?q=' + address + '&appid=' + API_KEY + '&units=metric&lang=pl';
}

// AI (model Claude Fable 5.2) pomogło zrobić kafelek z pogodą (wspólny dla pogody bieżącej i prognozy)
function createWeatherElement(weather) {
  let weatherElement = document.createElement('div');
  weatherElement.className = 'weather';
  weatherElement.innerHTML =
    '<div class="date">' + new Date(weather.dt * 1000).toLocaleString('pl-PL') + '</div>' +
    '<img src="https://openweathermap.org/img/wn/' + weather.weather[0].icon + '@2x.png">' +
    '<div class="temperature">' + weather.main.temp + ' °C</div>' +
    '<div>Odczuwalna: ' + weather.main.feels_like + ' °C</div>' +
    '<div>' + weather.weather[0].description + '</div>';
  return weatherElement;
}

function getCurrentWeather(address) {
  let request = new XMLHttpRequest();
  request.open('GET', getUrl('weather', address), true);
  request.addEventListener('load', function () {
    let data = JSON.parse(request.responseText);
    console.log(data);

    currentElement.innerHTML = '';
    currentElement.append(createWeatherElement(data));
  });
  request.send();
}

function getForecast(address) {
  fetch(getUrl('forecast', address))
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      forecastElement.innerHTML = '';
      for (let weather of data.list) {
        forecastElement.append(createWeatherElement(weather));
      }
    });
}

document.getElementById('weather-button').addEventListener('click', function () {
  getCurrentWeather(addressInput.value);
  getForecast(addressInput.value);
});

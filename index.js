const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".currentWeather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "250c959996bb9a9bae3cd3710785a4ed";

// HTML for main weather card
const createWeatherCard = (cityName, weatherElement, index) => {
    if (index === 0) {
        return `<div class="currentWeather-details">
                    <h2>${cityName} (${weatherElement.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherElement.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind Speed: ${weatherElement.wind.speed} mps</h4>
                    <h4>Humidity: ${weatherElement.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherElement.weather[0].icon}.png" alt="weatherIcons">
                    <h4>${weatherElement.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>${weatherElement.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherElement.weather[0].icon}.png" alt="weatherIcons">
                    <h4>Temp: ${(weatherElement.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherElement.wind.speed} mps</h4>
                    <h4>Humidity: ${weatherElement.main.humidity}%</h4>
                </li>`;
    }
};

// Fetches weather details for given city coordinates
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            // Filter for unique forecast days
            const uniqueForecastDays = [];
            const fiveDayForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = ""; // Clear current weather container
            weatherCardsDiv.innerHTML = ""; // Clear weather cards container

            // Create and insert Weather Cards into the DOM
            fiveDayForecast.forEach((weatherElement, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherElement, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherElement, index));
                }
            });

        })
        .catch(() => {
            alert("Uh oh. There was an error while trying to fetch the weather forecast. Please try again later.");
        });
};

// Fetches city coordinates based on searched city name
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                return alert(`Uh oh. There was an error finding the coordinates for ${cityName}.`);
            }
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon); // Fetch weather details after getting coordinates
        })
        .catch(() => {
            alert("Uh oh. There was an error while trying to fetch these coordinates. Please try again later.");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            // Get city name from coordinates through reverse geocoding api key
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude); // Fetch weather details after getting coordinates
                })
                .catch(() => {
                    alert("Uh oh. There was an error while trying to find the city. Please try again later.");
                });
        },
        error => {
            console.log(error);
            alert("Oh no! We are unable to retrieve your current location. Please try again later!")
        }
    );
}

// Event listener for search button and location button click
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
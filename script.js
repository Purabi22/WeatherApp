"use strict";

const API = "fcc8de7015bbb202209bbf0261babf4c";

const dayEl = document.querySelector(".default_day");
const dateEl = document.querySelector(".default_date");
const btnEl = document.querySelector(".btn_search");
const inputEl = document.querySelector(".input_field");

const iconsContainer = document.querySelector(".icons");
const dayInfoEl = document.querySelector(".day_info");
const listContentEl = document.querySelector(".list_content ul");

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Function to get the user's geolocation
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

// Function to display geolocation position
function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  findLocationByCoords(lat, lon);
}

// Function to handle geolocation errors
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      console.log("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      console.log("An unknown error occurred.");
      break;
  }
}

// Function to find location by coordinates
async function findLocationByCoords(lat, lon) {
  iconsContainer.innerHTML = "";
  dayInfoEl.innerHTML = "";
  listContentEl.innerHTML = "";
  try {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API}`;
    const data = await fetch(API_URL);
    const result = await data.json();

    if (result.cod !== "404") {
      // Display image content
      const imageContent = displayImageContent(result);

      // Display right side content
      const rightSide = rightSideContent(result);

      // Forecast function
      displayForeCast(lat, lon);

      setTimeout(() => {
        iconsContainer.insertAdjacentHTML("afterbegin", imageContent);
        iconsContainer.classList.add("fadeIn");
        dayInfoEl.insertAdjacentHTML("afterbegin", rightSide);
      }, 1500);
    } else {
      const message = `${result.cod} ${result.message}`;
      iconsContainer.insertAdjacentHTML("afterbegin", message);
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

// Function to fetch location by name
async function findLocation(name) {
  iconsContainer.innerHTML = "";
  dayInfoEl.innerHTML = "";
  listContentEl.innerHTML = "";
  try {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&units=metric&appid=${API}`;
    const data = await fetch(API_URL);
    const result = await data.json();

    if (result.cod !== "404") {
      // Display image content
      const imageContent = displayImageContent(result);

      // Display right side content
      const rightSide = rightSideContent(result);

      // Forecast function
      displayForeCast(result.coord.lat, result.coord.lon);

      setTimeout(() => {
        iconsContainer.insertAdjacentHTML("afterbegin", imageContent);
        iconsContainer.classList.add("fadeIn");
        dayInfoEl.insertAdjacentHTML("afterbegin", rightSide);
      }, 1500);
    } else {
      const message = `${result.cod} ${result.message}`;
      iconsContainer.insertAdjacentHTML("afterbegin", message);
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
}

// Function to display image content and temperature
function displayImageContent(data) {
  return `
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"/>
    <h2 class="weather_temp">${Math.round(data.main.temp)}°C</h2>
    <h3 class="cloudtxt">${data.weather[0].description}</h3>`;
}

// Function to display the right side content
function rightSideContent(result) {
  return `
    <div class="content">
      <p class="title">NAME</p>
      <span class="value">${result.name}, ${result.sys.country}</span>
    </div>
    <div class="content">
      <p class="title">TEMP</p>
      <span class="value">${Math.round(result.main.temp)}°C</span>
    </div>
    <div class="content">
      <p class="title">HUMIDITY</p>
      <span class="value">${result.main.humidity}%</span>
    </div>
    <div class="content">
      <p class="title">WIND SPEED</p>
      <span class="value">${result.wind.speed} Km/h</span>
    </div>
  `;
}

// Function to display forecast based on coordinates
async function displayForeCast(lat, lon) {
  try {
    const ForeCast_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API}`;
    const data = await fetch(ForeCast_API);
    const result = await data.json();

    // Filter the forecast
    const uniqueForeCastDays = [];
    const daysForecast = result.list.filter((forecast) => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      if (!uniqueForeCastDays.includes(forecastDate)) {
        return uniqueForeCastDays.push(forecastDate);
      }
    });

    daysForecast.forEach((content, indx) => {
      if (indx <= 3) {
        listContentEl.insertAdjacentHTML("afterbegin", forecast(content));
      }
    });
  } catch (error) {
    console.error("Error fetching forecast data: ", error);
  }
}

// Function to generate forecast HTML elements
function forecast(frContent) {
  const day = new Date(frContent.dt_txt);
  const dayName = days[day.getDay()];
  const splitDay = dayName.split("", 3);
  const joinDay = splitDay.join("");

  return `
    <li>
      <img src="https://openweathermap.org/img/wn/${frContent.weather[0].icon}.png"/>
      <span>${joinDay}</span>
      <span class="day_temp">${Math.round(frContent.main.temp)}°C</span>
    </li>
  `;
}

// Display current date dynamically
function displayCurrentDate() {
  const currentDate = new Date();
  const dayName = days[currentDate.getDay()];
  const date = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  dateEl.textContent = `${dayName}, ${date} ${month} ${year}`;
}

// Event listener for the search button
btnEl.addEventListener("click", (e) => {
  e.preventDefault();
  if (inputEl.value !== "") {
    const search = inputEl.value;
    inputEl.value = "";
    findLocation(search);
  } else {
    console.log("Please enter a city or country name.");
  }
});

// Initialize the application
getLocation();
displayCurrentDate();

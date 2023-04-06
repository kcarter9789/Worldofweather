// OpenWeather API
var APIkey = "a17e1499228be1f9c294ac18b234c7d7";
// access DOM elements
var searchHistoryList = document.getElementById('search-history-list');
var searchCityInput = document.getElementById("search-city");
var searchCityButton = document.getElementById("search-city-button");
var clearHistoryButton = document.getElementById("clear-history");

var currentCity = document.getElementById("current-city");
var currentTemp = document.getElementById("current-temp");
var currentHumidity = document.getElementById("current-humidity");
var currentWindSpeed = document.getElementById("current-wind-speed");

var weatherContent = document.getElementById("weather-content");


// cities list
var cityList =[];

// IIFE for initializing history from local storage
(function initalizeHistoryFromLocalstorage() {
  var storedCities = JSON.parse(localStorage.getItem("cities"));

  if (storedCities !== null) {
    cityList = storedCities;
  }

  for (var i = 0; i < cityList.length; i++) {
    var cityBtn = document.createElement("li");
    cityBtn.setAttribute("class", "list-group-item city-btn");
    cityBtn.setAttribute("data-value", cityList[i]);
    cityBtn.textContent = cityList[i];
    searchHistoryList.appendChild(cityBtn);
  }
})();

// Hide clear button if there is no search history
function showClearSearchButton() {
  if (cityList.length === 0) {
    clearHistoryButton.classList.add("hide");
  } else {
    clearHistoryButton.classList.remove("hide");
  }
}

// Hide the forecast content until a city is searched
weatherContent.classList.add("hide");

// get current date and show in title
var currentDate = moment().format("L");
document.querySelector("#current-date").textContent = "(" + currentDate + ")";

// display search history if it exists
initalizeHistoryFromLocalstorage();
showClearSearchButton();

// on Enter click will trigger API request if input is focused
document.addEventListener("submit", function () {
  event.preventDefault();

  // get value entered into search bar
  var searchValue = searchCityInput.value.trim();

  currentConditionsRequest(searchValue);
  searchCityHistoryAndDisplay(searchValue);
  searchCityInput.value = "";
});

// Clicking the search button will trigger
// value added to search history
searchCityButton.addEventListener("click", function (event) {
  event.preventDefault();

  // Grab value entered into search bar
  var searchValue = searchCityInput.value.trim();

  currentConditionsRequest(searchValue);
  searchCityHistoryAndDisplay(searchValue);
  searchCityInput.value = "";
});

// Clear the sidebar of past cities searched
clearHistoryButton.addEventListener("click", function () {
  // Empty out the  city list array
  cityList = [];
  // Update city list history in local storage
  listArray();

  this.classList.add("hide");
});

// Clicking on a button in the search history sidebar
// will populate the dashboard with info on that city
searchHistoryList.addEventListener("click", function (event) {
  if (event.target && event.target.matches("li.city-btn")) {
    var value = event.target.getAttribute("data-value");
    currentConditionsRequest(value);
    searchCityHistoryAndDisplay(value);
  }
});

// Request Open Weather API based on user input
function currentConditionsRequest(searchValue) {
  // Formulate URL for AJAX api call
  var queryURL =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    searchValue +
    "&units=imperial&appid=" +
    APIkey;

  // Make AJAX call
  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      console.log(response);
      currentCity.textContent = response.name;
      var currentDateEl = document.createElement("small");
      currentDateEl.setAttribute("class", "text-muted");
      currentDateEl.setAttribute("id", "current-date");
      currentDateEl.textContent = "(" + currentDate + ")";
      currentCity.appendChild(currentDateEl);
      var imgEl = document.createElement("img");
      imgEl.setAttribute(
        "src",
        "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
      );

      imgEl.setAttribute("alt", response.weather[0].main);
      currentCity.appendChild(imgEl);
      currentTemp.textContent = response.main.temp;
      currentTemp.innerHTML += "&deg;F";
      currentHumidity.textContent = response.main.humidity + "%";
      currentWindSpeed.textContent = response.wind.speed + "MPH";

      var countryCode = response.sys.country;
      var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${searchValue},${countryCode}&units=imperial&appid=${APIkey}`;

      // AJAX call for 5-day forecast
      $.ajax({
        url: forecastURL,
        method: "GET",
      }).then(function (response) {
        console.log(response);
        $("#five-day-forecast").empty();
        for (var i = 0; i < response.list.length; i += 8) {
          var forecastDateString = moment(response.list[i].dt_txt).format("L");
          console.log(forecastDateString);

          var forecastCol = $(
            "<div class='forecast-day'>"
          );
          var forecastCard = $("<div class='card'>");
          var forecastCardBody = $("<div class='card-body'>");
          var forecastDate = $("<h5 class='card-title'>");
          var forecastIcon = $("<img>");
          var forecastTemp = $("<p class='card-text'>");
          var forecastWind = $("<p class='card-text'>");
          var forecastHumidity = $("<p class='card-text'>");

          $("#five-day-forecast").append(forecastCol);
          forecastCol.append(forecastCard);
          forecastCard.append(forecastCardBody);

          forecastCardBody.append(forecastDate);
          forecastCardBody.append(forecastIcon);
          forecastCardBody.append(forecastTemp);
          forecastCardBody.append(forecastWind);
          forecastCardBody.append(forecastHumidity);

          forecastIcon.attr(
            "src",
            "https://openweathermap.org/img/w/" +
              response.list[i].weather[0].icon +
              ".png"
          );
          forecastIcon.attr("alt", response.list[i].weather[0].main);
          forecastDate.text(forecastDateString);
          forecastTemp.text(response.list[i].main.temp);
          forecastTemp.prepend("Temp: ");
          forecastTemp.append(" &deg;F");
          forecastWind.text(response.list[i].wind.speed);
          forecastWind.prepend("Wind: ");
          forecastWind.append(" MPH");
          forecastHumidity.text(response.list[i].main.humidity);
          forecastHumidity.prepend("Humidity: ");
          forecastHumidity.append(" %");
        }
      });
    });
}
// Display and save the search history of cities
function searchCityHistoryAndDisplay(searchValue) {
  // get value entered into search bar
  //   display history of cities searched by default
  listArray();

  if (searchValue) {
    // Place value in the array of cities
    // if it is a new entry
    if (cityList.indexOf(searchValue) === -1) {
      cityList.push(searchValue);
      // List all of the cities in user history
      listArray();

      // Show clear history button
      clearHistoryButton.classList.remove("hide");

      // Show weather content
      weatherContent.classList.remove("hide");
    } else {
      // Remove the existing value from
      // the array
      var removeIndex = cityList.indexOf(searchValue);
      cityList.splice(removeIndex, 1);

      // Push the value again to the array
      cityList.push(searchValue);

      // List all of the cities in user history
      // so the old entry appears at the top
      // of the search history
      listArray();

      // Show clear history button
      clearHistoryButton.classList.remove("hide");

      // Show weather content
      weatherContent.classList.remove("hide");
    }
  }
}

// List the array into the search history sidebar
function listArray() {
  // Empty out the elements in the sidebar
  searchHistoryList.innerHTML = "";
  // Repopulate the sidebar with each city in the array
  cityList.forEach(function (city) {
    var searchHistoryItem = document.createElement("li");
    searchHistoryItem.setAttribute("class", "list-group-item city-btn");
    searchHistoryItem.setAttribute("data-value", city);
    searchHistoryItem.textContent = city;
    searchHistoryList.prepend(searchHistoryItem);
  });
  // Update city list history in local storage
  localStorage.setItem("cities", JSON.stringify(cityList));
}

// get city list string from local storage
// and update the city list array
// for the search history sidebar
function initalizeHistoryFromLocalstorage() {
  if (localStorage.getItem("cities")) {
    cityList = JSON.parse(localStorage.getItem("cities"));
    var lastIndex = cityList.length - 1;
    // Display the last city viewed
    // if page is refreshed
    if (cityList.length !== 0) {
      currentConditionsRequest(cityList[lastIndex]);
      weatherContent.classList.remove("hide");
    }
  }
}

// Check to see if there are elements in
// search history sidebar in order to show clear history btn
function showClearSearchButton() {
  if (searchHistoryList.textContent !== "") {
    clearHistoryButton.classList.remove("hide");
  }
}

// ---------------------> Storing all lat/long for ISS & Current Location
let images = [[], [], [], [], []];
let locationData = {
  issLat: "",
  issLong: "",
  currentLat: "",
  currentLong: "",
};
let index = 0;
let intervalPic;
let parks = document.querySelectorAll(".parkContent h3");
let theMarker = null;
let confirmed = false; // -------------------> Controlling alert notification

// Creating Map

let map = L.map("myMap", {
  center: [25, -100],
  zoom: 4,
});

// Adding Layers/scale to Map

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  format: "jpg70",
  minZoom: 1,
  maxZoom: 10,
  reuseTiles: true,
  unloadInvisibleTiles: true,
}).addTo(map);
L.control.scale().addTo(map);

// Adding Icon

const myIcon = L.icon({
  iconUrl: "./assets/icon/iss.png",
  iconSize: [38, 95],
});

// Adding ISS Marker

let issmarker = new L.Marker([40, -100], {
  draggable: false,
  autoPan: false,
  icon: myIcon,
  title: "International Space Station",
});

// Getting Your Current Geolocation

let getGeolocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showExactPosition);
  } else {
    alert("Geolocation is not supported");
    return;
  }
  function showExactPosition(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    locationData.currentLat = lat;
    locationData.currentLong = long;

    L.marker([position.coords.latitude, position.coords.longitude])
      .addTo(map)
      .bindPopup("Your Current Location")
      .openPopup();
  }
};

// Calling API to get the International Space Station Location

let getIssLocation = () => {
  fetch("https://api.wheretheiss.at/v1/satellites/25544")
    .then((response) => response.json())
    .then((data) => {
      let issLat = data.latitude;
      let issLong = data.longitude;

      locationData.issLat = issLat;
      locationData.issLong = issLong;
      issmarker
        .setLatLng([issLat, issLong])
        .addTo(map)
        .bindPopup(
          `<p>Altitude: ${(data.altitude / 1.6).toFixed(1)}ml</p>
          <p>Velocity: ${(data.velocity / 1.6).toFixed(
            1
          )}mph</p><span><a target = "_blank" href="https://eol.jsc.nasa.gov/ESRS/HDEV/">To Find Out more Follow the link</a></span>`
        );
      let issLocation = new L.circleMarker([issLat, issLong], {
        radius: 40,
        color: "blue",
        fillColor: "blue",
      }).addTo(map);
      setInterval(() => {
        map.removeLayer(issLocation);
      }, 2000);
    });
};

// Setting Interval to move ISS marker Periodically

function isISSnearBy() {
  let radiusLimitDeg = 250 / 69;
  let currentRadius = Math.sqrt(
    parseFloat(locationData.issLat - locationData.currentLat) ** 2 +
      parseFloat((locationData.issLong - locationData.currentLong) ** 2)
  );

  if (currentRadius <= radiusLimitDeg && !confirmed) {
    confirmed = true;
    confirm("Look Up You might See International Space Station!");
  }
}

// Getting Parks -------------------------->

function getParks() {
  $(".images img").attr("src", "./assets/images/background.jpg");
  let queryString = document.location.search;
  let state = queryString.split(/[?%\d]/).filter((el) => el.length !== 0);
  if (state.length > 1) {
    state = `${state[0]} ${state[1]}`;
  } else {
    state = state[0];
  }

  let stateCode = statesAbr[states.indexOf(state)];

  fetch(
    `https://developer.nps.gov/api/v1/parks?stateCode=${stateCode}&limit=5&api_key=pxrVjAGe1sTiPq6v7V9uFyScwJL6rhZb4dJig11J`
  )
    .then((response) => response.json())
    .then((data) => {
      displayWeather(locationData.currentLat, locationData.currentLong);

      for (let i = 0; i < data.data.length; i++) {
        if (data.data[i].images[0]) {
          images[i].push(data.data[i].images[0].url);
        }
        if (data.data[i].images[1]) {
          images[i].push(data.data[i].images[1].url);
        }
        if (data.data[i].images[2]) {
          images[i].push(data.data[i].images[2].url);
        }
        if (data.data[i].images[3]) {
          images[i].push(data.data[i].images[3].url);
        }
        if (data.data[i].images[4]) {
          images[i].push(data.data[i].images[4].url);
        }

        $(`#${i}`).removeClass(`hidden`);
        $(`#${i} h3`).text(`${data.data[i].fullName}`);
        $(`#${i} h4`).text(`${data.data[i].states}`);
        $(`#${i} h3`)
          .attr("data-lat", data.data[i].latitude)
          .attr("data-long", data.data[i].longitude)
          .attr("data-name", data.data[i].name);
        $(`#${i} .description`)
          .text(`${data.data[i].description}`)
          .append(
            $("<a>")
              .attr("href", data.data[i].url)
              .text("See more...")
              .attr("target", "_blank")
              .css({ width: "75px", display: "block" })
          );
      }
    });
}

// Updating ISS Location in the Map and checking if it is within 250 miles vicinity of current location
let interval = setInterval(() => {
  getIssLocation();
  isISSnearBy();
}, 1500);

// Calling functions ------------>

function getWeather(lat, long) {
  return fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=a2cf3270f3154f0e89b161101222308&q=${lat},${long}&days=5&aqi=no`
  )
    .then((response) => response.json())
    .then((data) => {
      return data;
    });
}

parks.forEach((el) => {
  el.addEventListener("click", (e) => {
    clearInterval(intervalPic);
    $(".images img").attr("src", images[e.target.dataset.value][1]);
    intervalPic = setInterval(() => {
      $(".images img").attr("src", images[e.target.dataset.value][index]);

      index++;
      if (
        index > images[e.target.dataset.value].length - 1 ||
        images[e.target.dataset.value][index] == undefined
      ) {
        index = index % 4;
      }
    }, 2000);
    let latitudePark = e.target.dataset.lat;
    let longitudePark = e.target.dataset.long;
    displayWeather(latitudePark, longitudePark);
    getWeather(latitudePark, longitudePark).then((data) => {
      if (theMarker !== null) {
        map.removeLayer(theMarker);
      }
      theMarker = L.marker([latitudePark, longitudePark])
        .addTo(map)
        .bindPopup(`${data.location.name}`);
    });
  });
});

function displayWeather(lat, long) {
  getWeather(lat, long).then((data) => {
    /* <------- weather-wrapper-1 info -------> */
    $("#locationName").text(`${data.location.name}, ${data.location.region}`);
    $("#sunrise").text(
      `Sunrise: ${data.forecast.forecastday[0].astro.sunrise}`
    );
    $("#sunset").text(`Sunset: ${data.forecast.forecastday[0].astro.sunset}`);
    $("#icondata img").attr("src", data.current.condition.icon);
    $("#temperature").text(`Temp: ${data.current.temp_f}F`);
    $("#humidity").text(`Humidity: ${data.current.humidity}%`);
    $("#wind__direction").text(
      `Wind: ${data.current.wind_mph}mph / ${data.current.wind_dir}`
    );
    $("#precipitations").text(`Precipications: ${data.current.precip_in} in`);

    /* <------- weather-wrapper-2 info -------> */
    const forecastDays = data.forecast.forecastday;
    forecastDays.forEach((el, idx) => {
      $(`#f${idx} .forecastdate`).text(`${el.date}`);
      $(`#f${idx} .forecasticon img`).attr("src", el.day.condition.icon);
      $(`#f${idx} .forecasttemp`).text(`Temp: ${el.day.maxtemp_f}°F`);
      $(`#f${idx} .forecastwind`).text(`Wind: ${el.day.maxwind_mph}mph`);
      $(`#f${idx} .forecastprecip`).text(`Precip. ${el.day.totalprecip_in} in`);
    });
  });
}

getParks();
getGeolocation();
getIssLocation();

// setting button to add to favorites/ locale storage //

$(document).ready(function () {
  $(".fixed-action-btn").floatingActionButton();
  $(".dropdown-trigger").dropdown();
  favoriteParks = JSON.parse(localStorage.getItem("favoriteParks"));
  let hrefs = Object.values(favoriteParks);
  Object.keys(favoriteParks).forEach((el, index) => {
    $("#dropdown1").append(
      $("<li>")
        .addClass("list")
        .append(
          $("<a>").text(el).attr("href", hrefs[index]).attr("target", "_blank")
        )
        .append(
          $("<button>").text("-").attr("data-name", el).addClass("btn delete")
        )
    );
  });
});

$(`.saveBtn`).on("click", function () {
  var parkName = $(this).siblings(".parkName").text();
  if (favoriteParks[parkName] == undefined) {
    favoriteParks[parkName] = $(this)
      .siblings(".description")
      .children()
      .attr("href");
    $("#dropdown1").append(
      $("<li>")
        .addClass("list")
        .append(
          $("<a>")
            .text(parkName)
            .attr(
              "href",
              $(this).siblings(".description").children().attr("href")
            )
            .attr("target", "_blank")
        )
        .append($("<button>").text("-").addClass("btn delete"))
    );
  }
  localStorage.setItem("favoriteParks", JSON.stringify(favoriteParks));
});

$("#dropdown1").on("click", ".delete", (e) => {
  console.log($(this).data("clicked"));
  $(e.target).parent().remove();
  console.log(favoriteParks);
  delete favoriteParks[$(e.target).siblings().text()];
  localStorage.removeItem(favoriteParks);
  localStorage.setItem("favoriteParks", JSON.stringify(favoriteParks));
});

// API Call: https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// Documentation: https://openweathermap.org/forecast5

require('dotenv').config();

//#region Class and Function Definitions
class WeatherLocation {
    constructor(city, lat, lon) {
        this.city = city;
        this.lat = lat;
        this.lon = lon;
    }
}

/**
 * Used to compare a Weather Location object with the available input parameters
 * @param {WeatherLocation} comparingLoc 
 */
WeatherLocation.prototype.isSame = function(cityName) {
    return this.city === cityName;
}
//#endregion

//#region Local Storage Initialization
var IsInitSearches = JSON.parse(localStorage.getItem('Searches'));
if (IsInitSearches == null) {
    localStorage.setItem('Searches', JSON.stringify([]));
}

var IsInitLastSearch = JSON.parse(localStorage.getItem('LastSearch'));
if (IsInitLastSearch == null) {
    localStorage.setItem('LastSearch', JSON.stringify({}));
}
//#endregion

//#region Runtime variables
var IsLoading_Page = false;

const SECTION_SearchContainer = $('#Search-Container');
const SECTION_SearchHistory = $('#Search-History');
const SECTION_NoSearch = $('#No-Search');
const SECTION_CurrentWeather = $('#Current-Weather');
const SECTION_Forecast = $('#Forecast');

const IN_InputCity = $('#Input-City');
const BTN_SearchCity = $('#Search-City');
const BTN_ResetSearchHistory = $('#Reset-Search-History');

var SearchHistory = JSON.parse(localStorage.getItem('Searches'));
//#endregion

//#region Runtime Functions
/**
 * Used when searching a new city through the input forms
 * @param {Event} event 
 */
let SearchCity = function(event) {
    IsLoading_Page = true;
    let searchCityInput = IN_InputCity.text();

    SearchHistory.forEach((search) => {
        if (search.isSame(searchCityInput)) {
            IsLoading_Page = false;
            return;
        }
    });

    try {
        var apiCall = 
            'http://api.openweathermap.org/geo/1.0/direct?q='
            + searchCityInput +
            '&limit=1&appid='
            + process.env.OPEN_WEATHER_KEY;
        
        fetch(apiCall)
        .then((response) => {
            if (!response) {
                throw true;
            }
            return response.json();
        })
        .then((data) => {
            var newIndex = SearchHistory.push(new WeatherLocation(
                searchCityInput,
                data[0].lat,
                data[0].lon
            ));
            localStorage.setItem('Searches', JSON.stringify(SearchHistory));
            newIndex--;
            var historyButton = $('<button>');
            historyButton.addClass('text-center')
            historyButton.text('');
            historyButton.on('click', DisplayCity(newIndex));
            SECTION_SearchHistory.append(historyButton)
        })
        .then((newLen) => {
            IN_InputCity.text('');
            this.DisplayCity(newLen-1);
        })
    } catch {
        IsLoading_Page = false;
        return;
    }
}

/**
 * 
 * @param {number} index 
 */
let DisplayCity = function(index) {
    SECTION_NoSearch.attr('hidden', true);
    SECTION_CurrentWeather.attr('hidden', false);
    SECTION_Forecast.attr('hidden', false);

    IsLoading_Page = true;

    try {
        var apiCall = 
            'api.openweathermap.org/data/2.5/forecast?lat='
            + SearchHistory[index].lat +
            '&lon=' 
            + SearchHistory[index].lon +
            '&appid='
            + process.env.OPEN_WEATHER_KEY +
            '&units=imperial';
        fetch(apiCall)
        .then((response) => {
            if (!response) {
                throw true;
            }
            return json.parse(response);
        })
        .then((data) => {
            const weatherList = data.list;
            var forecastItems = SECTION_Forecast.children();

            for (i=0; i<6; i++) {
                var editLabels;
                if (i == 0) {
                    editLabels = SECTION_CurrentWeather.children();
                } else {
                    editLabels = forecastItems.eq(i-1).children();
                }
                var listI = i * 8;
                if (listI == 40) listI--;

                editLabels.eq(0).text(data.city.name);
                editLabels.eq(1).text(new Date(weatherList[listI].item.dt * 1000).toLocaleDateString('en-US'));
                editLabels.eq(2).attr('src', () => {
                    return 'https://openweathermap.org/img/wn/' + weatherList[listI].weather[0].icon + '.png';
                });
                editLabels.eq(3).text(weatherList[listI].main.temp + '°F');
                editLabels.eq(4).text(weatherList[listI].wind.speed + '/mph');
                editLabels.eq(5).text(weatherList[listI].main.humidity + '%');
            }
        });
    } catch {
        IsLoading_Page = false;
        return;
    }
}

/**
 * 
 */
let ResetInputs = function() {
    localStorage.setItem('Searches', JSON.stringify([]));
    SECTION_SearchHistory.children().off();
    SECTION_SearchHistory.html('');
}
//#endregion

//#region Add Event Listeners
BTN_SearchCity.on('click', SearchCity);
BTN_ResetSearchHistory.on('click', ResetInputs)
//#endregion
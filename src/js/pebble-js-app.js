var xhrRequest = function (url, type, callback) {
    var xhr = new XMLHttpRequest ();
    xhr.onload = function () {
        callback (this.responseText);
    };
    xhr.open (type, url);
    xhr.send ();
};

//var base_url = 'http://hackthings-tmi.herokuapp.com';
var api_url = 'http://hackthings-tmi.herokuapp.com';
var config_url = 'http://hackthings-tmi-config.herokuapp.com/';
function locationSuccess (pos) {
    // Construct URL
    //var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
    //    pos.coords.latitude + '&lon=' + pos.coords.longitude;
    var stopID = localStorage.getItem ('stopID') || 4016;
    var bus = localStorage.getItem ('bus') || 15;
    //var url = base_url + '/advice?stop=' + stopID + '&bus=' + bus;
    var url = api_url + '/advice?stop=' + stopID + '&bus=' + bus;

    // Send request to OpenWeatherMap
    xhrRequest (url, 'GET',
                function (responseText) {
                    // responseText contains a JSON object with weather info
                    var json = JSON.parse (responseText);

                    // Arrivals
                    var arrivals = json.arrivals [0];
                    console.log ("Arrivals is " + arrivals);

                    // Conditions
                    // Trim the string to fit the screen
                    var conditions = json.weather.substring (0,6);
                    console.log ("Conditions are " + conditions);

                    // Assemble dictionary using our keys
                    var dictionary = {
                        "KEY_ARRIVALS": arrivals,
                        "KEY_CONDITIONS": conditions
                    };

                    // Send to Pebble
                    Pebble.sendAppMessage (dictionary,
                                           function (e) {
                                               console.log ("Weather info sent to Pebble successfully!");
                                           },
                                           function (e) {
                                               console.log ("Error sending weather info to Pebble!");
                                           });
                });
}

function locationError (err) {
    console.log ('Error requesting location!');
}

function getWeather () {
    navigator.geolocation.getCurrentPosition (
        locationSuccess,
        locationError,
        {timeout: 15000, maximumAge: 60000});
}

// Listen for when the watchface is opened
Pebble.addEventListener ('ready',
                         function (e) {
                             console.log ('PebbleKit JS ready!');

                             // Get the initial weather
                             getWeather ();
                         });

// Listen for when an AppMessage is received
Pebble.addEventListener ('appmessage',
                         function (e) {
                             console.log ('AppMessage received!');
                             getWeather ();
                         });

Pebble.addEventListener ('showConfiguration',
                         function (e) {
                             // Show config page
                             //Pebble.openURL (base_url + '/index.html');
                             Pebble.openURL (config_url);
                         });

Pebble.addEventListener ('webviewclosed',
                         function (e) {
                             var configuration = JSON.parse (decodeURIComponent (e.response));
                             var stopID = configuration.stopID;
                             var bus = configuration.bus;
                             if (stopID) { localStorage.setItem ('stopID', stopID); }
                             if (bus) { localStorage.setItem ('bus', bus); }
                             getWeather ();
                         });

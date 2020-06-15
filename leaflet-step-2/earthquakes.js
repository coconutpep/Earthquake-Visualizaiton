// Perform a GET request to the query URL
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson", data => {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function getColor(d) {
    return d >= 9 ? '#800026' :
           d >= 8 ? '#bd0026' :
           d >= 7 ? '#e31a1c' :
           d >= 6 ? '#fc4e2a' :
           d >= 5 ? '#fd8d3c' :
           d >= 4 ? '#feb24c' :
           d >= 3 ? '#fed976' :
           d >= 2 ? '#ffeda0' :
                   '#ffffcc';
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>Date: " + new Date(feature.properties.time) + "</br>"
      + "Magnitude: " + feature.properties.mag + "</p>")
  }

// This will be run when L.geoJSON creates the point layer from the GeoJSON data.
function createCircleMarker(feature, latlng){
    // Change the values of these options to change the symbol's appearance
    const options = {
      radius: feature.properties.mag * 10,
      fillColor: getColor(feature.properties.mag),
      color: "black",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
    return L.circleMarker(latlng, options);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  const earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: createCircleMarker, // Call the function createCircleMarker to create the symbol for this layer,
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

// Define background layer
 const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "streets-v11",
  accessToken: API_KEY
 });

 const dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
});

 const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-v9",
  accessToken: API_KEY
});

function createLine(feature, latlng) {
  return L.polyLine(feature.geometry.coordinates);
}

const faultLines = L.geoJSON(faultLineData, {
  pointToLayer: createLine
});

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  const myMap = L.map("map", {
    center: [0, 0],
    zoom: 3,
    layers: [streetmap, earthquakes, faultLines]
  });

  const baseMaps = {
    Streets: streetmap,
    Dark: dark,
    Satellite: satellite
  };

  // Overlays that may be toggled on or off
  const overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": faultLines
  };

  // Pass our map layers into our layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

//Create legend layer
const legend = L.control({position: 'bottomright'});
//Create and add legend
legend.onAdd = function (map) {

    const div = L.DomUtil.create('div', 'info legend'),
        mags = [1, 2, 3, 4, 5, 6, 7, 8, 9],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < mags.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(mags[i]) + '"></i> ' +
            mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);
}
// Set the parameters
    // The Geojson data you have in your folder
        const geoJsonURL = "data/R&H Specimens.geojson";
        let GEOJSON_global;

        $.getJSON('data/R&H Specimens.geojson', function(data) {
            GEOJSON_global = data;
        }).fail(function() {
            console.error('There has been a problem with your getJSON operation');
        });

    // Initial center of the map in terms of longitude and latitude
        const geoCenter = [38.05, -98.78];

    // Determine initial range of area shown on map (zoom closer when the number is higher)
        const zoomLevel = 4;

    // Start and End year of the dataset
        const baseStartDate = 1905;
        const baseEndDate = 1932;

    //Markers & Clusters
        // The color of the markers, used in function customizeMarker()
            const markColor = '#ff0000';
        // Determine the threshold of distance that cluster multiple markers, used in Function initialMarkerClusters()
            const maxClusterRadius = 1;
        // Specify the color of the marker cluster in css under the class name, used in Function initialMarkerClusters()
            const clusterColorClass = 'marker-cluster-color';

    // Check line 170-174 to customize the information on tooltip for your data


$("#slider").dateRangeSlider({
    bounds: {
        min: new Date(1905, 1, 1),
        max: new Date(1931, 11, 30)
    },
    defaultValues: {
        min: new Date(1905, 1, 1),
        max: new Date(1931, 11, 30)
    },
    step: {
        days: 1
    },
    scales: [
        // Primary scale
        {
            first: function(value) { return value; },
            end: function(value) { return value; },
            next: function(value) {
                var next = new Date(value);
                return new Date(next.setYear(value.getFullYear() + 1));
            },
            label: function(value) {
                return value.getFullYear();
            },
            format: function(tickContainer, tickStart, tickEnd) {
                tickContainer.addClass("myCustomClass");
            }
        }
    ]
});

$("#slider").on("valuesChanging", function(e, data){
    var newGeoJson = {
        "type" : "Feature Collection",
        "features": []
    };

    let startDate = data.values.min;
    let endDate = data.values.max;

    // Filter the features based on the date range
    let filteredFeatures = GEOJSON_global["features"].filter(feature => {
        let eventDate = new Date(feature["properties"]["eventDate"]);
        return eventDate >= startDate && eventDate <= endDate;
    });

    newGeoJson["features"] = filteredFeatures;

    renderPinsFromJson(something_markers, newGeoJson);
});

d3.json("data/R&H Specimens.geojson").then(function(geoJson){

    let granularity = "year";
    // Count the features by date
    let counts = countAllFeatures(geoJson, granularity);

    console.log(counts)

    // Prepare data for the chart
    let labels = Object.keys(counts);
    let data = Object.values(counts);
    
    // Create the chart
    let ctx = document.getElementById('myChart').getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Features',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            elements:{
                    line:{
                        tension: .2
                    }
            },
            fill: true,
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    beginAtZero: false
                }
            }
        }
    });

    $("#yearSelect").change(function() {
        let chartStatus = Chart.getChart("myChart"); // <canvas> id
        if (chartStatus != undefined) {
            chartStatus.destroy();
    }
        var selectedYear = $(this).val();
    
        // Determine the granularity of the line chart
        let granularity = selectedYear === "all" ? "year" : "month";
        
        if (selectedYear === "all") {
            // If "All Years" is selected, reset the slider to the initial format
            $("#slider").dateRangeSlider("bounds", new Date(1905, 1, 1), new Date(1931, 11, 30));
            $("#slider").dateRangeSlider("values", new Date(1905, 1, 1), new Date(1931, 11, 30));
            // Restore the year scales
            $("#slider").dateRangeSlider("option", "scales", [
                // Primary scale
                {
                    first: function(value) { return value; },
                    end: function(value) { return value; },
                    next: function(value) {
                        var next = new Date(value);
                        return new Date(next.setYear(value.getFullYear() + 1));
                    },
                    label: function(value) {
                        return value.getFullYear();
                    },
                    format: function(tickContainer, tickStart, tickEnd) {
                        tickContainer.addClass("myCustomClass");
                    }
                }
            ]);
            // Count the features by date
            let counts = countAllFeatures(GEOJSON_global, granularity);

            // Prepare data for the chart
            let labels = Object.keys(counts);
            let data = Object.values(counts);
            
            // Create the chart
            let ctx = document.getElementById('myChart').getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '# of Features',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    elements:{
                            line:{
                                tension: .2
                            }
                    },
                    fill: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        },
                        x: {
                            beginAtZero: false
                        }
                    }
                }
            });
    
        } else {
            
            // If a specific year is selected, update the slider bounds and values to cover only that year
            $("#slider").dateRangeSlider("bounds", new Date(selectedYear, 0, 1), new Date(parseInt(selectedYear) + 1, 0, 1));
            $("#slider").dateRangeSlider("values", new Date(selectedYear, 0, 1), new Date(parseInt(selectedYear) + 1, 0, 1));
            // Update the scales of the slider to represent months
            $("#slider").dateRangeSlider("option", "scales", [
                // Primary scale
                {
                    first: function(value) { return value; },
                    end: function(value) { return value; },
                    next: function(value) {
                        var next = new Date(value);
                        return new Date(next.setMonth(value.getMonth() + 1));
                    },
                    label: function(value) {
                        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return months[value.getMonth()];
                    },
                    format: function(tickContainer, tickStart, tickEnd) {
                        tickContainer.addClass("myCustomClass");
                    }
                }
            ]);
            // Count the features by date
            let counts = countFeaturesByYear(GEOJSON_global, selectedYear);
            // Prepare data for the chart
                let labels = Object.keys(counts);
                let data = Object.values(counts);

                // Create the chart
                let ctx = document.getElementById('myChart').getContext('2d');
                let myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '# of Features',
                            data: data,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        elements:{
                                line:{
                                    tension: .2
                                }
                        },
                        fill: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            },
                            x: {
                                beginAtZero: false
                            }
                        }
                    }
                });

        }
    });
});

// RENDER THE MAP
    //Using map from OpenStreetMap
        var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        var map = L.map('map', {
            layers: [OpenStreetMap_Mapnik]
        });

    // Initial zoom and center in the map
        map.setView(geoCenter, zoomLevel);

    // Set markers & clusters on the map
        var something_markers = initialMarkerClusters();

    // Get the initial Markers
        //renderPinsFromURL(something_markers, geoJsonURL);

    //Create the initial chart
        
// Functions to be used above

function countAllFeatures(geoJson, granularity) {
    // Find min and max years
    let minYear = Infinity;
    let maxYear = -Infinity;
    geoJson.features.forEach(feature => {
        let year = new Date(feature.properties.eventDate).getFullYear();
        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);
    });

    // Initialize counts object with all years from min to max with 0 features
    let counts = {};
    for (let year = minYear; year <= maxYear; year++) {
        if (granularity === 'year') {
            counts[year] = 0;
        } else if (granularity === 'month') {
            for (let month = 1; month <= 12; month++) {
                counts[`${year}-${month}`] = 0;
            }
        }
    }

    // Count features
    geoJson.features.forEach(feature => {
        let date = new Date(feature.properties.eventDate);
        let key;

        if (granularity === 'year') {
            key = date.getFullYear();
        } else if (granularity === 'month') {
            key = date.getFullYear() + '-' + (date.getMonth() + 1);
        }

        counts[key]++;
    });

    console.log(counts);
    return counts;
}


function countFeaturesByYear(geoJson, selectedYear) {
    let counts = {};
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize counts for each month of the selected year
    for (let i = 0; i < 12; i++) {
        let key = monthNames[i];
        counts[key] = 0;
    }

    geoJson.features.forEach(feature => {
        let date = new Date(feature.properties.eventDate);
        let year = date.getFullYear();
        let month = monthNames[date.getMonth()]; // JavaScript months are 0-indexed

        if(selectedYear == year){
            counts[month]++;
        }
    });

    return counts;
}

    // Implement the customized Icon
        function customizeMarker(){
            const markerNarrativeHtmlStyles = `
                                          background-color: ${markColor};
                                          width: 1rem;
                                          height: 1rem;
                                          display: block;
                                          top: -1rem;
                                          position: relative;
                                          border-radius: 1.5rem 1.5rem 0;
                                          transform: rotate(45deg);
                                          border: 0.5px solid #FFFFFF
                                      `
            var icon = L.divIcon({
                                      className: "my-custom-pin",
                                      iconAnchor: [10, 5],
                                      labelAnchor: [0, 0],
                                      popupAnchor: [0, -18],
                                      html: `<span style="${markerNarrativeHtmlStyles}" />`
                                    })
            return icon;
        };


    // Set the cluster of markers
        function initialMarkerClusters(){
            let groupToReturn = new L.markerClusterGroup({
                                    spiderfyOnMaxZoom: true,
                                    showCoverageOnHover: true,
                                    zoomToBoundsOnClick: true,
                                    maxClusterRadius: `${maxClusterRadius}`,
                                    singleMarkerMode: true,
                                    iconCreateFunction: function(cluster){
                                        return L.divIcon({
                                            className:`marker-cluster ${clusterColorClass}`,
                                            iconSize: new L.Point(8,8),
                                            //html: '<div><span>' + cluster.getChildCount() + '</span></div>'
                                        });
                                    }
                                })
            return groupToReturn;
        };



    // When you have your Geojson file in your folder, use this function is　handy
        function renderPinsFromURL(markers, geoJsonURL){
            $.getJSON(geoJsonURL, function(data){
                renderPinsFromJson(markers, data);
            })
        }


    // Render Markers on the map based on the geojson data
        function renderPinsFromJson(markers, geoJson){
            var customizedIcon = customizeMarker();
            var geojson = L.geoJson(
                                geoJson,
                                {   // Information shown in tooltip
                                        onEachFeature: function(feature,layer){
                                            layer.bindPopup(
                                                "<b>Catalog Number:  </b>" + feature.properties.catalogNumber + "<br>" +
                                                "<b>Species:  </b>" + feature.properties.scientificName + "<br>"+
                                                "<b>Date:  </b>" + feature.properties.eventDate + "<br>" +
                                                "<b>State:  </b>" + feature.properties.stateProvince + "<br>" +
                                                "<b>Locality:  </b>" + feature.properties.locality + "<br>"+
                                                '<b><a href=" '+ feature.properties.link + ' "target="_blank">View Record</a>');
                                        },
                                    pointToLayer: function (feature, latlng) {
                                        return L.marker(latlng, {icon: customizedIcon});
                                    }
                            });
            markers.clearLayers();
            markers.addLayer(geojson);
            map.addLayer(markers);
        };

// Set the parameters
    // The Geojson data you have in your folder
        const geoJsonURL = "data/R&H Specimens.geojson";

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

// // Slider
//     $( function() {
//         // config opaque slider
//             $( "#slider-opaque" ).slider({
//                 range: false,
//                 min: 0,
//                 max: 1,
//                 step: 0.1,
//                 value: 1,
//                 slide: function( event, ui ) {
//                     let opaque = ui.value;

//                     $( "#opacity" ).val( opaque );
//                     a2_1916_02.setOpacity(opaque);
//                 }
//             });

//         // initial display
//             $( "#opacity" ).val("1");


//         // config time range slider
//             $( "#slider-range" ).slider({
//                 range: true,
//                 min: new Date('1906.01.01').getTime() / 1000,
//                 max: new Date('1933.01.01').getTime() / 1000,
//                 values: [ new Date('1906.01.01').getTime() / 1000, new Date('1933.01.01').getTime() / 1000],

//                 // Every time slider is slided, the map should be refreshed
//                     slide: function( event, ui ) {
//                         var newGeoJson = {
//                             "type" : "Feature Collection",
//                             "features": []
//                         };
//                         let startDate = new Date(ui.values[ 0 ] * 1000);
//                         let endDate = new Date(ui.values[ 1 ] * 1000);

//                         $( "#amount" ).val(startDate.toISOString().slice(0, 10) + " - " + endDate.toISOString().slice(0, 10));
                        
//                         $.getJSON(geoJsonURL, function(data){
//                             let GEOJSON  = data;
//                             for (let i = 0; i < GEOJSON["features"].length; i++){
//                                 if ((new Date(GEOJSON["features"][i]["properties"]["eventDate"])) >= startDate &&
//                                     (new Date(GEOJSON["features"][i]["properties"]["eventDate"])) <= endDate) {  // will change "id" to "year"
                                   
//                                     newGeoJson["features"].push(GEOJSON["features"][i])
//                                 }
//                             }
//                             renderPinsFromJson(something_markers,newGeoJson);
//                             //console.log(new Date(GEOJSON["features"][1]["properties"]["eventDate"]))
//                         });
//                     }
//             });
//         //initial display
//             $( "#amount" ).val(
//                 (new Date('1906.01.01').getTime() / 1000).toISOString().slice(0, 10) + " - " + new Date(ui.values[ 1 ] * 1000).toISOString().slice(0, 10)
//             );
//     });

//Date Range Sldier
var years = ["1906", "1907", "1908", "1909", "1910", "1911", "1912", "1913", "1914", "1915", "1916", "1917",
            "1918", "1919", "1920", "1921", "1922", "1923", "1924", "1925", "1926", "1927", "1928", "1929",
            "1930", "1931", "1932"]

$("#slider").dateRangeSlider({
    bounds:{
        min: new Date(1905, 1, 1),
        max: new Date(1933,1,1)
    },
    defaultValues:{
        min: new Date(1905, 1, 1),
        max: new Date(1906,1,1)
    },
    step:{
        days: 1
    }
}   
);

$("#slider").on("valuesChanging", function(e, data){
    var newGeoJson = {
        "type" : "Feature Collection",
        "features": []
    };

    let startDate = data.values.min;
    let endDate = data.values.max;

    $.getJSON(geoJsonURL, function(data){
        let GEOJSON  = data;
        for (let i = 0; i < GEOJSON["features"].length; i++){
            if ((new Date(GEOJSON["features"][i]["properties"]["eventDate"])) >= startDate &&
                (new Date(GEOJSON["features"][i]["properties"]["eventDate"])) <= endDate) {  // will change "id" to "year"
               
                newGeoJson["features"].push(GEOJSON["features"][i])
            }
        }
        
        renderPinsFromJson(something_markers,newGeoJson);
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


// Functions to be used above
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
                                            iconSize: new L.Point(12,12),
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

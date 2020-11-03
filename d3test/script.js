const endpoint = 'https://opendata.rdw.nl/resource/b3us-f26s.json?$limit=90000'; //specificaties parkeergebied dataset
const endpoint2 = 'https://opendata.rdw.nl/resource/t5pc-eb34.json?$limit=90000'; //GEO Parkeer Garages dataset
const selectedColumn = 'maximumvehicleheight';
const selectedColumn2 = 'usageid';


let data1 = getData(endpoint) //calls function getData with API link
    .then(result => { //only continues when data is fetched
        return result.json()
    })
    .then(RDWData => {
        // console.log('all data: ', RDWData);

        const filteredColumnData = filterData(RDWData, selectedColumn); //calls filterData with API data and column ID
        // console.log('From endpoint1 ', filteredColumnData);

        const filteredDataObjects = filterObjectValue(RDWData, selectedColumn); //callsfilterObject with data and column ID
        // console.log('From endpoint1 ', filteredDataObjects);

        return filteredDataObjects;
    })

let data2 = getData(endpoint2) //calls function getData with API link
    .then(result => { //only continues when data is fetched
        return result.json() //puts result into JSON
    })
    .then(RDWData => {
        // console.log('all data: ', RDWData);
        return RDWData;

        // const filteredColumnData2 = filterData(RDWData, selectedColumn2); //calls filterData with API data and column ID
        // console.log('From endpoint2 ', filteredColumnData2);

        // const filteredDataObjects2 = filterObjectName(RDWData, selectedColumn2); //callsfilterObject with data and column ID
        // console.log('From endpoint2 ', filteredDataObjects2);

        // return filteredDataObjects2;
    })

let cleanedDataObjects = compare(data1, data2) //calls compare function, and logs result when ready
    .then(result => {
        // console.log(result);
        mapThings(result)
        return result;
    });


function getData(url) {
    return fetch(url); //fetches data from API url
}

function filterData(dataArray, key) {
    return dataArray.map(item => item[key]); //filters column data from array
}

function filterObjectValue(dataArray, key) {
    return dataArray.filter(item => item[key] > 0); //returns only objects with a key-value higher than 0
}

function filterObjectName(dataArray, key) {
    return dataArray.filter(item => item[key] === 'GARAGEP'); //returns only objects with a key-value higher than 0
}

async function compare(array1, array2) { //async function that awaits the promised arrays
    const result1 = await array1; //waits for incoming data
    const result2 = await array2;
    let compiled = [];

    result1.forEach(itemArr1 => { //loops over each item in result1

        result2.forEach(itemArr2 => { //loops over each item in result2 to check same area id's

            if (itemArr1.areaid === itemArr2.areaid) {

                let location = [parseFloat(itemArr2.location.longitude), parseFloat(itemArr2.location.latitude)]; //saves location to an array

                compiled.push({ //pushes an object into array 'compiled'
                    areamanagerId: itemArr1.areamanagerid,
                    areaId: itemArr1.areaid,
                    capacity: itemArr1.capacity,
                    chargingpointCapacity: itemArr1.chargingpointcapacity,
                    disabledAccess: itemArr1.disabledaccess,
                    maximumVehicleHeight: itemArr1.maximumvehicleheight,
                    limitedAccess: itemArr1.limitedaccess,
                    location: location,
                    areaDesc: itemArr2.areadesc
                });
            }
        })
    })

    return compiled;
}


//D3 code
var svg = d3.select("svg"),
    width = 400,
    height = 300;

// Map and projection
var projection = d3.geoMercator()
    .center([2, 52.7]) // GPS of location to zoom on
    .scale(8000) // This is like the zoom
// .translate([ width/1, height/2 ])

// Load external data and boot
d3.json("https://gist.githubusercontent.com/larsbouwens/1afef9beb0c3df0e4b24/raw/5ed7eb4517eee5737a4cb4551558e769ed8da41a/nl.json", function (data) {
    //provinces.gejson or townships.geojson
    // Filter data
    // data.features = data.features.filter(function(d){console.log(d.properties.name) ; return d.properties.name=="Hoorn"})

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("fill", "grey")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "black")
})

function mapThings(object) {
    svg.selectAll('circle')
        .data(object)
        .enter().append('circle')
        .attr('cx', function (d) {
            return projection(d.location)[0];
        })
        .attr("cy", function (d) {
            return projection(d.location)[1];
        })
        .attr("r", 14)
        .style("fill", "pink")
        .attr("stroke", "white")
        .attr("stroke-width", 3)

}
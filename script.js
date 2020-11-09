//local server command: python -m http.server
//import modules
import {
    endpoint,
    endpoint2,
    selectedColumn,
    selectedColumn2
} from './modules/endpoint.js';
import {
    compare
} from './modules/array.js';

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

//D3 code
let mapSVG = d3.select("#map");

// Map and projection
let mapProjection = d3.geoMercator()
    .center([5.66, 52.40]) // GPS of location to zoom on
    .scale(7500) // This is like the zoom
// .translate([ width/2, height/2 ])

let mapPath = d3.geoPath(mapProjection)

let tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style("opacity", 0)

// Load external data and boot
function loadMap() {
    d3.json("https://gist.githubusercontent.com/larsbouwens/1afef9beb0c3df0e4b24/raw/5ed7eb4517eee5737a4cb4551558e769ed8da41a/nl.json", data => {

        // Draw the map
        mapSVG.select("g")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", mapPath)
    })
}

window.onload = loadMap(); //loads the map after the page is loaded

function mapThings(object) { //gets called when data is ready


    mapSVG.selectAll('circle')
        .data(object)
        .enter().append('circle')
        .attr('cx', d => {
            return mapProjection(d.location)[0];
        }) //adds location from data object
        .attr("cy", d => {
            return mapProjection(d.location)[1];
        })
        .attr("r", d => {
            return calculateRadius(d.capacity);
        }) //calls function to calculate radius
        .on("mouseover", mouseOver)
        // .on("mousemove", mouseMove)
        .on("mouseout", mouseOut)
}

function calculateRadius(capacity) { //function that calculates the radius of a bubble on the bubble map
    let radius;
    if (capacity > 1000) {
        radius = 10;
    } else if (capacity < 1000 && capacity > 700) {
        radius = 8;
    } else if (capacity < 700 && capacity > 500) {
        radius = 6;
    } else {
        radius = 4;
    }
    return (radius);
}

function mouseOver(d, i) { //add interactivity

    d3.select(this).transition()    //set transition for circle
        .duration('50')
        .attr('opacity', .6);

    tooltip.transition()            //set transition for tooltip
        .duration('50')
        .style('opacity', 1);

    tooltip.html(d.areaDesc);  //text of the tooltip
        
    tooltip.style('left', (d3.event.pageX + 10) + 'px') //position of the tooltip
        .style('top', (d3.event.pageY + 10) + 'px');


}

// function mouseMove(d) {
//     tooltip
//         .html(d.areaDesc)
//         .style("left", (d3.mouse(this)[0] + 10) + "px")
//         .style("top", (d3.mouse(this)[1]) + "px")
// }

function mouseOut(d) { //sets hover back when not hovering

    d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1');

    tooltip.transition()
        .duration('50')
        .style("opacity", 0);

}
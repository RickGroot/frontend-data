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
import {
    mapSVG,
    mapProjection,
    mapPath,
    tooltip
} from './modules/mapConst.js';

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
// Load external data and boot
function loadMap() {
    d3.json("https://gist.githubusercontent.com/larsbouwens/1afef9beb0c3df0e4b24/raw/5ed7eb4517eee5737a4cb4551558e769ed8da41a/nl.json").then(data => {

        // Draw the map
        mapSVG.selectAll("g")
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
        .on("mouseout", mouseOut)

        mapSVG.call(d3.zoom().scaleExtent([1 / 8, 24]).on('zoom', onZoom));
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

function mouseOver(event, d) { //add interactivity

    d3.select(this).transition()    //set transition for circle
        .duration('50')
        .attr('opacity', .6);

    tooltip.transition()                           //set transition for tooltip
        .duration('50')
        .style('opacity', 1)

    tooltip.html(d.areaDesc);  //text of the tooltip
        
    tooltip.style('left', (event.pageX) + 'px') //position of the tooltip
        .style('top', (event.pageY + 10) + 'px')
        .attr('class','focus')
}

function mouseOut() { //sets hover back when not hovering

    d3.select(this).transition()    //put circle back when not hovering
        .duration('50')
        .attr('opacity', '1');

    tooltip.transition()            //hides tooltips
        .duration('50')
        .style("opacity", 0);
}

function onZoom(event, d) {
    mapSVG.attr('transform', event.transform);
}
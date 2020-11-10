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
import {
    getData,
    filterData,
    filterObjectName,
    filterObjectValue
} from './modules/filterFunctions.js';

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
        barchart(result)
        return result;
    });

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
    
    mapSVG.call(d3.zoom()
        .scaleExtent([1, 4])    //maximum zooming levels
        .translateExtent([      //maximum panning levels
            [-200, -200],
            [1000, 800]
        ])
        .on('zoom', onZoom));   //calls function onZoom
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
        .on("mouseover", mouseOver)     //calls function when hovering
        .on("mouseout", mouseOut)       //calls function when not hovering
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

    d3.select(this).transition() //set transition for circle
        .duration('50')
        .attr('opacity', .6);

    tooltip.transition() //set transition for tooltip
        .duration('50')
        .style('opacity', 1)

    tooltip.html(d.areaDesc); //text of the tooltip

    tooltip.style('left', (event.pageX) + 'px') //position of the tooltip
        .style('top', (event.pageY + 10) + 'px')
        .attr('class', 'focus');
}

function mouseOut() { //sets hover back when not hovering

    d3.select(this).transition() //put circle back when not hovering
        .duration('50')
        .attr('opacity', '1');

    tooltip.transition() //hides tooltips
        .duration('50')
        .style("opacity", 0);
}

function onZoom(event, d) {
    mapSVG.attr('transform', event.transform);
}



//code for bar chart
//set the dimensions and margins of the graph
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//set the ranges
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

var y = d3.scaleLinear()
    .range([height, 0]);

//append a 'group' element to 'svg'
//moves the 'group' element to the top left margin
var barSVG = d3.select("#bar")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


function formatBarData(data) {
    let extraTall = 0;
    let tall = 0;
    let medium = 0;
    let small = 0;
    let extraSmall = 0;

    data.forEach(d => {
        if (d.maximumVehicleHeight > 220) {
            extraTall++;
        } else if (d.maximumVehicleHeight > 205 && d.maximumVehicleHeight < 220) {
            tall++;
        } else if (d.maximumVehicleHeight > 195 && d.maximumVehicleHeight < 205) {
            medium++;
        } else if (d.maximumVehicleHeight > 185 && d.maximumVehicleHeight < 195) {
            small++;
        } else if (d.maximumVehicleHeight < 185) {
            extraSmall++;
        }
    })

    let formatData = {
        '220': extraTall,
        '205': tall,
        '195': medium,
        '185': small,
        '175': extraSmall
    }

    barchart(formatData)
}

//gets called when the data is collected
function barchart(data) {

    //scale the range of the data in the domains
    x.domain(data.map(function (d) {
        return d.maximumVehicleHeight;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.capacity;
    })]);

    //append the rectangles for the bar chart
    barSVG.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.maximumVehicleHeight);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
            return y(d.capacity);
        })
        .attr("height", function (d) {
            return height - y(d.capacity);
        });

    //add the x Axis
    barSVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    //add the y Axis
    barSVG.append("g")
        .call(d3.axisLeft(y));
}
//local server command: python -m http.server
//import modules
import {
    endpoint,
    endpoint2,
    selectedColumn,
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
    height,
    x,
    y,
    barSVG,
    barTooltip
} from './modules/barConst.js';
import {
    getData,
    filterData,
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
        .scaleExtent([1, 4]) //maximum zooming levels
        .translateExtent([ //maximum panning levels
            [-200, -200],
            [1000, 800]
        ])
        .on('zoom', onZoom)); //calls function onZoom
}

window.onload = loadMap(); //loads the map after the page is loaded

function mapThings(object) { //gets called when data is ready

    mapSVG.selectAll('circle')
        .data(object)
        .enter().append('circle')
        // .attr('fill', d => {})
        .attr('cx', d => {
            return mapProjection(d.location)[0];
        }) //adds location from data object
        .attr("cy", d => {
            return mapProjection(d.location)[1];
        })
        .attr("r", d => {
            return calculateRadius(d.capacity);
        }) //calls function to calculate radius
        .on("mouseover", mouseOverMap) //calls function when hovering
        .on("mouseout", mouseOutMap) //calls function when not hovering
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

function mouseOverMap(event, d) { //add interactivity

    tooltip.transition() //set transition for tooltip
        .duration('50')
        .style('opacity', 1)

    tooltip.html(d.areaDesc); //text of the tooltip

    tooltip.style('left', (event.pageX) + 'px') //position of the tooltip
        .style('top', (event.pageY + 10) + 'px')
        .attr('class', 'focus');
}

function mouseOutMap() { //sets hover back when not hovering

    tooltip.transition() //hides tooltips
        .duration('50')
        .style("opacity", 0);
}

function onZoom(event, d) {
    mapSVG.attr('transform', event.transform);
}

var slider = d3
    .sliderVertical()
    .min(150)
    .max(300)
    .step(5)
    .width(300)
    .displayValue(false)

d3.select('#slider')
    .append('svg')
    .append('g')
    .attr('transform', 'translate(45,30)')
    .call(slider);

let value = slider.on('onchange', (val) => {
    d3.select('#value').text(val);
    circleColor(val)
    console.log(val)
});


function circleColor(val) {
    if (val > 200) {
        mapSVG.selectAll('circle')
            .style('fill', 'red')
    } else {
        mapSVG.selectAll('circle')
            .style('fill', 'blue')
    }
}



//code for bar chart
//gets called when the data is collected
function barchart(data) {

    let heights = filterData(data, 'maximumVehicleHeight');
    let barData = mergeValues(heights);

    //scale the range of the data in the domains
    x.domain(barData.map(function (d) {
        return d.name;
    }));
    y.domain([0, d3.max(barData, function (d) {
        return d.amount;
    })]);

    //append the bars for the bar chart
    barSVG.selectAll(".bar")
        .data(barData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.name);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
            return y(d.amount);
        })
        .attr("height", function (d) {
            return height - y(d.amount);
        })
        .on("mouseover", mouseOverBar) //calls function when hovering
        .on("mouseout", mouseOutBar) //calls function when not hovering

    //add the x axis
    barSVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    //add the y axis
    barSVG.append("g")
        .call(d3.axisLeft(y));
}

function mergeValues(data) {
    return d3.groups(data, d => d)
        .map(([name, group]) => ({
            name,
            amount: d3.rollup(group, d => d).length
        }))
}

function mouseOverBar(event, d) { //add interactivity

    barTooltip.transition() //set transition for tooltip
        .duration('50')
        .style('opacity', 1)

    barTooltip.html(d.amount + ' parkeergarages met <br> een hoogte van ' + d.name); //text of the tooltip

    barTooltip.style('left', (event.pageX) + 'px') //position of the tooltip
        .style('top', (event.pageY + 10) + 'px')
        .attr('class', 'focus');
}

function mouseOutBar() { //sets hover back when not hovering

    barTooltip.transition() //hides tooltips
        .duration('50')
        .style("opacity", 0);
}
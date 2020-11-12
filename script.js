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
    tooltip,
    slider,
    calculateRadius
} from './modules/mapConst.js';
import {
    height,
    width,
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

//data from endpoint 1
let data1 = getData(endpoint) //calls function getData with API link
    .then(result => { //only continues when data is fetched
        return result.json()
    })
    .then(RDWData => {
        const filteredDataObjects = filterObjectValue(RDWData, selectedColumn); //callsfilterObject with data and column ID

        return filteredDataObjects;
    })

//data from endpoint 2
let data2 = getData(endpoint2) //calls function getData with API link
    .then(result => { //only continues when data is fetched
        return result.json() //puts result into JSON
    })
    .then(RDWData => {
        return RDWData;
    })

//all the clean data
let cleanedDataObjects = compare(data1, data2) //calls compare function, and logs result when ready
    .then(result => { //fires when data is collected
        // console.log(result);
        mapThings(result); //calls function that puts circles on the map
        barchart(result); //calls function that places barchart
        return result;
    });

//code for d3 map
//load map data and put it in svg
function loadMap() {
    d3.json("https://gist.githubusercontent.com/larsbouwens/1afef9beb0c3df0e4b24/raw/5ed7eb4517eee5737a4cb4551558e769ed8da41a/nl.json").then(data => {

        // Draw the map
        mapSVG.selectAll("#paths")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", mapPath)
    })

    //zooming on map
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

    mapSVG.select('svg g').selectAll('circle')
        .data(object)
        .enter().append('circle')
        .attr('class', d => {
            return d.maximumVehicleHeight
        }) //adds class to interact with slider
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

//when mouse is on circle
function mouseOverMap(event, d) { //add interactivity
    tooltip.transition() //set transition for tooltip
        .duration('50')
        .style('opacity', 1)

    tooltip.html(d.areaDesc + '<br> Capacity: ' + d.capacity); //text of the tooltip

    tooltip.style('left', (event.pageX) + 'px') //position of the tooltip
        .style('top', (event.pageY + 10) + 'px')
        .attr('class', 'focus');
}

//when mouse is not on circle
function mouseOutMap() { //sets hover back when not hovering
    tooltip.transition() //hides tooltips
        .duration('50')
        .style("opacity", 0);
}

//zoom with d3
function onZoom(event) {
    mapSVG.select('svg g').attr('transform', event.transform);
}


//sets off an update when slider changes
let value = slider.on('onchange', (val) => {
    d3.select('#value').text(val); //chance html text
    updateColor(val); //calls updatColor function
});

//function that updates circle color based on slider value
function updateColor(val) {
    document.querySelectorAll('circle').forEach(function colorFunc(d) { //chances classes with vanilla JS
        if (parseInt(d.classList) > val) {
            d.classList.remove('redDot'); //removes class if it's there
            d.classList.add('greenDot'); //adds correct class
        } else {
            d.classList.remove('greenDot');
            d.classList.add('redDot');
        }
    });
}

//code for bar chart
//gets called when the data is collected
function barchart(data) {

    let heights = filterData(data, 'maximumVehicleHeight');
    let barData = mergeValues(heights);

    //scale the range of the data in the domains
    x.domain(barData.map(function (d) {
        return d.name; //sets names on x-axis
    }).sort(d3.ascending));
    y.domain([0, d3.max(barData, function (d) {
        return d.amount; //sets max value of y-axis based on data
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

//puts all double values in a new object
function mergeValues(data) {
    return d3.groups(data, d => d)
        .map(([name, value]) => ({ //creates array in object with name and value
            name,
            amount: d3.rollup(value, d => d).length
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
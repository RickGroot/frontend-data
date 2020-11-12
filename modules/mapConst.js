let mapSVG = d3.select("#map");

// Map and projection
let mapProjection = d3.geoMercator()
    .center([5.66, 52.40]) // GPS of location to zoom on
    .scale(7000) // This is like the zoom
// .translate([ width/2, height/2 ])

let mapPath = d3.geoPath().projection(mapProjection)

let tooltip = d3.select('body')
    .append('div')
    .attr('class', 'unfocus')

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

export {
    mapSVG,
    mapProjection,
    mapPath,
    tooltip,
    slider,
    calculateRadius
};
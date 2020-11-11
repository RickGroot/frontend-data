//set dimentions for bar chart
let margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
};
let width = parseInt(getComputedStyle(document.querySelector('#bar')).width) - margin.left - margin.right;
let height = parseInt(getComputedStyle(document.querySelector('#bar')).height) - margin.top - margin.bottom;

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

let barTooltip = d3.select('body')
    .append('div')
    .attr('class', 'unfocus')

export {
    margin,
    width,
    height,
    x,
    y,
    barSVG,
    barTooltip
};
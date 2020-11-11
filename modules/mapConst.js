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

export {
    mapSVG,
    mapProjection,
    mapPath,
    tooltip
};
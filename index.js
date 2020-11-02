//Source used: Live coding API by Laurens Aarnoudse
const fetch = require('node-fetch'); //requires fetch library for node.js
const d3 = require("d3");
const express = require('express');         //use express to render stuff
const app = express();
const port = 8080;                          //set up a localhost port


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

let cleanedDataObjects = compare(data1, data2)      //calls compare function, and logs result when ready
.then(result => {     
    // console.log(result);
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
    const result1 = await array1;       //waits for incoming data
    const result2 = await array2;
    let compiled = [];

    result1.forEach(itemArr1 => {       //loops over each item in result1
        
        result2.forEach(itemArr2 => {   //loops over each item in result2 to check same area id's
            
            if (itemArr1.areaid === itemArr2.areaid) {  

                let location = [itemArr2.location.latitude, itemArr2.location.longitude];   //saves location to an array

                compiled.push({             //pushes an object into array 'compiled'
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


app
    .set('view engine', 'ejs')              //initialize ejs
    .use(express.static('./static'))        //initialize static folder
    .use('/', home);                        //call function home() when on localhost

async function home(req, res, next) {       //async function, it needs to wait for data
    let renderData = await cleanedDataObjects;
    res.render('index.ejs', {data: renderData});    //renders clean.ejs, with the data from allHobbies array
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));  //puts rendered data at localhost:8080/clean
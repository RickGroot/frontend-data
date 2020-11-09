export async function compare(array1, array2) { //async function that awaits the promised arrays
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
                    capacity: parseFloat(itemArr1.capacity), //parseFloat() turns a string containing a number to a number type
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
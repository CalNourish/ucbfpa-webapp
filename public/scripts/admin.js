'use strict';

const REF = firebase.database().ref('/info/')

// Format of days in the database.... it is this way for some reason........
const DAYS_TIMES = {
    '-sunday': '',
    '-monday': '',
    '-tuesday': '', 
    '-wednesday': '',
    '-thursday': '',
    '-friday': '',
    '-saturday': ''
}

let convertTime = time => {
    if (time === 'Closed' || time === 'closed') {
        return 'Closed'
    }
    let [start, end] = time.split('-')
    return splitAndConvertTime(start) + ' - ' + splitAndConvertTime(end)
} 

let splitAndConvertTime = time => {
    let [hr, mn] = time.split(':');
    let hour = (((parseInt(hr) + 11) % 12) + 1);
    let period = parseInt(hr) >= 12 ? 'PM' : 'AM'
    return `${hour}:${mn} ${period}`
}


// Get all info 
let info = async () => {
    // Get all times for the days 
    return await REF.once("value").then(snapshot => snapshot.val());
}

function adminPageSetup() {
    info().then(value => {
        for (let key in DAYS_TIMES) {
            if (key in value) {
                DAYS_TIMES[key] = value[key]["24hours"];
                let time = convertTime(value[key]["24hours"])
                document.getElementById(key).innerText = time;
            }
        }
    });
}


window.onload = adminPageSetup

















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
        return ['Closed', null]
    }
    let [start, end] = time.split('-')

    return [splitAndConvertTime(start), splitAndConvertTime(end)]
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
                // slice off the '-'
                document.getElementById(key.slice(1)).children[2].innerText= time[0]
                document.getElementById(key.slice(1)).children[3].innerText = time[1]
            }
        }
    });


    let day = new Date().getDay()
    document.getElementById("pantry-hours").children[day].children[0].innerText = "TODAY"
}


window.onload = adminPageSetup

















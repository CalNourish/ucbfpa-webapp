'use strict';
$(document).ready(function() {
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
                let open = document.getElementById(key.slice(1)).children[1].children[0];
                let closed = document.getElementById(key.slice(1)).children[2].children[0];
                if (open) {
                    open.value = time[0]
                }

                if (closed) {
                    closed.value = time[1]
                }
            }
        }
    });
}


$('.timepicker').timepicker({
    'noneOption': [
        {'label': 'Closed',
        'value': 'Closed'
        }
    ],
    'lang': {
        am: ' AM',
        pm: ' PM'
    },
    'timeFormat': 'h:i A',
    'scrollDefault': 'now',
    'forceRoundTime': true,
    'step': 15
});

$('.timepicker').on('timeFormatError', function() {

})










window.onload = adminPageSetup

});

















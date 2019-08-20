'use strict';
$(document).ready(function() {

let defaultHoursForm = document.getElementById("default-hours-form")
// REAL DATA
const REF = firebase.database().ref('/info/')

// TEST DATA - test the hours functionality 
// const REF = firebase.database().ref('/testInfo/')

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

// Days array
var weekday = new Array(7);
weekday[0] =  "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";




let convertTime = time => {
    if (time != 'Closed' ) {
        let [start, end] = time.split('-')
        return [splitAndConvertTime(start), splitAndConvertTime(end)]
    }
    return ['Closed', null]
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
    var day = new Date();
    info().then(value => {
        for (let key in DAYS_TIMES) {
            if (key in value) {
                DAYS_TIMES[key] = convertTime(value[key]["24hours"]);
            }
        }
        let hoursTable = document.getElementById("pantry-hours")
        let rows = hoursTable.querySelectorAll("tr");
        for (let i = 0; i < 7; i++) {
            let currentRow = rows[i].children
            let currentDay = weekday[(day.getDay() + i) % 7];
            // Find in the dictionary because we named it in weird way in the actual db
            let time = DAYS_TIMES["-" + currentDay.toLowerCase()]
            currentRow[0].textContent = currentDay
            let open = currentRow[1].children
            let closed = currentRow[2].children
            if (time[0] == "Closed") {
                open[0].value = time[0]
                closed[0].value = ''
            } else {
                if (open) {
                    open[0].value = time[0]
                }
                if (closed) {
                    closed[0].value = time[1]
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
        am: 'AM',
        pm: 'PM'
    },
    'timeFormat': 'g:i A',
    'scrollDefault': 'now',
    'forceRoundTime': true,
    'disableTextInput': true,
    'step': 15
});

const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(' ');
  
    let [hours, minutes] = time.split(':');
  
    if (hours === '12') {
      hours = '00';
    }
  
    if (modifier === 'PM') {
      hours = parseInt(hours) + 12;
    }
  
    return `${hours}:${minutes}`;
  }

const validateHours = (open, closed) => {
    let [openHours, openMinutes] = open.split(':')
    let [closedHours, closedMinutes] = closed.split(':')
    
    // Check that open is before close
    if (parseInt(openHours) < parseInt(closedHours)) {
        return true;
    } else if (parseInt(openHours) == parseInt(closedHours) && parseInt(openMinutes) < parseInt(closedMinutes)) {
        return true;
    } else {
        return false;
    }
}



function changeDefaultHours(e) {
    e.preventDefault()
    let validHours = true;
    var day = new Date();
    for (let key in DAYS_TIMES) {
        DAYS_TIMES[key] = {
            '24hours': '',
            '12hours': ''
        }
    }
    let hoursTable = document.getElementById("pantry-hours")
    let rows = hoursTable.querySelectorAll("tr");
    for (let i = 0; i < 7; i++) {
        let currentRow = rows[i].children
        let currentDay = weekday[(day.getDay() + i) % 7];
        let open = currentRow[1].children
        let close = currentRow[2].children
        let open12 = open[0].value
        let close12 = close[0].value
        let open24 = '';
        let close24 = '';

        // Check for closed and make conversions
        if (open12 == "Closed" || open12 == '') {
            close[0].value = ""
            open24 = "Closed"
        } else {
            open24 = convertTime12to24(open12)
        }
        if (close12 == "Closed" || close12 == '') {
            open[0].value= "Closed"
            close[0].value = ""
            close24 = "Closed"
        } else {
            close24 = convertTime12to24(close12)
        }
        // Make sure hours are valid
        if (open24 != "Closed" && close24 != "Closed") {
            if (!validateHours(open24, close24)) {
                validHours = false;
                break;
            }
        }


        // Set in db
        if (open24 == "Closed" || close24 == "Closed") {
            DAYS_TIMES["-" + currentDay.toLowerCase()]['24hours'] = "Closed"
            DAYS_TIMES["-" + currentDay.toLowerCase()]['12hours'] = "Closed"
        } else {
            DAYS_TIMES["-" + currentDay.toLowerCase()]['24hours'] = open24 + " - " + close24
            DAYS_TIMES["-" + currentDay.toLowerCase()]['12hours'] = open12 + " - " + close12
        }
    }   
    if (inputChanged) {
        if (validHours) {
            REF.update(DAYS_TIMES)
            .then(function() {
                toastr.info('Hours set')
            })
            .catch(function(error) {
                console.error('Error updating hours', error);
                toastr.error(error, "Error setting hours")
            });
        } else {
            toastr.error("Invalid Hours")
        }
    } else {
        toastr.info("Hours did not change")
    }


}

// Check is input has changed
let inputChanged = false;
// Check for input changes
$("td > input").on("change", () => {
    inputChanged = true;
})

try {
    defaultHoursForm.addEventListener('submit', changeDefaultHours);    


adminPageSetup()

// Toast options
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "showDuration": "200",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "2000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
} catch (e) {
    console.log(e);
}


});

















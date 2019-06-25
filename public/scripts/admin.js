'use strict';
$(document).ready(function() {

let defaultHoursForm = document.getElementById("default-hours-form")
// REAL DATA
// const REF = firebase.database().ref('/info/')

// TEST DATA
const REF = firebase.database().ref('/testInfo/')

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
    info().then(value => {
        for (let key in DAYS_TIMES) {
            if (key in value) {
                DAYS_TIMES[key] = value[key]["24hours"];
                let time = convertTime(value[key]["24hours"])
                // slice off the '-'
                let open = document.getElementById(key.slice(1)).children[1].children[0];
                let closed = document.getElementById(key.slice(1)).children[2].children[0];
                if (time[0] == "Closed") {
                    $('#' + key.slice(1)).find(".pantry-open").find(".timepicker").val(time[0])
                    $('#' + key.slice(1)).find(".pantry-closed").find(".timepicker").val()
                } else {
                    if (open) {
                        $('#' + key.slice(1)).find(".pantry-open").find(".timepicker").val(time[0])
                    }
    
                    if (closed) {
                        $('#' + key.slice(1)).find(".pantry-closed").find(".timepicker").val(time[1])
                    }
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
    'timeFormat': 'g:i A',
    'scrollDefault': 'now',
    'forceRoundTime': true,
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



function changeDefaultHours(e) {
    for (let key in DAYS_TIMES) {
            DAYS_TIMES[key] = {}
            let open12 = $('#' + key.slice(1)).find(".pantry-open").find(".timepicker").val()
            let close12 = $('#' + key.slice(1)).find(".pantry-closed").find(".timepicker").val()
            let open24 = '';
            let close24 = '';
            if (open12 == "Closed" || open12 == '') {
                open24 = "Closed"
            } else {
                open24 = convertTime12to24(open12)
            }
            if (close12 == "Closed" || close12 == '') {
                console.log("in here" + close12)
                close24 = "Closed"
            } else {
                close24 = convertTime12to24(close12)
            }

            if (open24 == "Closed" || close24 == "Closed") {
                DAYS_TIMES[key]['24hours'] = "Closed"
            } else {
                DAYS_TIMES[key]['24hours'] = open24 + " - " + close24
            }
            
        }


    REF.update(DAYS_TIMES)
    .then(function() {
        console.log(DAYS_TIMES)
    })
    .catch(function(error) {
        console.error('Error updating hours', error);
    
    });
}

// $(".timepicker").on('change', function() {
//     console.log($(this).val())
// })

defaultHoursForm.addEventListener('submit', changeDefaultHours);    

window.onload = adminPageSetup

});

















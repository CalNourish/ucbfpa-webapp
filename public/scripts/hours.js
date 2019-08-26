'use strict';
$(document).ready(function() {

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

//Dictionary for the categories that are restocked each day
const RESTOCK_INDICATORS = {
  '-sunday': {},
  '-monday': {},
  '-tuesday': {}, 
  '-wednesday': {},
  '-thursday': {},
  '-friday': {},
  '-saturday': {}
}

//Dictionary for emojis for each resotck category
const EMOJIS = {
  '-none':'',
  'bread': '🥖',
  'eggs': '🥚',
  'milk': '🥛', 
  'prepared': '🥡',
  'produce': '🥦',
  'shelf': '🥫',
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

function getHours() {
    var day = new Date();
    info().then(value => {
        for (let key in DAYS_TIMES) {
          if (key in value) {
              DAYS_TIMES[key] = convertTime(value[key]["24hours"])
              RESTOCK_INDICATORS[key]['restock'] = value[key]["restock"];

          }
        }
        let hoursTable = document.getElementById("hours-data")
        let rows = hoursTable.querySelectorAll("tr");
        for (let i = 0; i < 7; i++) {
          let currentRow = rows[i].children
          let currentDay = weekday[(day.getDay() + i) % 7];
          // Find in the dictionary because we named it in weird way in the actual db
          let time = DAYS_TIMES["-" + currentDay.toLowerCase()]
          let restock_today = RESTOCK_INDICATORS["-" + currentDay.toLowerCase()]['restock']

          currentRow[0].textContent = currentDay
          if (time[0] == "Closed") {
            currentRow[1].textContent = "Closed"
          } else {
            currentRow[1].textContent = time[0] + " - " + time[1]
          }

          for (let j = 0; j < Object.keys(restock_today).length; j++) { 
            // If the category gets restocked today, append the emoji to today's row.
            if (restock_today[Object.keys(restock_today)[j]] == 1) {
              let emojiName = EMOJIS[Object.keys(restock_today)[j]];
              let emoji = $('<td class="hours">' + emojiName + '</td>');
              emoji.appendTo('#day' + i);
            }
        }
        }
    });
}


getHours();

});

















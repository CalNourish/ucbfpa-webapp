'use strict';
const ALL_ITEMS_LS = []
const FULL_TABLE_LS = []
let current_table_LS = []
let current_items_LS = []

$(document).ready(function() {

let defaultHoursForm = document.getElementById("default-hours-form")
let addCategoryButton = document.getElementById("add-category")
const INFO_REF = firebase.database().ref('/info/')
const CATEGORIES_REF = firebase.database().ref('/category/')
var currentCategories = [];
let lowStockTable = document.getElementById("low-stock-table")

// REAL DATA
const TABLE_SELECTOR_LS = $(".low-stock-table tbody")
const REF_LS = firebase.database().ref('/inventory')

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

//Dictionary to hold the categories that are restocked each day
const RESTOCK_INDICATORS = {
    '-sunday': {},
    '-monday': {},
    '-tuesday': {},
    '-wednesday': {},
    '-thursday': {},
    '-friday': {},
    '-saturday': {}
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
    return await INFO_REF.once("value").then(snapshot => snapshot.val());
}

// Get categories
let categories = async () => {
    return await CATEGORIES_REF.once("value").then(snapshot => snapshot.val());
}

REF_LS.once("value", snapshot => {
  let res = snapshot.val()
  for (let item in res) {
    let currentItem = res[item];
    let category_dict = currentItem.categoryName
    if (currentItem.count <= currentItem.lowStock) {
      let categories = []
      for (let category in category_dict) {
        categories.push(category)
      }
      ALL_ITEMS_LS.push([currentItem.itemName, currentItem.barcode, currentItem.count, categories, currentItem.lowStock])
    }
  }

  current_items_LS = ALL_ITEMS_LS
  current_items_LS.forEach((item) => {
    FULL_TABLE_LS.push(low_stock_table_row(item[0], item[2], item[1], item[4]))
  })
  // Append full table to dom
  current_table_LS = FULL_TABLE_LS
  TABLE_SELECTOR_LS.append(current_table_LS);

  // Sort table on click
  $(".table-header-ls").on("click", function() {
    sortTableByKey(TABLE_SELECTOR_LS, $(this).data("sort-by"), low_stock_table_row)
    searchItem()
  });
});




function adminPageSetup() {
    // Uncomment below to make days rotate with the current day on top
    // var day = new Date();

    categories().then(value => {
        Object.keys(value).forEach((category) => {
            addCategory(category)
       });
    });

    info().then(value => {
        for (let key in DAYS_TIMES) {
            if (key in value) {
                // console.log(value[key]["24hours"]);
                DAYS_TIMES[key] = convertTime(value[key]["24hours"]);
                RESTOCK_INDICATORS[key]['restock'] = value[key]["restock"];
            }
        }
        let hoursTable = document.getElementById("pantry-hours")
        let rows = hoursTable.querySelectorAll("tr");
        for (let i = 0; i < 7; i++) {
            let currentRow = rows[i].children
            let currentDay = weekday[i];

            // Uncomment below to make days rotate with the current day on top
            // let currentDay = weekday[(day.getDay() + i) % 7];

            // Find in the dictionary because we named it in weird way in the actual db
            let time = DAYS_TIMES["-" + currentDay.toLowerCase()]
            let restock_today = RESTOCK_INDICATORS["-" + currentDay.toLowerCase()]['restock']

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

            // Make checkboxes for the number of restock indicators in the database. Skip displaying the "None" category.
            for (let j = 1; j < Object.keys(restock_today).length; j++) {
                // Ensure each checkbox element has a unique id (day + _ + position).
                let id_string = 'id = ' + i + '_' + j;
                var checkbox = $(
                    '<td>\
                        <div class="form-check col-4"> \
                            <label class="form-check-label" vertical-align=middle> \
                                <input ' + id_string + ' class="form-check-input" type="checkbox" value="" vertical-align=middle> \
                                <span class="form-check-sign"> \
                                    <span class="check"></span> \
                                </span> \
                            </label> \
                        </div> \
                    </td>');
                checkbox.appendTo('#day' + i);
                if (restock_today[Object.keys(restock_today)[j]] == 1) {
                    let toCheck = document.getElementById(i + "_" + j);
                    toCheck.checked = true;
                }
            }
        }
    });
}


// Set up categories 
function addCategory(category) {
    let categoryListTable = document.getElementById("category-list-table");

    currentCategories.push(category);

    let tableItem = document.createElement("tr");
    let categoryElement = document.createElement("td");
    categoryElement.textContent = category.charAt(0).toUpperCase() + category.slice(1); 

    var deleteCategoryElement = document.createElement("td");
    var deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa", "fa-trash-o", "fa-6");
    deleteCategoryElement.id = category;
    deleteCategoryElement.onclick = async function() {
        const category = this.id;
        if (!confirm('Delete category called ' + category + '?')) {
            return;
        }
        var div = this.parentElement;
        div.style.display = "none";
        let toRemove = currentCategories.indexOf(category);
        if (toRemove > -1) {
            currentCategories.splice(toRemove, 1);
        }
        await firebase.database()
            .ref('/inventory')
            .once("value")
            .then(async function(inventory) {
                var inventoryTable = await inventory.val();
                deleteCategory(inventoryTable, category)

                return firebase.database() 
                .ref('/inventory')
                .update(inventoryTable)
                .catch(function(error) {
                    console.error('Error writing item to /inventory/', error);
                    toastr.error(error, "Error updating categories")
                    })
                .then(() => {
                  toastr.info("Categories successfully updated");
                  }
                );
            });
        await firebase.database()
            .ref('/category/' + category)
            .remove();
    }
    deleteCategoryElement.appendChild(deleteIcon);

    tableItem.appendChild(categoryElement);
    tableItem.appendChild(deleteCategoryElement)

    categoryListTable.appendChild(tableItem);
}

function deleteCategory(table, category) {
    Object.values(table).forEach(value => {
        let categoryList = value.categoryName;
        if (Object.keys(categoryList).includes(category)) {
            delete categoryList[category];
        }
    })
}

function addNewCategory(e) {
    e.preventDefault()
    let newCategory = document.getElementById("category-input").value;
    if (!confirm('Add new category called ' + newCategory + '?')) {
        return;
    }
    addCategory(newCategory);
    let toWrite = categoryForFirebase(newCategory);
    firebase.database().ref('/category/' + newCategory)
        .update(toWrite)
        .then(() => {
            document.getElementById("category-input").value = ''
            toastr.info("Categories successfully updated");
    })
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
    // Uncomment below to make days rotate with the current day on top
    // var day = new Date();

    // Format dictionary for db push
    for (let key in DAYS_TIMES) {
        DAYS_TIMES[key] = {
            '24hours': '',
            '12hours': '',
            'restock': {}
        }
    }
    let hoursTable = document.getElementById("pantry-hours")
    let rows = hoursTable.querySelectorAll("tr");
    for (let i = 0; i < 7; i++) {
        let currentRow = rows[i].children
        let currentDay = weekday[i];

        // Uncomment below to make days rotate with the current day on top
        // let currentDay = weekday[(day.getDay() + i) % 7];

        let open = currentRow[1].children
        let close = currentRow[2].children
        let open12 = open[0].value
        let close12 = close[0].value
        let open24 = '';
        let close24 = '';
        let restock_today = RESTOCK_INDICATORS["-" + currentDay.toLowerCase()]['restock']

        // Update restock indicators table with the checked boxes
        let boxes_checked = 0;
        for (let j = 1; j < Object.keys(restock_today).length; j++) {
            if (document.getElementById(i + '_' + j).checked) {
                boxes_checked++;
            }
            if (document.getElementById(i + '_' + j).checked && restock_today[Object.keys(restock_today)[j]] === 0) {
                //update appropriate restock indicators in RESTOCK_INDICATORS dictionary
                restock_today[Object.keys(restock_today)[j]] = 1;
                inputChanged = true;
            } else if (!document.getElementById(i + '_' + j).checked && restock_today[Object.keys(restock_today)[j]] === 1) {
                restock_today[Object.keys(restock_today)[j]] = 0;
                inputChanged = true;
            }
        }
        if (boxes_checked == 0) {
            restock_today[Object.keys(restock_today)[0]] = 1;
        } else {
            restock_today[Object.keys(restock_today)[0]] = 0;
        }

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
                currentRow[1].classList.add("invalid-hours")
                currentRow[2].classList.add("invalid-hours")
                validHours = false;
            }
        }

        if (validHours) {
            if (open24 == "Closed" || close24 == "Closed") {
                DAYS_TIMES["-" + currentDay.toLowerCase()]['24hours'] = "Closed"
                DAYS_TIMES["-" + currentDay.toLowerCase()]['12hours'] = "Closed"
            } else {
                DAYS_TIMES["-" + currentDay.toLowerCase()]['24hours'] = open24 + " - " + close24
                DAYS_TIMES["-" + currentDay.toLowerCase()]['12hours'] = open12 + " - " + close12
            }
            // Transfer new info from RESTOCK_INDICATORS to DAYS_TIMES for database push.
            DAYS_TIMES["-" + currentDay.toLowerCase()]['restock'] = restock_today
        }
    }
    if (inputChanged) {
        if (validHours) {
            INFO_REF.update(DAYS_TIMES)
            .then(function() {
                toastr.info('Hours and restock indicators set')
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
$("td > input").on("change", (input) => {
    inputChanged = true;

    // Remove error background color if present
    let row = $(input)[0].target.parentNode.parentNode.children
    let open = row[1]
    let closed = row[2]
    open.classList.remove("invalid-hours")
    closed.classList.remove("invalid-hours")
})



defaultHoursForm.addEventListener('submit', changeDefaultHours);    
addCategoryButton.addEventListener('click', addNewCategory);

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


});

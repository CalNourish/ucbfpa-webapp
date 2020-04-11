'use strict'

let last_sort_key = null;
let sort_order = null;

// Create item object
function Item(name, barcode, count, categories, is_favorite=false) {
  this.name = name;
  this.barcode = barcode;
  this.count = count;
  this.categories = categories;
  this.is_favorite = is_favorite; // true or false
}

// Custom comparison function to pass to `.sort`
function compareByKey(key, order="asc") {
  $(".sorting-icon").addClass("inactive")
                    .removeClass("active")
                    .css("visibility", "visible")
  if (last_sort_key == key) {
    $(`.table-header[data-sort-by=${key}] .down`).removeClass("inactive").addClass("active")
    $(`.table-header[data-sort-by=${key}] .up`).css("visibility", "hidden")
    order="desc"
    sort_order="desc"
    last_sort_key = null
  } else {
    $(`.table-header[data-sort-by=${key}] .up`).removeClass("inactive").addClass("active")
    $(`.table-header[data-sort-by=${key}] .down`).css("visibility", "hidden")
    sort_order="asc"
    last_sort_key = key
  }
  return function(a,b) {
    // check that the object has the property
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      return 0
    }

    // check if comparing strings or numbers, and standardize
    let comparison, a_value, b_value = [0, null, null];
    if (key == 'count') {
      a_value = parseInt(a[key])
      b_value = parseInt(b[key])
      comparison = a_value - b_value
    } else {
      a_value = a[key].toUpperCase()
      b_value = b[key].toUpperCase()
      if (a_value > b_value) {
        comparison = 1
      } else if (a_value < b_value) {
        comparison = -1
      }
    } 

    // flip order if descending
    comparison = order === 'desc' ? comparison * -1 : comparison;
    return comparison
  }
}

function sortTableByKey(table, key, table_row_function) {
  table.empty()
  current_table = []
  current_items = current_items.sort(compareByKey(key))
  current_items.forEach((item) => {
    current_table.push(table_row_function(item.name, item.count, item.barcode))
  })
  table.append(current_table)
}
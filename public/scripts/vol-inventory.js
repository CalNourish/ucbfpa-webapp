'use strict';
// Global Variables
const ALL_ITEMS = []
const FULL_TABLE = []
let current_table = []
let current_items = []

let sort_key = null;
let sort_order = null;

// Create item object
function Item(name, barcode, count, categories) {
  this.name = name;
  this.barcode = barcode;
  this.count = count;
  this.categories = categories;
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

function sortTableByKey(table, key) {
  table.empty()
  current_table = []
  current_items = current_items.sort(compareByKey(key))
  current_items.forEach((item) => {
    current_table.push(volunteer_table_row(item.name, item.count, item.barcode))
  })
  table.append(current_table)
}

$(document).ready(function() {
  // Selectors
  const TABLE_SELECTOR = $(".inventory-table tbody")

  // connect inventory
  const REF = firebase.database().ref('/inventory')

  // initialize data 
  REF.once("value", snapshot => {
    let res = snapshot.val()
    for (let item in res) {
      let currentItem = res[item];
      let category_dict = currentItem.categoryName
      let categories = []
      for (let category in category_dict) {
        categories.push(category)
      }
      ALL_ITEMS.push(new Item(currentItem.itemName, currentItem.barcode, currentItem.count, categories))
    }
    current_items = ALL_ITEMS
    current_items.forEach((item) => {
      FULL_TABLE.push(volunteer_table_row(item.name, item.count, item.barcode))
    })
    // Append full table to dom
    current_table = FULL_TABLE
    TABLE_SELECTOR.append(current_table);
  });

  // watch for data changes while page is open
  REF.on("child_changed", snapshot => {
    let res = snapshot.val()
    let item = document.querySelector(`[data-itemid='${res.barcode}']`)
    // If item is currently rendered
    if (item) {
      item.textContent = res.count;
    }
  })

  // Sort table on click
  $(".table-header").on("click", function() { 
    sortTableByKey(TABLE_SELECTOR, $(this).data("sort-by"))
  });

  // Clear page and select items by category
  $(".list-group-item.category-item").click(function() {
    let selected = $(this).data("item")
    $(".list-group-item.category-item").removeClass("active")
    $(`[data-item=${selected}`).addClass("active")
    showCategory(selected);
  });

  function showCategory(selected) {

    TABLE_SELECTOR.empty();
    current_table = [];
    current_items = [];
    $("#selected-category").text(selected.charAt(0).toUpperCase() + selected.slice(1))
    if (selected != 'all') {
      ALL_ITEMS.forEach((item) => {
        for (let i = 0; i < item.categories.length; i++) {
          if (item.categories[i] == selected) {
            current_items.push(item)
            current_table.push(volunteer_table_row(item.name, item.count, item.barcode))
            break;
          }
        }
      })
    } else {
      current_items = ALL_ITEMS
      current_table = FULL_TABLE
    }
    // update DOM
    TABLE_SELECTOR.append(current_table);
    searchItem()
    sortTableByKey(last_sort_key, sort_order)
  };
});

function searchItem() {
  // Declare variables
  var input, filter, items, li, a, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  items = document.getElementById("table-items");
  li = items.getElementsByTagName('tr');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function openAddModal() {
  addItemModal.style.display = 'block';
}

function closeAddModal() {
  addItemModal.style.display = 'none';
}

function openEditModal(barcode) {
  editItemModal.style.display = 'block';
  if (barcode) {
      loadItemIntoEditForm(barcode);
  }
}

function closeEditModal() {
  editItemModal.style.display = 'none';
}

function standardizeName(itemName) {
  var newName = itemName;
  if (itemName.length > 20) {
    var newName = itemName.slice(0, 20) + "...";
  }
  return newName;
}



function setOutOfStock(itemName, barcode) {
  if (confirm("Set " + itemName + " to Out of Stock?")) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
      var itemID = barcodesTable.val()[barcode];
      firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
        var item = inventoryTable.val();
        updateTo(item.itemName, item.barcode, item.cost, "0", item.categoryName);
      });
    });
  }
}

function goToEditItem(barcode) {
  openEditModal(barcode);
}

var addItemModal = document.getElementById('addItemModal');
var editItemModal = document.getElementById('editItemModal');
var modalContent = document.getElementById('modalContent');
var modalBtn = document.getElementById('modalBtn');
var closeBtn = document.getElementById('closeBtn');

document.onclick = function(e){
  if(e.target.id == 'addItemModal'){
    closeAddModal();
  } else if (e.target.id == 'editItemModal') {
    closeEditModal();
  } else {
    return;
  }
};

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


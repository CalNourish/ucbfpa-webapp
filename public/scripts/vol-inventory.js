'use strict';
var scrollPosY = 0;
var scrollPosX = 0;
// Global Variables
const ALL_ITEMS = []
const FULL_TABLE = []
let current_table = []
let current_items = []

$(document).ready(function() {
  // Selectors
  const TABLE_SELECTOR = $(".inventory-table tbody")

  // lists for appending to DOM

  let fullTable = [];
  let sidebar = [];
  let dropdown = [];
  let editItemCheckboxes = [];
  let addItemCheckboxes = [];

  // Generates sidebar, dropdown menu, and checkboxes from category list 

  const categoryRef = firebase.database().ref('/category')
  categoryRef.once("value", snapshot => {
    let res = snapshot.val();

    Object.keys(res).forEach((category) => {
      let upperCaseCategory = category.charAt(0).toUpperCase() + category.slice(1)
      sidebar.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="list" data-item="${category}" href="#" role="tab">${upperCaseCategory}</a>`)
      dropdown.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="dropdown" data-item="${category}" href="#" role="tab">${upperCaseCategory}</a>`)
      addItemCheckboxes.push(`
        <div class="form-check col-4">
          <label class="form-check-label">
            <input id="${category}" class="form-check-input" type="checkbox" value="">${upperCaseCategory}
            <span class="form-check-sign">
              <span class="check"></span>
            </span>
           </label>
          </div>
      `)
      editItemCheckboxes.push(`
      <div class="form-check col-4">
        <label class="form-check-label">
          <input id="edit${category}" class="form-check-input" type="checkbox" value="">${upperCaseCategory}
          <span class="form-check-sign">
            <span class="check"></span>
          </span>
         </label>
        </div>
    `)
    });
    
    // append to dom 
  
    $(".list-group").append(sidebar);
    $(".dropdown-menu").append(dropdown);
    $("#add-item-checkboxes").append(addItemCheckboxes);
    $("#edit-item-checkboxes").append(editItemCheckboxes);
  })

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
    sortTableByKey(TABLE_SELECTOR, $(this).data("sort-by"), volunteer_table_row)
    searchItem()
  });

  // Clear page and select items by category
  $(".list-group").on('click', ".list-group-item", selectItemsOnCategoryClick);

  function selectItemsOnCategoryClick() {
    let selected = $(this).data('item')
    $('.list-group-item.category-item').removeClass('active')
    $(`[data-item=${selected}`).addClass('active')
    showCategory(selected);
  }

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
    TABLE_SELECTOR.append(current_table).hide()
    setTimeout(() => searchItem(), 10)
    setTimeout(() => TABLE_SELECTOR.show(), 20)
    sortTableByKey(TABLE_SELECTOR, sort_order, volunteer_table_row)
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
      li[i].classList.remove("hidden")
    } else {
      li[i].classList.add("hidden")
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
  scrollPosY = window.pageYOffset;
  scrollPosX = window.pageXOffset;
  if (barcode) {
      loadItemIntoEditForm(barcode);
  }
}

function closeEditModal() {
  window.scrollTo(scrollPosX, scrollPosY)
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
        updateTo(item.itemName, item.barcode, item.cost, "0", item.categoryName, item.packSize, item.lowStock);
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
var packSize = document.getElementById('pack');
var lowStock = document.getElementById('lowStock')
var count = document.getElementById('count');
var unitChoice = document.getElementById('packOption');

// add listeners to update helptext when selecting or modifying quantity
for (var eventType of ['keyup', 'click']) {
  //update the on-page hint when modifyig quantity or clicking to modify quantity
  count.addEventListener(eventType, function() {
    //only update the on-page hint when using packs
    if (unitChoice.selectedOptions[0].innerText == 'Packs') {
      var size = packSize.value;
      var countVal = count.value;
      // if they haven't put in a items/pack yet, use some placeholder
      if (size == ''){
        size = 5;
      }
      // if they haven't put in a number of items yet, use some placeholder
      if (countVal == '') {
        countVal = 3;
      }
      var total = size * countVal;
      document.getElementById('helptext').innerHTML = `Enter estimate if unsure. Example: ${countVal} packs of size ${size} is ${total} items`
    }
  });
}

// update on-page hint when switching back to individual items
unitChoice.addEventListener("change", function() {
  // if using packs
  if (unitChoice.selectedOptions[0].innerText != 'Packs') {
    document.getElementById('helptext').innerHTML = `Enter estimate if unsure. Example: 15`
  }
})

document.onclick = function(e){
  if(e.target.id == 'addItemModal'){
    closeAddModal();
  } else if (e.target.id == 'editItemModal') {
    closeEditModal();
  } else {
    return;
  }
};

// Saves a new item in the inventory database. Used by the add item modal
async function saveNewItem() {  // make this async and await firebase call

  // var itemID = generateItemID();
  var itemName = document.getElementById('itemName').value;
  var barcode = document.getElementById('barcode').value;
  var count = document.getElementById('count').value;
  var packSize = document.getElementById('pack').value;
  var unitChoice = document.getElementById('packOption');
  var lowStock = document.getElementById('lowStock').value;

  // on an empty pack size field
  if (isNaN(parseInt(packSize))) {
    packSize = 1;
  }



  // if using packs, recalculate the count
  if (unitChoice.selectedOptions[0].innerText == 'Packs') {
    count = packSize * count;
  }

  // Generate hashmap that has list of categories for this item.
  var categoryName = {};
  const categoryRef = firebase.database().ref('/category')
  categoryRef.once("value", snapshot => {
    let res = snapshot.val();
    Object.keys(res).forEach((category) => {
      var checkbox = document.getElementById(category);
      if (checkbox !== null && checkbox.checked) {
        categoryName[category] = category;
      }
    });
  });


  //check if barcode already exists in database
  firebase.database().ref('/inventory/').once('value').then((data) => {
    var barcodesFromDb = data.val();
    var barcodes = [];
    for (const [bc] of Object.entries(barcodesFromDb)) {
      barcodes.push(bc);
    }
    var isDuplicate = (barcodes.indexOf(barcode) >= 0);
    if (isDuplicate === true) {
      alert('An item with this barcode already exists.');
      return;
    } else {
        // Generate hashmap that has list of categories for this item.
        var categoryName = {};
        categoryRef.once("value", snapshot => {
          let res = snapshot.val();
          Object.keys(res).forEach((category) => {
            var checkbox = document.getElementById(category);
            if (checkbox !== null && checkbox.checked) {
              categoryName[category] = category;
            }
          });
          if (JSON.stringify(categoryName) === '{}') {
            alert("You must check at least one category.");
            return;
          }
        });
        updateTo(itemName, barcode, count, categoryName, packSize, true);
        return;
    }
  });
}

  // used by the edit item modal
function updateExistingItem() {
  var itemName = document.getElementById('editItemName').value;
  var barcode = document.getElementById('editBarcode').value;
  var count = document.getElementById('editCount').value;
  var packSize = document.getElementById('editPackSize').value;
  var lowStock = document.getElementById('editLowStock').value;

  if (isNaN(parseInt(packSize))) {
    packSize = 0;
  }

  // Generate hashmap that has list of categories for this item.

  const categoryRef = firebase.database().ref('/category')
  categoryRef.once("value", snapshot => {
    let res = snapshot.val();
    var categoryName = {};

    Object.keys(res).forEach((category) => {
      var checkbox = document.getElementById('edit' + category);
      if (checkbox !== null && checkbox.checked) {
        categoryName[category] = category;
      }
    });
    if (JSON.stringify(categoryName) === '{}') {
      alert("You must check at least one category.");
      return;
    }
    console.log(categoryName);    
    return updateTo(itemName, barcode, count, categoryName, packSize);

  });
}

function loadItemIntoEditForm(barcode) {
  return firebase.database()
    .ref('/inventory/' + barcode)
    .once('value')
    .then(function(inventoryTable) {
      var item = inventoryTable.val();
      document.getElementById('editItemName').value = item.itemName;
      document.getElementById('editBarcode').value = item.barcode;
      document.getElementById('editCount').value = item.count;
      document.getElementById('editPackSize').value = item.packSize;
    
      const categoryRef = firebase.database().ref('/category')
      categoryRef.once("value", snapshot => {
        let res = snapshot.val();
        Object.keys(res).forEach((category) => {
          var checkbox = document.getElementById('edit' + category);
          if (typeof item.categoryName[category] !== "undefined" && checkbox !==null) {
            checkbox.checked = true;
          } else {
            checkbox.checked = false;
          };
        });
        document.getElementById("edit-item-form-barcode").reset();
      });
  });
}

// Triggered when the add new item form is submitted.
function onAddItemFormSubmit(e) {
  e.preventDefault();
  saveNewItem();
}

// Triggered when the edit item form is submitted.
function onEditItemFormSubmit(e) {
  e.preventDefault();
  updateExistingItem();
}

// Triggered when the add new item form is submitted.
function onEditBarcodeItemFormSubmit(e) {
  e.preventDefault();
  loadItemIntoEditForm(editItemBarcodeElement.value);
}

// Shortcuts to DOM Elements.
var addItemFormElement = document.getElementById('add-item-form');
var editItemFormElement = document.getElementById('edit-item-form');
var editItemFormBarcodeElement = document.getElementById('edit-item-form-barcode');
var editItemBarcodeElement = document.getElementById('editItemBarcode');
var quantity = document.getElementById("editCount")
var quantityLabel= document.getElementById("quantity-label")

// Saves message on form submit.
addItemFormElement.addEventListener('submit', onAddItemFormSubmit);
editItemFormElement.addEventListener('submit', onEditItemFormSubmit);
editItemFormBarcodeElement.addEventListener('submit', onEditBarcodeItemFormSubmit);


function updateTo(itemName, barcode, count, categoryName, packSize, lowStock, newItem=false) {
  if (packSize == undefined){
     packSize = 1;
   }
   if (isNaN(parseInt(lowStock))) {
     lowStock = -1;
   }

  // Save to inventory this new item to the generated item ID.
  var itemInfo = {
    createdBy: getUserName(),
    itemName: itemName,
    barcode: barcode,
    count: count,
    categoryName: categoryName,
    packSize: packSize,
    lowStock: lowStock
  }
  if (newItem) {
    return firebase.database()
    .ref('/inventory/' + barcode)
    .update(itemInfo)
    .catch(function(error) {
        console.error('Error writing item to /inventory/' + barcode, error);
        toastr.error(error, "Error adding new item")
        })
    .then(() => {
      document.getElementById("add-item-form").reset();
      toastr.info("New item successfully added");
      }
    );
  } else {
    return firebase.database() 
      .ref('/inventory/' + barcode)
      .update(itemInfo)
      .catch(function(error) {
          console.error('Error writing item to /inventory/' + barcode, error);
          toastr.error(error, "Error adding new item")
          })
      .then(() => {
        document.getElementById("edit-item-form").reset();
        toastr.info("Item successfully edited");
        }
      );
  }
}

// focus on quantity when clicking
var focusOn;
function focusOnQuantity() {
  quantity.style.fontWeight = 'bold'
  quantityLabel.style.color = '#C4820E'
  // Clear if already set
  clearTimeout(focusOn)
  focusOn = setTimeout(function() {
    quantity.style.fontWeight = 'normal';
    quantityLabel.style.color = '#AAAAAA'
  }, 2500)
}

function changeCountByInterval(adding) {
  var newCount = 0;
  var interval = parseInt(document.getElementById("edit-interval").value, 10);
  interval = interval ? interval : 0;
  // if using packs
  if (document.getElementById('editUnitOption').selectedOptions[0].innerText == 'Packs') {
    var packSize = parseInt(document.getElementById('editPackSize').value, 10);
    if (isNaN(packSize)) {
      packSize = 0;
    }
    interval = interval * packSize;
  }
  var count = document.getElementById("editCount");
  focusOnQuantity()
  if (adding) {
    newCount = parseInt(count.value, 10) + interval < 0 ? 0 : parseInt(count.value, 10) + interval;
  } else {
    newCount = parseInt(count.value, 10) - interval < 0 ? 0 : parseInt(count.value, 10) - interval;
  }
  count.value = newCount;
}

function addToCountByInterval() {
  changeCountByInterval(true)
}

function subtractFromCountByInterval() {
  changeCountByInterval(false)
}


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

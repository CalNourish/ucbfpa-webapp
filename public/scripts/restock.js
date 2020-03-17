'use strict';

var DEFAULT_ITEM_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
var DEFAULT_ITEM_ID_LENGTH = 5;


function barcodeToID(barcode) {
  var itemID;
  firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
    itemID = barcodesTable.val()[barcode];
  });
  return itemID;
}

// Gets an item in the inventory by its itemID.
function getItemByID(itemID) {
  firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
    const result = inventoryTable.val();
    return result;
  });
}

function generateItemID() {
    var itemID = '';
    for (var i = DEFAULT_ITEM_ID_LENGTH; i > 0; --i) {
      itemID += DEFAULT_ITEM_ID_CHARS[Math.floor(Math.random() * DEFAULT_ITEM_ID_CHARS.length)];
    };
    return itemID;
}

function getCategories() {
  return ['grains', 'canned', 'protein', 'frozen', 'snacks', 'sauces', 'spices', 'beverages'];
}
// used by the edit item modal
function updateItem() {
    var itemID = document.getElementById('editItemID').value;
    var itemName = document.getElementById('editItemName').value;
    var barcode = document.getElementById('editBarcode').value;
    var count = document.getElementById('editCount').value;
    var packSize = document.getElementById('editPackSize').value;

    if (isNaN(parseInt(packSize))) {
      packSize = 0;
    }
    
    // Generate hashmap that has list of categories for this item.
    var categoryName = {};
    getCategories().forEach(function(value, index, array) {
      var category = 'edit' + value.charAt(0).toUpperCase() + value.slice(1);
      var checkbox = document.getElementById(category);
      if (checkbox !== null && checkbox.checked) {
        categoryName[value] = value;
      }
    });

    // Save this new item to inventory
    if (JSON.stringify(categoryName) === '{}') {
      alert("You must check at least one category.");
      return;
    }
    return updateTo(itemName, barcode, count, categoryName, packSize);
}

function decrementItem(barcode, amount) { 
    return firebase.database()
      .ref('/inventory/' + barcode)
      .once('value')
      .then(function(inventoryTable) {
        var item = inventoryTable.val();
        var dec = ((parseInt(item.count, 10) - amount) < 0) ? 0 : (parseInt(item.count, 10) - amount);
        updateTo(item.itemName, item.barcode, dec.toString(), item.categoryName, item.packSize);
    });
}

function deleteItem(barcode, itemName) { 
  if (confirm("Delete " + itemName + "?")) {
    firebase.database().ref('/inventory/' + barcode).remove().then(function() {
      window.location.reload();
    });
  }
}

function updateTo(itemName, barcode, count, categoryName, packSize) {
    if (packSize == undefined) packSize = 1; 
    // Save to inventory this new item to the generated item ID.
    var itemInfo = {
      createdBy: getUserName(),
      itemName: itemName,
      barcode: barcode,
      count: count,
      categoryName: categoryName,
      packSize: packSize
    }

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
}

function loadItemIntoEditForm(barcode) { 
    return firebase.database()
      .ref('/inventory/' + barcode)
      .once('value')
      .then(function(inventoryTable) {
        var item = inventoryTable.val();
        loadItemIntoEditForm2(item.itemName, item.barcode, item.count, item.categoryName, item.packSize);
    });
}

function loadItemIntoEditForm2(itemName, barcode, count, categoryName, packSize) {
  document.getElementById('editItemName').value = itemName;
  document.getElementById('editBarcode').value = barcode;
  document.getElementById('editCount').value = count;
  document.getElementById('editPackSize').value = packSize;

  getCategories().forEach(function(value, index, array) {
    var category = value.charAt(0).toUpperCase() + value.slice(1);
    category = 'edit' + category;
    var checkbox = document.getElementById(category);

    if (typeof categoryName[value] !== "undefined" && checkbox !==null) {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    };
  });
}

// Saves a new item in the inventory database. Used by the add item modal
function saveItem() {

  var itemID = generateItemID();
  var itemName = document.getElementById('itemName').value;
  var barcode = document.getElementById('barcode').value;
  var count = document.getElementById('count').value;
  var packSize = document.getElementById('pack').value;
  var unitChoice = document.getElementById('packOption');

  // on an empty pack size field
  if (isNaN(parseInt(packSize))) {
    packSize = 1;
  }

>>>>>>> a9ae34a310c26e1e6d287eecec1cc9ffd6820b61
  // if using packs, recalculate the count
  if (unitChoice.selectedOptions[0].innerText == 'Packs') {
    count = packSize * count;
  }

  // Generate hashmap that has list of categories for this item.
  var categoryName = {};
  getCategories().forEach(function(value, index, array) {
    var checkbox = document.getElementById(value);
    if (checkbox !== null && checkbox.checked) {
      categoryName[value] = value;
    }
  });
    
  //check if barcode already exists in database
  firebase.database().ref('/inventory/').once('value').then((data) => {
    var barcodesFromDb = data.val();
    var barcodes = [];
    for (const [bc, itemID] of Object.entries(barcodesFromDb)) {
      barcodes.push(bc);
    }
    var isDuplicate = (barcodes.indexOf(barcode) >= 0);
    if (isDuplicate === true) {
      alert('An item with this barcode already exists.');
      return;
    } else {
        // Generate hashmap that has list of categories for this item.
        var categoryName = {};
        getCategories().forEach(function(value, index, array) {
          console.log(value);
          var checkbox = document.getElementById(value);
          if (checkbox !== null && checkbox.checked) {
            categoryName[value] = value;
          }
        });

        // Save to inventory this new item to the generated item ID.
        if (JSON.stringify(categoryName) === '{}') {
          alert("You must check at least one category.");
          return;
        }
        var x = updateTo(itemName, barcode, count, categoryName, packSize);
        return;
    }
  });
}

// Triggered when the add new item form is submitted.
function onAddItemFormSubmit(e) {
  e.preventDefault();
  saveItem();
}

// Triggered when the edit item form is submitted.
function onEditItemFormSubmit(e) {
  e.preventDefault();
  updateItem();
}

// Triggered when the add new item form is submitted.
function onEditBarcodeItemFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (checkSignedInWithMessage()) {
    loadItemIntoEditForm(editItemBarcodeElement.value);
  }
  document.getElementById("edit-item-form-barcode").reset();


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

function addToCountByInterval() {
  changeCountByInterval(true)
}

function subtractFromCountByInterval() {
  changeCountByInterval(false)
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
  console.log(document.getElementById('editCount').value);
  var count = document.getElementById("editCount");
  focusOnQuantity()
  if (adding) {
    newCount = parseInt(count.value, 10) + interval < 0 ? 0 : parseInt(count.value, 10) + interval;
  } else {
    newCount = parseInt(count.value, 10) - interval < 0 ? 0 : parseInt(count.value, 10) - interval;
  }
  count.value = newCount;
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
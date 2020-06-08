'use strict';

// used by the edit item modal
function updateExistingItem() {
    var itemName = document.getElementById('editItemName').value;
    var barcode = document.getElementById('editBarcode').value;
    var count = document.getElementById('editCount').value;
    var packSize = document.getElementById('editPackSize').value;

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

function updateTo(itemName, barcode, count, categoryName, packSize, newItem=false) {
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

// Saves a new item in the inventory database. Used by the add item modal
async function saveNewItem() {  // make this async and await firebase call

  // var itemID = generateItemID();
  var itemName = document.getElementById('itemName').value;
  var barcode = document.getElementById('barcode').value;
  var count = document.getElementById('count').value;
  var packSize = document.getElementById('pack').value;
  var unitChoice = document.getElementById('packOption');

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
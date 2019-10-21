'use strict';

var DEFAULT_ITEM_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
var DEFAULT_ITEM_ID_LENGTH = 5;


function getAllUrlParams(url) {

  
}

$(document).ready( function () {
// get query string from url (optional) or window
  var url = window.location.href;
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

// we'll store the parameters here
  var obj = {};

// if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');
    var a = arr[0].split('=');
    var barcode = typeof (a[1]) === 'undefined' ? true : a[1];
    loadItemIntoEditForm(barcode)

  }
  
  // if (barcode) {
  //   loadItemIntoEditForm(barcode);
  // }
});


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

function updateItem() {
    var itemID = document.getElementById('editItemID').value;
    var itemName = document.getElementById('editItemName').value;
    var barcode = document.getElementById('editBarcode').value;
    var count = document.getElementById('editCount').value;

    // Generate hashmap that has list of categories for this item.
    var categoryName = {};
    getCategories().forEach(function(value, index, array) {
      var category = 'edit' + value.charAt(0).toUpperCase() + value.slice(1);
      var checkbox = document.getElementById(category);
      // console.log(checkbox.checked);
      if (checkbox !== null && checkbox.checked) {
        categoryName[value] = value;
      }
    });

    // Connect the generated item ID to this barcode.
    var barcodeToID = {};
    barcodeToID[barcode] = itemID;
    firebase.database().ref('/barcodes/').update(barcodeToID).catch(function(error) {
      console.error('Error writing [' + barcode + ' : ' + itemID + '] to /barcodes/', error);
    });

    // Save to inventory this new item to the generated item ID.
    var itemInfo = {
      createdBy: getUserName(),
      itemName: itemName,
      barcode: barcode,
      count: count,
      categoryName: categoryName,
    }

    if (JSON.stringify(itemInfo.categoryName) === '{}') {
      alert("You must check at least one category.");
      return;
    }

    return firebase.database()
      .ref('/inventory/' + itemID)
      .update(itemInfo)
      .catch(function(error) {
        console.error('Error writing item to /inventory/' + itemID, error);
        toastr.error(error, "Error writing item to inventory")
        })
      .then( () => {
        document.getElementById("edit-item-form").reset();
        toastr.info("Edit Successful");
      }
    );
}

function incrementOne(barcode) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          updateTo(itemID, item.itemName, item.barcode, (parseInt(item.count, 10) + 1).toString(), item.categoryName);
        });
    });
}

function decrementOne(barcode) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          var dec = ((parseInt(item.count, 10) - 1) < 0) ? 0 : (parseInt(item.count, 10) - 1);
          updateTo(itemID, item.itemName, item.barcode, dec.toString(), item.categoryName);
        });
    });
}

function decrementItem(barcode, amount) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          var dec = ((parseInt(item.count, 10) - amount) < 0) ? 0 : (parseInt(item.count, 10) - amount);
          updateTo(itemID, item.itemName, item.barcode, dec.toString(), item.categoryName);
        });
    });
}

function deleteItem(barcode, itemName) {
  firebase.database().ref('/barcodes/' + barcode).once('value').then(function(barcodeData) {
    var itemID = barcodeData.val();
    if (confirm("Delete " + itemName + "?")) {
      firebase.database().ref('/inventory/' + itemID).remove().then(function() {
        firebase.database().ref('/barcodes/' + barcode).remove().then(function() {
          window.location.reload();
        });
      });
    }
  }); 
}

function updateTo(itemID, itemName, barcode, cost, count, categoryName) {
    // Save to inventory this new item to the generated item ID.
    var itemInfo = {
      createdBy: getUserName(),
      itemName: itemName,
      barcode: barcode,
      count: count,
      categoryName: categoryName,
    }
    return firebase.database().ref('/inventory/' + itemID).update(itemInfo).catch(function(error) {
      console.error('Error writing item to /inventory/' + itemID, error);
    });
}

function loadItemIntoEditForm(barcode) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          loadItemIntoEditForm2(itemID, item.itemName, item.barcode, item.count, item.categoryName);
        });
    });
}

function loadItemIntoEditForm2(itemID, itemName, barcode, count, categoryName) {
  document.getElementById('editItemID').value = itemID;
  document.getElementById('editItemName').value = itemName;
  document.getElementById('editBarcode').value = barcode;
  document.getElementById('editCount').value = count;

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

// Saves a new item in the inventory database.
function saveItem() {
  var itemID = generateItemID();
  var itemName = document.getElementById('itemName').value;
  var barcode = document.getElementById('barcode').value;
  var count = document.getElementById('count').value;

  // Generate hashmap that has list of categories for this item.
  var categoryName = {};
  getCategories().forEach(function(value, index, array) {
    // console.log(value);
    var checkbox = document.getElementById(value);
    // console.log(checkbox.checked);
    if (checkbox !== null && checkbox.checked) {
      categoryName[value] = value;
    }
  });
    
  //check if barcode already exists in database
  firebase.database().ref('barcodes').once('value').then((data) => {
    var barcodesFromDb = data.val();
    var barcodes = [];
    for (const [bc, itemID] of Object.entries(barcodesFromDb)) {
      barcodes.push(bc);
    }
    var isDuplicate = (barcodes.indexOf(barcode) >= 0);
    console.log(isDuplicate);
    if (isDuplicate === true) {
      alert('An item with this barcode already exists.');
      return;
    } else {
        // Generate hashmap that has list of categories for this item.
        var categoryName = {};
        getCategories().forEach(function(value, index, array) {
          console.log(value);
          var checkbox = document.getElementById(value);
          // console.log(checkbox.checked);
          if (checkbox !== null && checkbox.checked) {
            categoryName[value] = value;
          }
        });

        // Connect the generated item ID to this barcode.
        var barcodeToID = {};
        barcodeToID[barcode] = itemID;
        firebase.database().ref('/barcodes/').update(barcodeToID).catch(function(error) {
          console.error('Error writing [' + barcode + ' : ' + itemID + '] to /barcodes/', error);
        });

        // Save to inventory this new item to the generated item ID.
        var itemInfo = {
          createdBy: getUserName(),
          itemName: itemName,
          barcode: barcode,
          count: count,
          categoryName: categoryName,
        }
        if (JSON.stringify(itemInfo.categoryName) === '{}') {
          alert("You must check at least one category.");
          return;
        }

        return firebase.database()
                  .ref('/inventory/' + itemID)
                  .update(itemInfo)
                  .catch(function(error) {
                      console.error('Error writing item to /inventory/' + itemID, error);
                      toastr.error(error, "Error adding new item")
                      })
                  .then(() => {
                    document.getElementById("add-item-form").reset();
                    toastr.info("New item successfully added");
                    }
                  );
    }
  });
 


}

// Triggered when the add new item form is submitted.
function onAddItemFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (checkSignedInWithMessage()) {
    saveItem("3", "2", "3", "4", "5");
  }
}

// Triggered when the edit item form is submitted.
function onEditItemFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (checkSignedInWithMessage()) {
    updateItem();
  }
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

function addToCountByInterval() {
  changeCountByInterval(true)
}

function subtractFromCountByInterval() {
  changeCountByInterval(false)
}

function changeCountByInterval(adding) {
  var newCount = 0;
  var interval = parseInt(document.getElementById("edit-count-by-interval").value, 10);
  interval = interval ? interval : 0;
  var count = document.getElementById("editCount");
  if (adding) {
    newCount = parseInt(count.value, 10) + interval;
  } else {
    newCount = parseInt(count.value, 10) - interval;
  }
  count.value = newCount;
  parseInt
}

// Shortcuts to DOM Elements.
var addItemFormElement = document.getElementById('add-item-form');
var editItemFormElement = document.getElementById('edit-item-form');
var editItemFormBarcodeElement = document.getElementById('edit-item-form-barcode');
var editItemBarcodeElement = document.getElementById('editItemBarcode');


// Saves message on form submit.
// messageFormElement.addEventListener('submit', onMessageFormSubmit);
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
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
    var itemImageFile = document.getElementById('addItemFile').value;
    var itemName = document.getElementById('editItemName').value;
    var barcode = document.getElementById('editBarcode').value;
    var cost = document.getElementById('editCost').value;
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
      cost: cost,
      count: count,
      categoryName: categoryName,
      imageName: itemName.replace(/\s/g, '') + '.jpg'
    }

    if (JSON.stringify(itemInfo.categoryName) === '{}') {
      alert("You must check at least one category.");
      return;
    }

    // If an image was included, also upload the image to Cloud Storage.
    if (typeof itemImageFile !== "undefined") {
      var filePath = firebase.auth().currentUser.uid + '/' + itemID + '/' + itemImageFile.name;
      return firebase.storage().ref(filePath).put(itemImageFile).then(function(fileSnapshot) {
        return fileSnapshot.ref.getDownloadURL().then(function(url) {
          itemInfo["imageUrl"] = url;
          itemInfo["storageUri"] = fileSnapshot.metadata.fullPath;
          return firebase.database().ref('/inventory/' + itemID).update(itemInfo).catch(function(error) {
            console.error('Error writing item to /inventory/' + itemID, error);
          });
        });
      });
    }

    return firebase.database()
      .ref('/inventory/' + itemID)
      .update(itemInfo)
      .catch(function(error) {
        console.error('Error writing item to /inventory/' + itemID, error);
        })
      .then(document.getElementById("edit-item-form").reset()
    );
}

function incrementOne(barcode) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          updateTo(itemID, item.itemName, item.barcode, item.cost, (parseInt(item.count, 10) + 1).toString(), item.categoryName);
        });
    });
}

function decrementOne(barcode) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          var dec = ((parseInt(item.count, 10) - 1) < 0) ? 0 : (parseInt(item.count, 10) - 1);
          updateTo(itemID, item.itemName, item.barcode, item.cost, dec.toString(), item.categoryName);
        });
    });
}

function decrementItem(barcode, amount) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          var dec = ((parseInt(item.count, 10) - amount) < 0) ? 0 : (parseInt(item.count, 10) - amount);
          updateTo(itemID, item.itemName, item.barcode, item.cost, dec.toString(), item.categoryName);
        });
    });
}

function updateTo(itemID, itemName, barcode, cost, count, categoryName) {
    // Save to inventory this new item to the generated item ID.
    var itemInfo = {
      createdBy: getUserName(),
      itemName: itemName,
      barcode: barcode,
      cost: cost,
      count: count,
      categoryName: categoryName,
      imageName: itemName.replace(/\s/g, '') + '.jpg'
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
          loadItemIntoEditForm2(itemID, item.itemName, item.barcode, item.cost, item.count, item.categoryName, item.imageUrl);
        });
    });
}

function loadItemIntoEditForm2(itemID, itemName, barcode, cost, count, categoryName, imageUrl) {
  document.getElementById('editItemID').value = itemID;
  document.getElementById('editItemName').value = itemName;
  document.getElementById('editBarcode').value = barcode;
  document.getElementById('editCost').value = cost;
  document.getElementById('editCount').value = count;

  if (typeof imageUrl !== "undefined") {
    var text = "<h4>Current image</h4>" + "<img src=" + imageUrl + " height=200><P>"
    document.getElementById('loadItemFile').innerHTML = text;
  }

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
  var itemImageFile = document.getElementById('addItemFile').value;
  var itemName = document.getElementById('itemName').value;
  var barcode = document.getElementById('barcode').value;
  var cost = document.getElementById('cost').value;
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
    cost: cost,
    count: count,
    categoryName: categoryName,
    imageName: itemName.replace(/\s/g, '') + '.jpg'
  }
  if (JSON.stringify(itemInfo.categoryName) === '{}') {
    alert("You must check at least one category.");
    return;
  }

  // If an image was included, also upload the image to Cloud Storage.
  if (typeof itemImageFile !== "undefined") {
    var filePath = firebase.auth().currentUser.uid + '/' + itemID + '/' + itemImageFile.name;
    return firebase.storage().ref(filePath).put(itemImageFile).then(function(fileSnapshot) {
      return fileSnapshot.ref.getDownloadURL().then(function(url) {
        itemInfo["imageUrl"] = url;
        itemInfo["storageUri"] = fileSnapshot.metadata.fullPath;
        return firebase.database().ref('/inventory/' + itemID).update(itemInfo).catch(function(error) {
          console.error('Error writing item to /inventory/' + itemID, error);
        });
      });
    });
  }

  return firebase.database()
            .ref('/inventory/' + itemID)
            .update(itemInfo)
            .catch(function(error) {
                console.error('Error writing item to /inventory/' + itemID, error);
                })
            .then(document.getElementById("add-item-form").reset()
            );
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

// Triggered when a file is selected via the media picker.
function onAddItemImageSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Check if the file is an image.
  if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
    var data = {
      message: 'You can only upload .jpg/.jpeg and .png images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }

  var fileSize = event.target.files[0].size / 1024 / 1024; // in MB
  if (fileSize > 0.25) { // if file > 250kb
    var data = {
      message: 'Image size must be under 250KB',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }

  signInSnackbarElement.MaterialSnackbar.showSnackbar(
  {
    message: 'Nice! This image fulfills size (<250KB) and type (.png/.jpg) requirements.',
    timeout: 3000
  });

  document.getElementById('addItemFile').value = file;
}

// Shortcuts to DOM Elements.
var addItemFormElement = document.getElementById('add-item-form');
var editItemFormElement = document.getElementById('edit-item-form');
var editItemFormBarcodeElement = document.getElementById('edit-item-form-barcode');
var editItemBarcodeElement = document.getElementById('editItemBarcode');
var addItemImageDialogElement = document.getElementById('addItemImageDialog');
var editItemImageDialogElement = document.getElementById('editItemImageDialog');

// Saves message on form submit.
// messageFormElement.addEventListener('submit', onMessageFormSubmit);
addItemFormElement.addEventListener('submit', onAddItemFormSubmit);
editItemFormElement.addEventListener('submit', onEditItemFormSubmit);
editItemFormBarcodeElement.addEventListener('submit', onEditBarcodeItemFormSubmit);

// Events for image upload.
addItemImageDialogElement.addEventListener('change', onAddItemImageSelected);
editItemImageDialogElement.addEventListener('change', onAddItemImageSelected);

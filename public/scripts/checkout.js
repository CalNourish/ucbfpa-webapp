'use strict';

var form = document.getElementById('checkout-item-form');
var groceryList = document.querySelector('ol');

function goToStartOrder() {
  window.location.href = "/start-order";
}

function checkoutItem(barcodeScanned, amount) {
  var barcode = barcodeScanned.value;
  var amt = amount.value;
  var amount = amt ? amt : 1;

  return new Promise(function(resolve, reject) {
    var firebaseReturn = decrementItem(barcode, amount);
  
    if (firebaseReturn) {
      resolve(firebaseReturn);
    }
    else {
      reject(Error("It broke"));
    }
  });
}

function getItemIdByBarcode(barcode) {
  return new Promise(function(resolve, reject) {
    var itemId = firebase
      .database()
      .ref('/barcodes/')
      .once('value')
      .then(function(barcodesTable) {
        return barcodesTable.val()[barcode];
      });
  
    if (itemId) {
      resolve(itemId);
    }
    else {
      reject(Error("Something broke here."));
    }
  });
}

function getItemNameByItemId(itemId) {
  return new Promise(function(resolve, reject) {
    var itemName = firebase
      .database()
      .ref('/inventory/' + itemId)
      .once('value')
      .then(function(inventoryTable) {
        return inventoryTable.val().itemName;
      });
  
    if (itemName) {
      resolve(itemName);
    }
    else {
      reject(Error("Something broke here."));
    }
  });
}

form.addEventListener('keypress', function(e) {
  e.preventDefault();
  if (e.keyCode == 13) {
    var barcodeScanned = document.getElementById('barcode');
    var amount = document.getElementById('amount');
    if (!amount.value) {
      amount.value = "1";
    }

    checkoutItem(barcodeScanned, amount)
      .then(function(result) {
        console.log(result);
      }, function(err) {
        console.log(err);
      });
    
    getItemIdByBarcode(barcodeScanned.value)
      .then(function(itemId) {
        console.log("itemid hello: " + itemId);
        console.log(amount.value);

        getItemNameByItemId(itemId)
          .then(function(itemName) {
            var groceryItem = document.createElement("li");
            // var amount = document.getElementById('amount');
            // if (!amount.value) {
            //   amount.value = "1";
            // }
            groceryItem.textContent = itemName + ", Amount: " + amount.value;
            groceryList.appendChild(groceryItem);
          }, function(err) {
            console.log(err);
          });
      }, function(err) {
        console.log(err);
      });
    
    barcodeScanned.value = "";
    amount.value = "";
  }
});

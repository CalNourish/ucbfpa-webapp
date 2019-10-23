'use strict';

var form = document.getElementById('checkout-item-form');
var groceryList = document.querySelector('ol');
var finished = document.getElementById('backToCheckout');
var undo = document.getElementById('undoLastItem');
var groceryCart  = [];

undo.addEventListener("click", (e) => {
  undoLastItem();
});
undo.style.visibility = 'hidden';


finished.addEventListener("click", (e) => {
  if (groceryCart.length == 0) {
    return;
  }
  let groceryDict = {};
  for (let i = 0; i < groceryCart.length; i++) {
    let barcode = groceryCart[i][0];
    let amount = groceryCart[i][1];
    if (groceryDict[barcode]) {
      groceryDict[barcode] = parseInt(groceryDict[barcode]) + parseInt(amount)
    } else {
      groceryDict[barcode] = parseInt(amount);
    }
  }
  Object.entries(groceryDict).forEach(([barcode, amount]) => {
    checkoutItem(barcode, amount) 
      .then(function(result) {
        console.log(result);
      }, function(err) {
        console.log(err);
      });
  });
  undo.style.visibility = 'hidden'
  groceryCart = [];
  e.preventDefault()
  if (groceryList.childElementCount > 0) {
    $('#grocery-list').empty();
    toastr.info('Checked out')
  }
})

function checkoutItem(barcodeScanned, amount) {
  var amount = amount ? amount : 1;
  return new Promise(function(resolve, reject) {
    var firebaseReturn = decrementItem(barcodeScanned, amount);
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

function getAmount() {
  var amount = document.getElementById('amount');
  if (!amount.value) {
    return "1";
  }
  else {
    return amount.value;
  }
}

function undoLastItem() {
  if (groceryList.childNodes.length > 0) {
    groceryList.removeChild(groceryList.childNodes[groceryList.childNodes.length-1]);
    groceryCart.pop();
  }
  if (groceryList.childNodes.length == 0) {
    undo.style.visibility = 'hidden'
  }
  return;
}

form.addEventListener('keypress', function(e) {
  if (e.keyCode == 13) {
  	e.preventDefault();
    var barcodeScanned = document.getElementById('barcode');
    var amount = document.getElementById('amount');
    if (barcodeScanned == "") {
      return;
    } 
    if (!amount.value) {
      amount.value = "1";
    }
    
    groceryCart.push([barcodeScanned.value, amount.value]);

    getItemIdByBarcode(barcodeScanned.value) 
      .then(function(itemId) {
        getItemNameByItemId(itemId)
          .then(function(itemName) {
            var groceryItem = document.createElement("li");
            var amount = document.getElementById('amount');
            if (!amount.value) {
              amount.value = "1";
            }
            groceryItem.textContent = itemName + ", Amount: " + amount.value;
            groceryList.appendChild(groceryItem);
            undo.style.visibility = 'visible';
            barcodeScanned.value = "";
            amount.value = "";
          }, function(err) {
            console.log(err);
          });
      }, function(err) {
        console.log(err);
      });
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
});

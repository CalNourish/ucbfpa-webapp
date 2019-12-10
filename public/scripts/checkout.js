'use strict';

var form = document.getElementById('checkout-item-form');
var amount = document.getElementById('amount');
var barcode = document.getElementById('barcode');
var groceryList = document.querySelector('ol');
var totalItems = document.getElementById("total-items")
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
        toastr.error("Item checkout error")
      });
  });
  undo.style.visibility = 'hidden'
  groceryCart = [];
  totalItems.textContent = '0'
  e.preventDefault()
  if (groceryList.childElementCount > 0) {
    $('#grocery-list').empty();
    toastr.info('Checked out')
  }
  amount.select();
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

function getItemNameByBarcode(barcode) {
  return new Promise(function(resolve, reject) {
    var ref = firebase
      .database()
      .ref('/inventory/' + barcode)
      .once('value')
      .then(function(inventoryTable) {
        var item = inventoryTable.val();
        return item.itemName;
      });
  
    if (ref) {
      resolve(ref);
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
    var lastItem = groceryCart.pop();
    updateTotal('-' + lastItem[1])
  }
  if (groceryList.childNodes.length == 0) {
    undo.style.visibility = 'hidden'
  }
  return;
}

function updateTotal(amount) {
  var currentAmount = parseInt(totalItems.textContent)
  var scannedAmount = parseInt(amount)
  totalItems.textContent = currentAmount + scannedAmount
}

/*
* Page-wide hotkeys
* q - Amount field
* w - Barcode field
* Shift + Enter - checkout
* numeric input anywhere not in a input field auto selects quantity
*/
document.onkeydown = function(e) {
  if (e.which == 81) {
    e.preventDefault();
    amount.select();
  } else if (e.which == 87) {
    e.preventDefault();
    barcode.select();
  } else if (e.shiftKey && e.which == 13) {
    // Hacky, should move checkout functionality into own function and call that from here and checkout button listener
    e.preventDefault();
    finished.click();
  } else if (e.which >= 48 && e.which <= 57) {
    // check we're not inside of an entry field
    if (document.activeElement.tagName != "INPUT") {
      amount.select();
    }
  }
}


form.addEventListener('keypress', function(e) {
  console.log("we here")
  if (e.keyCode == 13) {
  	e.preventDefault();
    var barcodeScanned = document.getElementById('barcode');
    var amount = document.getElementById('amount');
    if (barcodeScanned.value == "") {
      return;
    } 
    if (!amount.value) {
      amount.value = "1";
    }
    
    groceryCart.push([barcodeScanned.value, amount.value]);

    // get item name from barcode
    getItemNameByBarcode(barcodeScanned.value)
    .then(function(itemName) {
      var groceryItem = document.createElement("li");
      var amount = document.getElementById('amount');
      if (!amount.value) {
        amount.value = "1";
      }
      groceryItem.textContent = itemName + ", Amount: " + amount.value;
      groceryList.appendChild(groceryItem);
      updateTotal(amount.value);
      undo.style.visibility = 'visible';
      barcodeScanned.value = "";
      amount.value = "";
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

'use strict';

var form = document.getElementById('checkout-item-form');
var amount = document.getElementById('amount');
var barcode = document.getElementById('barcode');
var groceryList = document.getElementById('grocery-list');
var totalItems = document.getElementById("total-items")
var finished = document.getElementById('backToCheckout');
var groceryCart  = [];

finished.addEventListener("click", (e) => {
  finishCheckout();
})

function finishCheckout() {
  if (groceryCart.length == 0) {
    return;
  }
  let groceryDict = {};
  // consolidate grocery list items so that there is only a single entry per barcode
  for (let i = 0; i < groceryCart.length; i++) {
    if (groceryCart[i] == null) {
      continue;
    } else {
      let barcode = groceryCart[i][0];
      let amount = groceryCart[i][1];
      if (groceryDict[barcode]) {
        groceryDict[barcode] = parseInt(groceryDict[barcode]) + parseInt(amount)
      } else {
        groceryDict[barcode] = parseInt(amount);
      }
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
  groceryCart = [];
  totalItems.textContent = '0'
  if (groceryList.childElementCount > 0) {
    $('#grocery-list').empty();
    toastr.info('Checked out')
  }
  amount.select();
}

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
    e.preventDefault();
    finishCheckout();
  } else if (e.which >= 48 && e.which <= 57) {
    // check we're not inside of an entry field
    if (document.activeElement.tagName != "INPUT") {
      amount.select();
    }
  }
}

form.addEventListener('keypress', function(e) {
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
    
  getItemNameByBarcode(barcodeScanned.value)
    .then(function(itemName) {
      var trashButton = document.createElement("i");
      trashButton.classList.add("fa", "fa-trash", "fa-6");
      trashButton.setAttribute("id", + groceryCart.length);
      trashButton.addEventListener("click", function(event) {
        e.preventDefault(),
        removeListItem(this.id);
      });
      var amount = document.getElementById('amount');
      if (!amount.value) {
        amount.value = "1";
      }

      var groceryItem = document.createElement("tr");
      groceryItem.setAttribute("id", "item" + groceryCart.length);

      var itemNameElement = document.createElement("td");
      var itemAmountElement = document.createElement("td");
      var trashButtonElement = document.createElement("td");

      itemNameElement.textContent = itemName;
      itemAmountElement.textContent = amount.value;
      trashButtonElement.appendChild(trashButton);

      groceryItem.appendChild(itemNameElement);
      groceryItem.appendChild(itemAmountElement);
      groceryItem.appendChild(trashButtonElement);

      groceryList.appendChild(groceryItem);
      groceryCart.push([barcodeScanned.value, amount.value]);
      updateTotal(amount.value);
      barcodeScanned.value = "";
      amount.value = "";
    }, function(err) {
      console.log(err);
    });
  }

  function removeListItem(i) {
    groceryList.removeChild(document.getElementById("item" + i));
    updateTotal('-' + groceryCart[i][1])
    groceryCart[i] = null;
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

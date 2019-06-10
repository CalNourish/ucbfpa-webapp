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

  decrementItem(barcode, amount);
}

form.addEventListener('keypress', function(e){
  if (e.keyCode == 13) {
    e.preventDefault();
    // barcodeScanned.value += ' ';
    console.log('You pressed a "enter" key in somewhere');
    var barcodeScanned = document.getElementById('barcode');
    var amount = document.getElementById('amount');
    if (!amount.value) {
      amount.value = "1"
    }
    console.log(barcodeScanned)
    console.log(amount)
    checkoutItem(barcodeScanned, amount);

    // This is adding to the list using the barcode scanner.
    var itemID = barcodeToID(barcodeScanned.value);
    var scannedItem = getItemByID(itemID);

    var groceryItem = document.createElement("li");
    groceryItem.textContent = scannedItem + ", Amount: " + amount.value;
    groceryList.appendChild(groceryItem);

    barcodeScanned.value = "";
    amount.value = "";
  }
});

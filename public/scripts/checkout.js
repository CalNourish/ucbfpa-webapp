'use strict';

var form = document.getElementById('checkout-item-form');

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
    console.log(barcodeScanned)
    console.log(amount)
    checkoutItem(barcodeScanned, amount);
    barcodeScanned.value = "";
    amount.value = "";
  }
});

var barcodeScanned = document.getElementById('checkout');

function checkoutItem() {
  var barcode = barcodeScanned.value.substr(0,barcodeScanned.value.indexOf(' '));
  var amount = barcodeScanned.value.substr(barcodeScanned.value.indexOf(' ') + 1);
  console.log(barcode);
  console.log(amount);
  decrementItem(barcode, amount);
}

barcodeScanned.addEventListener('keypress', function(e){
  if (e.keyCode == 13) {
    console.log('You pressed a "enter" key in somewhere');
    checkoutItem();
    barcodeScanned.value = "";
  }
});

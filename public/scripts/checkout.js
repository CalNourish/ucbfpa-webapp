var barcodeScanned = document.getElementById('checkout');

function checkoutItem() {
  var val = barcodeScanned.value.substr(0,barcodeScanned.value.indexOf(' '))
  var amount = val ? val : 1 ;
  var barcode = barcodeScanned.value.substr(barcodeScanned.value.indexOf(' ') + 1);
  decrementItem(barcode, amount);
}

barcodeScanned.addEventListener('keypress', function(e){
  if (e.keyCode == 13) {
    e.preventDefault();
    // barcodeScanned.value += ' ';
    console.log('You pressed a "enter" key in somewhere');
    checkoutItem();
    barcodeScanned.value = "";
  }
});

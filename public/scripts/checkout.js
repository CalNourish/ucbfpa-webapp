'use strict';

var form = document.getElementById('checkout-item-form');
var amount = document.getElementById('amount');
var barcode = document.getElementById('barcode');
var groceryList = document.getElementById('grocery-list');
var totalItems = document.getElementById("total-items")
var finished = document.getElementById('backToCheckout');
var groceryCart  = [];
var itemInfo = [];
var sheetDict = {};
var sheetTitle = ''

let numToDay = {0:'Sunday', 1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday'}

finished.addEventListener("click", (e) => {
  finishCheckout();
})

function finishCheckout() {
  if (groceryCart.length == 0) {
    return;
  }
  let groceryDict = {};
  // consolidate grocery list items so that there is only a single entry per barcode
  let idDate = new Date();
  let id = idDate.getTime();
  for (let i = 0; i < groceryCart.length; i++) {

    if (groceryCart[i] == null) {
      continue;
    } else {
      let barcode = groceryCart[i][0];
      let amount = groceryCart[i][1];

      let name = groceryCart[i][2];
      let invCount = groceryCart[i][3];
      let date = new Date();
      let month = String(date.getMonth() + 1);
      let year = String(date.getFullYear());
      let numDate = year + '-' + month + '-' + String(date.getDate());
      let hr = String(date.getHours())
      sheetTitle = month + '/' + year;
      if (hr.length == 1) {  hr = '0' + hr }
      let min = String(date.getMinutes())
      if (min.length == 1) { min = '0' + min }
      let sec = String(date.getSeconds())
      if (sec.length == 1) { sec = '0' + sec }
      let time = hr + ':' + min + ':' + sec;
      let day = numToDay[date.getDay()]
      let itemList = [barcode, parseInt(amount), name, invCount, id, numDate, time, day]
      if (groceryDict[barcode]) {
        groceryDict[barcode] = parseInt(groceryDict[barcode]) + parseInt(amount);
        sheetDict[barcode][1] = parseInt(sheetDict[barcode][1]) + parseInt(amount)
      } else {
        groceryDict[barcode] = parseInt(amount);
        sheetDict[barcode] = itemList;
      }
      sheetDict[barcode][3] = parseInt(sheetDict[barcode][3]) - parseInt(amount)
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

//consolidate these three functions
function getInventoryAmountByBarcode(barcode) {
  return new Promise(function(resolve, reject) {
    var ref = firebase
      .database()
      .ref('/inventory/' + barcode)
      .once('value')
      .then(function(inventoryTable) {
        var item = inventoryTable.val();

        return item.count;
      });

    if (ref) {
      resolve(ref);
    }
    else {
      reject(Error("Something broke here."));
    }
  });
}

function getLowStockByBarcode(barcode) {
  return new Promise(function(resolve, reject) {
    var ref = firebase
      .database()
      .ref('/inventory/' + barcode)
      .once('value')
      .then(function(inventoryTable) {
        var item = inventoryTable.val();

        return item.lowStock;
      });

    if (ref) {
      resolve(ref);
    }
    else {
      reject(Error("Something broke here."));
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

function checkLowStock() {
  for (const key in sheetDict) {
    console.log(sheetDict[key]);
    let lowStockNum = getLowStockByBarcode(sheetDict[key][0])
    let inventoryAmount = getInventoryAmountByBarcode(sheetDict[key][0])
    if (lowStockNum >= inventoryAmount) {
        

    }
  }
}

function makeApiCall() {

  for (const key in sheetDict) {
    console.log(sheetDict[key]);

    var params = {
      // The ID of the spreadsheet to update.
      spreadsheetId: '1IACSfoNqSrLImQXNUJl3j-Vf3jrhy7FOz33FlshSSX0',
      // The A1 notation
      // Values will be appended after the last row of the table.
      range: sheetTitle + '!A1:H1',
      // How the input data should be interpreted.
      valueInputOption: 'RAW',
      // How the input data should be inserted.
      insertDataOption: 'INSERT_ROWS',
    };

    var valueRangeBody = {
      "majorDimension": "ROWS",
      "range": sheetTitle + "!A1:H1",
      "values": [sheetDict[key]]
    };
    var request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
    request.then(function(response) {
      console.log(response.result);
      sheetDict = {};
    }, function(reason) {
      console.error('error: ' + reason.result.error.message);
      if (reason.result.error.message == 'Unable to parse range: ' + sheetTitle + '!A1:H1') {
        addSheet();
        makeApiCall();
      }
    });

  }

}

function addSheet(title) {
  var params = {
       // The spreadsheet to apply the updates to.
       spreadsheetId: '1IACSfoNqSrLImQXNUJl3j-Vf3jrhy7FOz33FlshSSX0',
     };

  var batchUpdateSpreadsheetRequestBody = {
     // A list of updates to apply to the spreadsheet.
     // If any request is not valid, no requests will be applied.
  requests: [{
      "addSheet": {
        "properties": {
          "title": sheetTitle,
          "gridProperties": {
            "rowCount": 5000,
            "columnCount": 12
          },
          "tabColor": {
            "red": 1.0,
            "green": 0.3,
            "blue": 0.4
          }
        }
      }
    }],

   };

  var request = gapi.client.sheets.spreadsheets.batchUpdate(params, batchUpdateSpreadsheetRequestBody);
  request.then(function(response) {
    console.log(response.result);
  }, function(reason) {
   console.error('error: ' + reason.result.error.message);
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
    handleClientLoad();
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
      // clear any error msgs that exist
      if (barcodeScanned.className.includes("is-invalid")) {
        barcodeScanned.className = barcodeScanned.className.replace(" is-invalid", "");
        barcodeScanned.parentNode.removeChild(barcodeScanned.nextSibling);
      }

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
      itemInfo.push(barcodeScanned.value, amount.value, itemNameElement.textContent);

      //append inventory amount to
      getInventoryAmountByBarcode(barcodeScanned.value)
        .then(function(inventoryCount) {
          var inventoryCountElement = document.createElement("td");
          inventoryCountElement.textContent = inventoryCount;
          itemInfo.push(inventoryCountElement.textContent);
          groceryCart.push(itemInfo);
          itemInfo = []
          return
        });

      groceryList.appendChild(groceryItem);
      updateTotal(amount.value);
      barcodeScanned.value = "";
      amount.value = "";
    }, function(err) {
      // if we can't find the item, turn the box red and append an error msg
      if (!barcodeScanned.className.includes("is-invalid")) {
        var errorMsg = document.createElement("div");
        errorMsg.innerHTML = '<div class=\"col-xs-3\"><small id=\"bad-barcode\" class=\"text-danger\">We could not find this item in the inventory.</small></div>'
        barcodeScanned.className += " is-invalid";
        barcodeScanned.parentNode.insertBefore(errorMsg, barcodeScanned.nextSibling);
      }
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

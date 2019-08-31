'use strict';

$(document).ready(function() {

  // list for appending to DOM
  let allItems = [];
  // connect inventory
  const REF = firebase.database().ref('/inventory')

  // initial data 
  REF.once("value", snapshot => {

    let res = snapshot.val()
    for (let item in res) {
      let currentItem = res[item]
      allItems.push(`<div class='card item-card'>
                        <div class='item-img-wrapper'>
                          <img class='card-img-top item-img-placeholder' src='../../images/pantry_logo.png' alt='Card image cap'>
                        </div>
                        <div class='item-card card-body'>
                          <h4 class='item-name'> ${standardizeName(currentItem.itemName)}</h4>
                          <p class='card-text item-count' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
                          <div>
                          <button class="message-form button btn btn-outline-primary btn-block" type="button" onClick = "openEditModal(\'${currentItem.barcode}\')"> Edit This Item </button>
                          </div>
                          </div>
                      </div>`)
    }
    // append to dom
    $("#inventory-items").append(allItems)
  })

    // watch for data changes while page is open
    REF.on("child_changed", snapshot => {
      let res = snapshot.val()
      let item = document.querySelector(`[data-itemid='${res.barcode}']`)
      // If item is currently rendered
      if (item) {
        item.textContent = res.count;
      }
    })

    // Load selected item into edit item form
    $(".list-group-item").click(function() {
      let items = [];
      let selected = $(this).data("item")
      if (selected != 'all') {
        REF.once("value", snapshot => {
          let res = snapshot.val()
          for (let item in res) {
            let currentItem = res[item]
            let categories = currentItem.categoryName
            console.log (categories)
            for (let category in categories) {
              console.log(category)
              if (category == selected) {
                console.log("tru")
                items.push(`<div class='card item-card'>
                        <div class='item-img-wrapper'>
                          <img class='card-img-top item-img-placeholder' src='../../images/pantry_logo.png' alt='Card image cap'>
                        </div>
                        <div class='item-card card-body'>
                          <h4 class='item-name'> ${standardizeName(currentItem.itemName)}</h4>
                          <p class='card-text item-count' data-itemid='\'${currentItem.barcode}\''>${currentItem.count}</p>
                          <div>
                          <button class="message-form button btn btn-outline-primary btn-block" type="button" onClick = "goToEditItem(\'${currentItem.barcode}\')"> Edit This Item </button>
                          </div>
                          </div>
                      </div>`)
              }
            }
          }
          // update DOM
          $('#inventory-items').empty();
          $("#inventory-items").append(items)
        })
      } else {
          // update DOM
          $('#inventory-items').empty();
          $("#inventory-items").append(allItems)
      }

    });

  });

function openAddModal() {
  addItemModal.style.display = 'block';
}

function closeAddModal() {
  addItemModal.style.display = 'none';
}

function openEditModal(barcode) {
  editItemModal.style.display = 'block';
  if (barcode) {
      loadItemIntoEditForm(barcode);
  }
}

function closeEditModal() {
  editItemModal.style.display = 'none';
}

function standardizeName(itemName) {
  var newName = itemName;
  if (itemName.length > 20) {
    var newName = itemName.slice(0, 20) + "...";
  }
  return newName;
}

function setOutOfStock(itemName, barcode) {
  if (confirm("Set " + itemName + " to Out of Stock?")) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
      var itemID = barcodesTable.val()[barcode];
      firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
        var item = inventoryTable.val();
        updateTo(itemID, item.itemName, item.barcode, item.cost, "0", item.categoryName);
      });
    });
  }
}

function goToEditItem(barcode) {
  openEditModal(barcode);
}

var addItemModal = document.getElementById('addItemModal');
var editItemModal = document.getElementById('editItemModal');
var modalContent = document.getElementById('modalContent');
var modalBtn = document.getElementById('modalBtn');
var closeBtn = document.getElementById('closeBtn');

document.onclick = function(e){
  if(e.target.id == 'addItemModal'){
    closeAddModal();
  } else if (e.target.id == 'editItemModal') {
    closeEditModal();
  } else {
    return;
  }
};

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

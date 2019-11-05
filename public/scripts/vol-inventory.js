'use strict';

$(document).ready(function() {

  // list for appending to DOM

  let allItems = [];
  let fullTable = [];
  // connect inventory
  const REF = firebase.database().ref('/inventory')

  // initial data 
  REF.once("value", snapshot => {

    let res = snapshot.val()
    for (let item in res) {
      let currentItem = res[item]
      allItems.push(`<div class='card item-card'>
                        <div class='item-card card-body'>
                          <h4 class='item-name'> ${standardizeName(currentItem.itemName)}</h4>
                          <p class='card-text item-count' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
                          <div>
                            <button class="button" type="button" onClick = "openEditModal(\'${currentItem.barcode}\')"> EDIT </button>
                            <button class="delete-button" type="button" onClick="deleteItem(\'${currentItem.barcode}\',\'${currentItem.itemName}\')"><i class="fa fa-trash"></i></button>
                          </div>
                        </div>
                      </div>`)

      fullTable.push(`
      <tr>
        <td><a href='#' onClick = "goToEditItem(\'${currentItem.barcode}\')">${currentItem.itemName}</a></td>
        <td data-itemid='${currentItem.barcode}'>${currentItem.count}</td>
        <td><button class="delete-button" type="button" onClick="deleteItem(\'${currentItem.barcode}\',\'${currentItem.itemName}\')"><i class="fa fa-trash"></i></button></td>
      </tr>`)
      
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


    // Clear page and select items by category
    $(".list-group-item.category-item").click(function() {
      let selected = $(this).data("item")
      $(".list-group-item.category-item").removeClass("active")
      $(`[data-item=${selected}`).addClass("active")
      let view = $(".view-item.active").data("view")
      showCategory(selected, view);
    });
    
    // Change view style
    $(".view-item").on("click", (el) => {
      if (!el.currentTarget.classList.contains("active")) {
        $(".view-item.active").removeClass("active")
        el.currentTarget.classList.add("active")
        let activateView = el.currentTarget.dataset.view
        let selected = $(".list-group-item.active.category-item")[0].textContent.toLowerCase()
        if (activateView == "table") {
          $("#inventory-items").empty()
          $("#inventory-items").css("display", "none").removeClass("d-flex")
          $(".inventory-table").show()
          showCategory(selected, "table")
        } else {
          $(".inventory-table tbody").empty()
          $(".inventory-table").hide()
          $("#inventory-items").show().addClass("d-flex")
          showCategory(selected, "cards")
        }
      }
    })

    function showCategory(selected, view) {
      let items = [];
      $("#selected-category").text(selected.charAt(0).toUpperCase() + selected.slice(1))
      if (selected != 'all') {
        REF.once("value", snapshot => {
          let res = snapshot.val()
          for (let item in res) {
            let currentItem = res[item]
            let categories = currentItem.categoryName
            for (let category in categories) {
              if (category == selected) {
                // Card view
                if (view == "cards") {
                  items.push(`
                  <div class='card item-card'>
                  <div class='item-card card-body'>
                    <h4 class='item-name'> ${standardizeName(currentItem.itemName)}</h4>
                    <p class='card-text item-count' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
                    <div>
                      <button class="button" type="button" onClick = "openEditModal(\'${currentItem.barcode}\')"> EDIT </button>
                      <button class="delete-button" type="button" onClick="deleteItem(\'${currentItem.barcode}\',\'${currentItem.itemName}\')"><i class="fa fa-trash"></i></button>
                    </div>
                  </div>
                </div>`)
                } else {
                  items.push(`
                  <tr>
                    <td><a href='#' onClick = "goToEditItem(\'${currentItem.barcode}\')">${currentItem.itemName}</a></td>
                    <td data-itemid='${currentItem.barcode}'>${currentItem.count}</td>
                    <td><button class="delete-button" type="button" onClick="deleteItem(\'${currentItem.barcode}\',\'${currentItem.itemName}\')"><i class="fa fa-trash"></i></button></td>
                  </tr>
                  `)
                }
    
              }
            }
          }
          // update DOM
          if (view == "cards") {
            $('#inventory-items').empty();
            $("#inventory-items").append(items)
          } else {
            $(".inventory-table tbody").empty();
            $(".inventory-table tbody").append(items);
          }
        })
      } else {
          // update DOM
          if (view == "cards") {
            $('#inventory-items').empty();
            $("#inventory-items").append(allItems)
          } else {
            $(".inventory-table tbody").empty();
            $(".inventory-table tbody").append(fullTable);
          }
    
      }
    }
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

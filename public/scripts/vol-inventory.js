'use strict';

$(document).ready(function() {

  // list for appending to DOM

  let fullTable = [];
  // connect inventory
  const REF = firebase.database().ref('/inventory')

  // initial data 
  REF.once("value", snapshot => {

    let res = snapshot.val()
    for (let item in res) {
      let currentItem = res[item]
      fullTable.push(`
      <tr>
        <td><a href='#' onClick = "goToEditItem(\'${currentItem.barcode}\')">${currentItem.itemName}</a></td>
        <td data-itemid='${currentItem.barcode}'>${currentItem.count}</td>
        <td><button class="delete-button" type="button" onClick="deleteItem(\'${currentItem.barcode}\',\'${currentItem.itemName}\')"><i class="fa fa-trash"></i></button></td>
      </tr>`)
    }
    // append to dom
    $(".inventory-table tbody").append(fullTable);
  });
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
    showCategory(selected);
  });

  function showCategory(selected) {
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
        // update DOM
        $(".inventory-table tbody").empty();
        $(".inventory-table tbody").append(items);
      })
    } else {
      // update DOM
      $(".inventory-table tbody").empty();
      $(".inventory-table tbody").append(fullTable);
    }
  };
});


function refactorScript() {
  if (confirm("Run script to change DB schema?????")) {
    firebase.database()
    .ref('/inventory2') // FIX BEFORE RUNNING
    .once("value", snapshot => {
      let res = snapshot.val()
      for (let item in res) {
        let currentItem = res[item]
        firebase.database()
          .ref('/inventory2/' + currentItem.barcode) // FIX BEFORE RUNNING
          .update(currentItem)
          .catch(function(error) {
            console.error('Error writing item to /inventory/' + currentItem.barcode, error);
            toastr.error(error, "Error writing item to inventory")
            })
          .then( () => {
            // deleteItem(currentItem.barcode); // delete the old schema version. FIX BEFORE RUNNING
          });
      }
    });
  }    
}

function searchItem() {
  // Declare variables
  var input, filter, items, li, a, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  items = document.getElementById("table-items");
  li = items.getElementsByTagName('tr');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

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
        updateTo(item.itemName, item.barcode, item.cost, "0", item.categoryName);
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


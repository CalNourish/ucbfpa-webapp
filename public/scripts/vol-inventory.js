'use strict';
var scrollPosY = 0;
var scrollPosX = 0;

$(document).ready(function() {

  // lists for appending to DOM

  let fullTable = [];
  let sidebar = [];
  let dropdown = [];
  let editItemCheckboxes = [];
  let addItemCheckboxes = [];

  // Generates sidebar, dropdown menu, and checkboxes from category list 

  const categoryRef = firebase.database().ref('/category')
  categoryRef.once("value", snapshot => {
    let res = snapshot.val();

    Object.keys(res).forEach((category) => {
      let upperCaseCategory = category.charAt(0).toUpperCase() + category.slice(1)
      sidebar.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="list" data-item="${category}" href="#" role="tab">${upperCaseCategory}</a>`)
      dropdown.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="dropdown" data-item="${category}" href="#" role="tab">${upperCaseCategory}</a>`)
      addItemCheckboxes.push(`
        <div class="form-check col-4">
          <label class="form-check-label">
            <input id="${category}" class="form-check-input" type="checkbox" value="">${upperCaseCategory}
            <span class="form-check-sign">
              <span class="check"></span>
            </span>
           </label>
          </div>
      `)
      editItemCheckboxes.push(`
      <div class="form-check col-4">
        <label class="form-check-label">
          <input id="edit${category}" class="form-check-input" type="checkbox" value="">${upperCaseCategory}
          <span class="form-check-sign">
            <span class="check"></span>
          </span>
         </label>
        </div>
    `)
    });
    
    // append to dom 
  
    $(".list-group").append(sidebar);
    $(".dropdown-menu").append(dropdown);
    $("#add-item-checkboxes").append(addItemCheckboxes);
    $("#edit-item-checkboxes").append(editItemCheckboxes);
  })

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
        <td><button class="delete-button" type="button" onClick="deleteItem(\'${currentItem.barcode}\',\'${formatNameForHTML(currentItem.itemName)}\')"><i class="fa fa-trash"></i></button></td>
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
  $(".list-group").on('click', ".list-group-item", selectItemsOnCategoryClick);

  function selectItemsOnCategoryClick() {
    let selected = $(this).data('item')
    $('.list-group-item.category-item').removeClass('active')
    $(`[data-item=${selected}`).addClass('active')
    showCategory(selected);
  }

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
                <td><button class="delete-button" type="button" onClick="deleteItem(\'${currentItem.barcode}\',\'${formatNameForHTML(currentItem.itemName)}\')"><i class="fa fa-trash"></i></button></td>
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
  scrollPosY = window.pageYOffset;
  scrollPosX = window.pageXOffset;
  if (barcode) {
      loadItemIntoEditForm(barcode);
  }
}

function closeEditModal() {
  window.scrollTo(scrollPosX, scrollPosY)
  editItemModal.style.display = 'none';
}

function standardizeName(itemName) {
  var newName = itemName;
  if (itemName.length > 20) {
    var newName = itemName.slice(0, 20) + "...";
  }
  return newName;
}

function formatNameForHTML(itemName) {
  return itemName.replace(/'/g, "\\'")
}

function setOutOfStock(itemName, barcode) {
  if (confirm("Set " + itemName + " to Out of Stock?")) {
    return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
      var itemID = barcodesTable.val()[barcode];
      firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
        var item = inventoryTable.val();
        updateTo(item.itemName, item.barcode, item.cost, "0", item.categoryName, iten.packSize);
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
var packSize = document.getElementById('pack');
var count = document.getElementById('count');
var unitChoice = document.getElementById('packOption');

// add listeners to update helptext when selecting or modifying quantity
for (var eventType of ['keyup', 'click']) {
  //update the on-page hint when modifyig quantity or clicking to modify quantity
  count.addEventListener(eventType, function() {
    //only update the on-page hint when using packs
    if (unitChoice.selectedOptions[0].innerText == 'Packs') {
      var size = packSize.value;
      var countVal = count.value;
      // if they haven't put in a items/pack yet, use some placeholder
      if (size == ''){
        size = 5;
      }
      // if they haven't put in a number of items yet, use some placeholder
      if (countVal == '') {
        countVal = 3;
      }
      var total = size * countVal;
      document.getElementById('helptext').innerHTML = `Enter estimate if unsure. Example: ${countVal} packs of size ${size} is ${total} items`
    }
  });
}

// update on-page hint when switching back to individual items
unitChoice.addEventListener("change", function() {
  // if using packs
  if (unitChoice.selectedOptions[0].innerText != 'Packs') {
    document.getElementById('helptext').innerHTML = `Enter estimate if unsure. Example: 15`
  }
})

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


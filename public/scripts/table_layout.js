// Format name for display
function formatNameForHTML(name) {
  return name.replace(/'/g, "\\'")
}

/**********************************
 ***** Guest Volunteer Layout *****
 **********************************/

// Card Layout
function guest_card_element() {
  return (`
    <div class='card item-card'>
      <div class='item-card card-body'>
        <h4 class='item-name'>${currentItem.itemName}</h4>
        <p class='card-text item-count public-item' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
      </div>
    </div>
  `)
}

// Table layout
function guest_table_row() {
  return (`
    <tr>
      <td>${currentItem.itemName}</td>
      <td data-itemid='${currentItem.barcode}'>${currentItem.count}</td>
    </tr>
  `)
}

/***********************************
 ***** Pantry Volunteer Layout *****
 ***********************************/

function volunteer_table_row(name="unavailable", count="0", barcode="unavailable") {
  return (`
    <tr>
      <td><a href='#' onClick = "goToEditItem(\'${barcode}\')">${name}</a></td>
      <td data-itemid='${barcode}'>${count}</td>
      <td><button class="delete-button" type="button" onClick="deleteItem(\'${barcode}\',\'${formatNameForHTML(name)}\')"><i class="fa fa-trash"></i></button></td>
    </tr>
  `)
}

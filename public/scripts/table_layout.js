// Format name for display
function formatNameForHTML(name) {
  return name.replace(/'/g, "\\'")
}


// returns a heart element with the appropriate barcode and fill state
function getHeart(barcode) {
  var emptyHeart = '<td><div barcode=' + barcode + ' onclick="addToFavs(this)"><i class="fa fa-heart-o" style="cursor:pointer"></i></div></td>';
  var filledHeart = '<td><div barcode=' + barcode + ' onclick="removeFromFavs(this)"><i class="fa fa-heart" style="cursor:pointer; color:red"></i></div></td>';
  try {
    return FAVORITES[barcode] ? filledHeart : emptyHeart
  } catch {
    return emptyHeart
  }
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
function guest_table_row(name="unavailable", count="0", barcode="unavailable") {
  return (`
    <tr>
      ${getHeart(barcode)}
      <td><div barcode='${barcode}'>${name}</div></td>
      <td><div data-itemid='${barcode}'>${count}</div></td>
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

/*****************************************
 ***** Pantry Admin Low Stock Layout *****
 ****************************************/

 function low_stock_table_row(name="unavailable", count="0", barcode="unavailable") {
   return (`
     <tr>
       <td>${name}</a></td>
       <td data-itemid='${barcode}'>${count}</td>
     </tr>
   `)
 }

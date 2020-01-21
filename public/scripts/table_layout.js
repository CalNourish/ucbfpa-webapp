// Format name for display
function formatNameForHTML(name) {
  return name.replace(/'/g, "\\'")
}

/**********************************
 ***** Guest Volunteer Layout *****
 **********************************/


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

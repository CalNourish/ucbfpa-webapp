/**
* Schema functions for all database writes.
*/


/** returns a JSON string to write to S3 as a single file representing a checkout event
* checkoutID is a string that uniquely identifies this checkout
* checkoutAmts is an ordered array of integers indicating how many of each item were taken
* barcodes is an ordered array of strings of the barcodes corresponding to the items taken
* inventoryAmts is an ordered array of integers indicating how much is left of each item
* names is an ordered array of strings with the names of each item taken
* time is a string timestamp <TODO: CHANGE THIS>
* weekday is a string
*/
function checkoutForS3(checkoutID, checkoutAmts, barcodes, inventoryAmts, names, time, weekday) {
  return JSON.stringify({checkout_id: checkoutID, checkout_amounts: checkoutAmts, barcodes: barcodes, 
          inventory_amounts: inventoryAmts, names: names, time: time, day_of_week: weekday}); 
}
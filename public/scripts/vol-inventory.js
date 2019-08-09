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
                          <button class="message-form button" type="button" onClick = "goToEditItem(\'${currentItem.barcode}\')"> Edit This Item </button>
                          <button class="message-form button" type="button" onClick = "setOutOfStock(\'${currentItem.itemName}\', \'${currentItem.barcode}\')"> Out of Stock  </button>
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
                          <p class='card-text item-count' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
                          <button class="message-form button" type="button" onClick = "goToEditItem(\'${currentItem.barcode}\')"> Edit This Item </button>
                          <button class="message-form button" type="button" onClick = "setOutOfStock(\'${currentItem.itemName}\', \'${currentItem.barcode}\')"> Out of Stock  </button>
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


    // // Clear page and select items by category
    // $(".item-card").click(function() {
    //   // let items = [];
    //   // let selected = $(this).data("item")
    //   // if (selected != 'all') {
    //   //   REF.once("value", snapshot => {
    //   //     let res = snapshot.val()
    //   //     for (let item in res) {
    //   //       let currentItem = res[item]
    //   //       let categories = currentItem.categoryName
    //   //       console.log (categories)
    //   //       for (let category in categories) {
    //   //         console.log(category)
    //   //         if (category == selected) {
    //   //           console.log("tru")
    //   //           items.push(`<div class='card item-card'><div class='item-img-wrapper'><img class='card-img-top item-img-placeholder' src='../images/pantry_logo.png' alt='Card image cap'></div><div class='item-card card-body'><h4 class='item-name'>${currentItem.itemName}</h4><p class='card-text item-count' data-itemid='${currentItem.barcode}'>${currentItem.count}</p></div></div>`)
    //   //         }
    //   //       }
    //   //     }
    //   //     // update DOM
    //   //     $('#inventory-items').empty();
    //   //     $("#inventory-items").append(items)
    //   //   })
    //   // } else {
    //   //     // update DOM
    //   //     $('#inventory-items').empty();
    //   //     $("#inventory-items").append(allItems)
    //   // }
    //   window.location.href = "/pantry-volunteers/checkout";
    // });
  });
function standardizeName(itemName) {
  var newName = itemName;
  if (itemName.length > 20) {
    var newName = itemName.slice(0, 20) + "...";
  }
  return newName;
}

  function setOutOfStock(itemName, barcode) {
    console.log(barcode);
    if (confirm("Set " + itemName + " to Out of Stock?")) {
      return firebase.database().ref('/barcodes/').once('value').then(function(barcodesTable) {
        var itemID = barcodesTable.val()[barcode];
        firebase.database().ref('/inventory/' + itemID).once('value').then(function(inventoryTable) {
          var item = inventoryTable.val();
          console.log(item);
          console.log(item.barcode);
          // var dec = ((parseInt(item.count, 10) - amount) < 0) ? 0 : (parseInt(item.count, 10) - amount);
          updateTo(itemID, item.itemName, item.barcode, item.cost, "0", item.categoryName);
        });
      });
    } else {
      console.log("action cancelled");
    }

  
}

function goToEditItem(barcode) {
  console.log(barcode);
  window.location.href = "/pantry-volunteers/restock?barcode=" + barcode;
}
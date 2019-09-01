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
      allItems.push(
        `<div class='card item-card'>
          <div class='item-card card-body'>
            <h4 class='item-name'>${currentItem.itemName}</h4>
            <div class='count-wrapper'>
              <p class='card-text item-count public-item' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
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

    // Clear page and select items by category
    $(".list-group-item").click(function() {
      let items = [];
      let selected = $(this).data("item")
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
                <div class='card item-card'>
                  <div class='item-card card-body'>
                    <h4 class='item-name'>${currentItem.itemName}</h4>
                    <p class='card-text item-count public-item' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
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

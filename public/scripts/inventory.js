'use strict';

$(document).ready(function() {
  // list for appending to DOM
  let items = [];
  
  // connect inventory
  const REF = firebase.database().ref('/inventory')

  // initial data 
  REF.once("value", snapshot => {
    let res = snapshot.val()
    for (let item in res) {
      let currentItem = res[item]
      console.log(currentItem.barcode)
      items.push(`<div class='card'><img class='card-img-top' src='https://images.unsplash.com/photo-1517303650219-83c8b1788c4c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=bd4c162d27ea317ff8c67255e955e3c8&auto=format&fit=crop&w=2691&q=80' alt='Card image cap'><div class='card-body'><h4 class='item-name'>${currentItem.itemName}</h4><p class='card-text item-count' data-itemid='${currentItem.barcode}'>${currentItem.count}</p></div></div>`)
    }
    // append to dom
    $("#inventory-items").append(items)
    })

    // watch for data changes while page is open
    REF.on("child_changed", snapshot => {
      let res = snapshot.val()
      let item = document.querySelector(`[data-itemid='${res.barcode}']`)
      item.textContent = res.count;
    })
  });

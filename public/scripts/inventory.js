'use strict';
$(document).ready(function() {
  const REF = firebase.database().ref('/inventory')
  let items = [];

  REF.on("value", snapshot => {
    let res = snapshot.val()
    console.log(res)
    for (let item in res) {
      let currentItem = res[item]
      items.push(`<div class='card'><img class='card-img-top' src='https://images.unsplash.com/photo-1517303650219-83c8b1788c4c?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=bd4c162d27ea317ff8c67255e955e3c8&auto=format&fit=crop&w=2691&q=80' alt='Card image cap'><div class='card-body'><h4 class='item-name'>${currentItem.itemName}</h4><p class='card-text item-count'>${currentItem.count}</p></div></div>`)
    }
    $("#inventory-items").append(items)
    })
});

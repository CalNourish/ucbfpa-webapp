'use strict';
// Global Variables
const ALL_ITEMS = []
const FAVORITES = {} // Store all items in-memory
const FULL_TABLE = [] // Save the full table to reference when "all" is selected
var current_table = [] // For the current version of the table based on category
var current_items = []




// returns a heart element with the appropriate barcode and fill state
function oldGetHeart(filled, barcode) {
  var emptyHeart = '<td><div barcode=' + barcode + ' onclick="addToFavs(this)"><i class="fa fa-heart-o" style="cursor:pointer"></i></div></td>';
  var filledHeart = '<td><div barcode=' + barcode + ' onclick="removeFromFavs(this)"><i class="fa fa-heart" style="cursor:pointer; color:red"></i></div></td>';
  return (filled ? filledHeart : emptyHeart);
}

function removeFromFavs(div) {
  div.childNodes[0].outerHTML = '<i class="fa fa-heart-o"></i>';
  div.setAttribute('onClick', 'addToFavs(this)');
  var barcode = parseInt(div.attributes['barcode'].nodeValue, 10);
  var favs_list = getFavs();
  var old_list = JSON.stringify(favs_list);
  FAVORITES[barcode] = false
  if (favs_list.includes(barcode)) {
    favs_list.splice(favs_list.indexOf(barcode), 1);
    document.cookie = document.cookie.replace(old_list, JSON.stringify(favs_list));
  }
}

// store local favorites in an array in a cookie
function addToFavs(div) {
  div.childNodes[0].outerHTML = '<i class="fa fa-heart" style="color:red"></i>';
  div.setAttribute('onClick', 'removeFromFavs(this)');
  var barcode = parseInt(div.attributes['barcode'].nodeValue, 10);
  FAVORITES[barcode] = true
  if (document.cookie == "" || !document.cookie.includes("fav_items")) {
    document.cookie = document.cookie + " fav_items=[" + barcode + "];";
  } else {
    var favs_list = getFavs();
    var old_list = JSON.stringify(favs_list);
    if (!favs_list.includes(barcode)) {
      favs_list.push(barcode);
      document.cookie = document.cookie.replace(old_list, JSON.stringify(favs_list));
    }
  }
};

// get iterable list of local favorite barcodes from cookie
function getFavs() {
  var sub_cookie = document.cookie.match(/fav_items=\[[\d+,{0,1}]+\]/);
  if (sub_cookie == null) {
    return [];
  }
  return JSON.parse(sub_cookie[0].split('=')[1]);
}

$(document).ready(function() {
  // Table Selector
  const TABLE_SELECTOR = $(".inventory-table tbody")

  // connect inventory
  const REF = firebase.database().ref('/inventory')

  // initialize data 
  REF.once("value", snapshot => {
    let res = snapshot.val()
    for (let item in res) {
      let currentItem = res[item]
      let category_dict = currentItem.categoryName
      let categories = []
      for (let category in category_dict) {
        categories.push(category)
      }
      // Set favorite 
      let favs = getFavs()
      let heart = getHeart(false, currentItem.barcode)
      heart = getHeart(true, currentItem.barcode)
      let is_favorite = false
      if (favs.includes(parseInt(currentItem.barcode, 10))) {
        is_favorite = true
      }
      FAVORITES[currentItem.barcode] = is_favorite
      ALL_ITEMS.push(new Item(currentItem.itemName, currentItem.barcode, currentItem.count, categories, is_favorite))
    }
    current_items = ALL_ITEMS
    current_items.forEach((item) => {
      FULL_TABLE.push(guest_table_row(item.name, item.count, item.barcode))
    })
    // Append full table to dom
    current_table = FULL_TABLE
    TABLE_SELECTOR.append(current_table);
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

  // Sort table on click
  $(".table-header").on("click", function() { 
    sortTableByKey(TABLE_SELECTOR, $(this).data("sort-by"), guest_table_row)
    searchItem()
  });

    // function showCategory(selected, view) {
    //   let items = [];
    //   $("#selected-category").text(selected.charAt(0).toUpperCase() + selected.slice(1))
    //   if (selected != 'all') {
    //     REF.once("value", snapshot => {
    //       let res = snapshot.val()
    //       let favs = getFavs()
    //       for (let item in res) {
    //         let currentItem = res[item]
    //         let categories = currentItem.categoryName
    //         let isFave = false
    //         // if this item is a favorite, add that attribute
    //         if (favs.includes(parseInt(currentItem.barcode, 10))) {
    //           isFave = true
    //           categories['favorites'] = 'favorites'
    //         }

  // Clear page and select items by category
  $(".list-group-item.category-item").click(function() {
    let selected = $(this).data("item")
    $(".list-group-item.category-item").removeClass("active")
    $(`[data-item=${selected}`).addClass("active")
    showCategory(selected);
  });

  function showCategory(selected) {
    TABLE_SELECTOR.empty();
    current_table = [];
    current_items = [];
    $("#selected-category").text(selected.charAt(0).toUpperCase() + selected.slice(1))
    if (selected == "favorites") {
      ALL_ITEMS.forEach((item) => {
        if (FAVORITES[item.barcode]) {
          current_items.push(item)
          current_table.push(guest_table_row(item.name, item.count, item.barcode))
        }
      })
    } else if (selected != 'all') {
      ALL_ITEMS.forEach((item) => {
        for (let i = 0; i < item.categories.length; i++) {
          if (item.categories[i] == selected) {
            current_items.push(item)
            current_table.push(guest_table_row(item.name, item.count, item.barcode))
            break;
          }
        }
      })
    } else {
      current_items = ALL_ITEMS
      current_table = FULL_TABLE
    }
    // update DOM
    TABLE_SELECTOR.append(current_table).hide()
    setTimeout(() => searchItem(), 5)
    setTimeout(() => TABLE_SELECTOR.show(), 10)
    sortTableByKey(TABLE_SELECTOR, sort_order, guest_table_row)
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
    txtValue = li[i].textContent
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].classList.remove("hidden")
    } else {
      li[i].classList.add("hidden");
    }
  }
}

function standardizeName(itemName) {
  var newName = itemName;
  if (itemName.length > 20) {
    var newName = itemName.slice(0, 20) + "...";
  }
  return newName;
}

'use strict';
// Global Variables
const ALL_ITEMS = []
const FAVORITES = {} // Store all items in-memory
const FULL_TABLE = [] // Save the full table to reference when "all" is selected
var current_table = [] // For the current version of the table based on category
var current_items = []

function removeFromFavs(div) {
  div.childNodes[0].outerHTML = '<i class="fa fa-heart-o"></i>';
  div.setAttribute('onClick', 'addToFavs(this)');
  var barcode = div.attributes['barcode'].nodeValue;
  var favs_list = getFavs();
  var old_list = JSON.stringify(favs_list);
  FAVORITES[barcode] = false
  console.log(FAVORITES[barcode])
  if (favs_list.includes(barcode)) {
    favs_list.splice(favs_list.indexOf(barcode), 1);
    document.cookie = document.cookie.replace(old_list, JSON.stringify(favs_list));
  }
}

// store local favorites in an array in a cookie
function addToFavs(div) {
  div.childNodes[0].outerHTML = '<i class="fa fa-heart" style="color:red"></i>';
  div.setAttribute('onClick', 'removeFromFavs(this)');
  var barcode = div.attributes['barcode'].nodeValue;

  FAVORITES[barcode] = true
  if (document.cookie == "" || !document.cookie.includes("fav_items")) {
    document.cookie = document.cookie + " fav_items=[\"" + barcode + "\"];";
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
  var sub_cookie = document.cookie.match(/fav_items=\[["\d+",{0,1}]+\]/);
  if (sub_cookie == null) {
    return [];
  }
  return JSON.parse(sub_cookie[0].split('=')[1]);
}


function removeFromFavs(div) {
  div.childNodes[0].outerHTML = '<i class="fa fa-heart-o"></i>';
  div.setAttribute('onClick', 'addToFavs(this)');
  var barcode = parseInt(div.attributes['barcode'].nodeValue, 10);
  var favs_list = getFavs();
  var old_list = JSON.stringify(favs_list);
  if (favs_list.includes(barcode)) {
    favs_list.splice(favs_list.indexOf(barcode), 1);
    document.cookie = document.cookie.replace(old_list, JSON.stringify(favs_list));
  }
}


$(document).ready(function() {
  // Table Selector
  const TABLE_SELECTOR = $(".inventory-table tbody")

  // list for appending to DOM
  let sidebar = [];
  let dropdown = [];

  // // TODO connect to get categories
  // const categories = ['grains', 'canned', 'protein', 'frozen', 'snacks', 'sauces', 'spices', 'beverages']

  // categories.forEach((category) => {
  //   sidebar.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="list" data-item="${category}" href="#" role="tab">${category}</a>`)
  //   dropdown.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="dropdown" data-item="${category}" href="#" role="tab">${category}</a>`)
  // }) 
  
  // $(".list-group").append(sidebar);
  // $(".dropdown-menu").append(dropdown);

  const categoryRef = firebase.database().ref('/category')
  categoryRef.once("value", snapshot => {
    let res = snapshot.val();

    Object.keys(res).forEach((category) => {
      let upperCaseCategory = category.charAt(0).toUpperCase() + category.slice(1)
      sidebar.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="list" data-item="${category}" href="#" role="tab">${upperCaseCategory}</a>`)
      dropdown.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="dropdown" data-item="${category}" href="#" role="tab">${upperCaseCategory}</a>`)
    });
    
    // append to dom 
  
    $(".list-group").append(sidebar);
    $(".dropdown-menu").append(dropdown);
  })
  

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
      let is_favorite = favs.includes(currentItem.barcode)

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

  // Clear page and select items by category
  $(".list-group").on('click', ".list-group-item", selectItemsOnCategoryClick);

  function selectItemsOnCategoryClick() {
    let selected = $(this).data('item')
    $('.list-group-item.category-item').removeClass('active')
    $(`[data-item=${selected}`).addClass('active')
    showCategory(selected);
  }

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

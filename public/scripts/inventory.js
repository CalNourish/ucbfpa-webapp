'use strict';



// returns a heart element with the appropriate barcode and fill state
function getHeart(filled, barcode) {
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

  // list for appending to DOM
  let allItems = [];
  let fullTable = [];
  // connect inventory
  const REF = firebase.database().ref('/inventory')

  // initial data 
  REF.once("value", snapshot => {

    let res = snapshot.val()
    for (let item in res) {
      let currentItem = res[item]
      let favs = getFavs()
      allItems.push(
        `<div class='card item-card'>
          <div class='item-card card-body'>
            <h4 class='item-name'>${currentItem.itemName}</h4>
            <div class='count-wrapper'>
              <p class='card-text item-count public-item' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
            </div>
          </div>
        </div>`)
    let heart = getHeart(false, currentItem.barcode)
    if (favs.includes(parseInt(currentItem.barcode, 10))) {
      heart = getHeart(true, currentItem.barcode)
    }
      fullTable.push(`
        <tr>
          ${heart}
          <td>${currentItem.itemName}</td>
          <td data-itemid='${currentItem.barcode}'>${currentItem.count}</td>
        </tr>
      `)
    }
    // append to dom
    $(".inventory-table tbody").append(fullTable)
  })

    // watch for data changes while page is open
    REF.on("child_changed", snapshot => {
      let res = snapshot.val()
      let item = document.querySelectorAll(`[data-itemid='${res.barcode}']`)
      // If item is currently rendered
      if (item) {
        item.textContent = res.count;
      }
    })

    // Clear page and select items by category
    $(".list-group-item.category-item").click(function() {
      let selected = $(this).data("item")
      $(".list-group-item.category-item").removeClass("active")
      $(`[data-item=${selected}`).addClass("active")
      let view = $(".view-item.active").data("view")
      showCategory(selected, view);
    });

    // Change view style
    $(".view-item").on("click", (el) => {
      if (!el.currentTarget.classList.contains("active")) {
        $(".view-item.active").removeClass("active")
        el.currentTarget.classList.add("active")
        let activateView = el.currentTarget.dataset.view
        let selected = $(".list-group-item.active.category-item")[0].textContent.toLowerCase()
        if (activateView == "table") {
          $("#inventory-items").empty()
          $("#inventory-items").css("display", "none").removeClass("d-flex")
          $(".inventory-table").show()
          showCategory(selected, "table")
        } else {
          $(".inventory-table tbody").empty()
          $(".inventory-table").hide()
          $("#inventory-items").show().addClass("d-flex")
          showCategory(selected, "cards")
        }
      }
    })

    function showCategory(selected, view) {
      let items = [];
      $("#selected-category").text(selected.charAt(0).toUpperCase() + selected.slice(1))
      if (selected != 'all') {
        REF.once("value", snapshot => {
          let res = snapshot.val()
          let favs = getFavs()
          for (let item in res) {
            let currentItem = res[item]
            let categories = currentItem.categoryName
            let isFave = false
            // if this item is a favorite, add that attribute
            if (favs.includes(parseInt(currentItem.barcode, 10))) {
              isFave = true
              categories['favorites'] = 'favorites'
            }
            for (let category in categories) {
              if (category == selected) {
                // Card view
                if (view == "cards") {
                  items.push(`
                  <div class='card item-card'>
                    <div class='item-card card-body'>
                      <h4 class='item-name'>${currentItem.itemName}</h4>
                      <p class='card-text item-count public-item' data-itemid='${currentItem.barcode}'>${currentItem.count}</p>
                    </div>
                  </div>`)
                } else {
                  items.push(`
                  <tr>
                    ${getHeart(isFave, currentItem.barcode)}
                    <td>${currentItem.itemName}</td>
                    <td data-itemid='${currentItem.barcode}'>${currentItem.count}</td>
                  </tr>
                  `)
                }

              }
            }
          }
          // update DOM
          if (view == "cards") {
            $('#inventory-items').empty();
            $("#inventory-items").append(items)
          } else {
            $(".inventory-table tbody").empty();
            $(".inventory-table tbody").append(items);
          }
        })
      } else {
          // update DOM
          if (view == "cards") {
            $('#inventory-items').empty();
            $("#inventory-items").append(allItems)
          } else {
            $(".inventory-table tbody").empty();
            $(".inventory-table tbody").append(fullTable);
          }

      }
    }
  });

  function searchItem() {
    // Declare variables
    var input, filter, items, li, a, i, txtValue, cards, name;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    if ($("[data-view='table']").hasClass("active")) {
      items = document.getElementById("table-items");
      li = items.getElementsByTagName('tr');
      // Loop through all list items, and hide those who don't match the search query
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("td")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    } else {
      items = document.getElementById("inventory-items");
      cards = document.querySelectorAll(".card.item-card")
      // Loop through all list items, and hide those who don't match the search query
      for (i = 0; i < cards.length; i++) {
        name = cards[i].querySelector(".item-name")
        txtValue = name.textContent || name.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          cards[i].style.display = "";
        } else {
          cards[i].style.display = "none";
        }
      }
    }
  

  }

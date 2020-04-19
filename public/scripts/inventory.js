'use strict';

$(document).ready(function() {

  // list for appending to DOM
  let allItems = [];
  let fullTable = [];
  let sidebar = [];
  let dropdown = [];

  // TODO connect to get categories
  const categories = ['grains', 'canned', 'protein', 'frozen', 'snacks', 'sauces', 'spices', 'beverages']

  categories.forEach((category) => {
    sidebar.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="list" data-item="${category}" href="#" role="tab">${category}</a>`)
    dropdown.push(`<a class="list-group-item category-item list-group-item-action" id="list-${category}-list" data-toggle="dropdown" data-item="${category}" href="#" role="tab">${category}</a>`)
  }) 
  
  $(".list-group").append(sidebar);
  $(".dropdown-menu").append(dropdown);

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
    
      fullTable.push(`
        <tr>
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
          for (let item in res) {
            let currentItem = res[item]
            let categories = currentItem.categoryName
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

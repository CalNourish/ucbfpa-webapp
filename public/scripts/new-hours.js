'use strict'
let tbody = document.querySelector('#draggable-hours tbody');

// Configurable start and end time (not open and close) to display
let [start, end] = [7, 21]; 

// 15, 30, 60
let interval = 60;

// Create Table
/**
 * 
 * @param {Number} start Earliest selection time allowed
 * @param {Number} end Lastest selection time allowed
 * @param {Number} interval intervals of time
 */
// function createTable(start, end, interval) {
//   let fraction = interval/60
//   let i = 0;
//   while (i + start < end) {
//     for (let y = 0; y < 1; y += fraction) {
//       let tr = document.createElement('tr');
//       let td = document.createElement('td');
//       if (y == 0) {
//         td.textContent = `${i + start}:00`;
//       } else {
//         tr.style.height = `${16 * fraction}px`
//         console.log(tr.style.height)

//       }
//       tbody.appendChild(tr);
//       tr.appendChild(td);
//     }
//     i+=1
//   }
//   let tr = document.createElement('tr');
//   let td = document.createElement('td');
//   td.textContent = `${i + start}:00`;
//   tbody.appendChild(tr);
//   tr.appendChild(td);
// }


function createTable(a,b,c) {
  for (let i = 0; i < 12; i++) {
    let tr = document.createElement('tr');
    tr.style.height = '20px'
    for (let y = 0; y < 7; y++) {
      let td = document.createElement('td')
      td.dataset.row = i
      td.dataset.col = y
      tr.appendChild(td)
    }
    tbody.appendChild(tr)
  }
}


$(document).ready(function() {
  createTable(start, end, interval);

  // $("td").on("mousedown", function() {
  //   let currIndex = $(this).index();
  //   $("td").on("mouseup", function() {
  //     currIndex = null;
  //     return;
  //   })
  //   $(this).toggleClass("select-open")
  //   $("td").on("mouseover", function() {
  //     if ($(this).index() == currIndex) {
  //       if ($(this).hasClass("select-open")) {
  //         $(this).removeClass("select-open")
  //       } else {
  //         $(this).addClass("select-open");
  //       }
  //     } 
  //   })

  // })

  // $("td").on("click", function() {
  //   $(this).toggleClass("select-open")
  // })

  $("td").on("mousedown", function() {
    let currIndex = $(this).index();
    $("td").bind("mouseover", function() {
      if ($(this).index() == currIndex) {
        if ($(this).hasClass("select-open")) {
          $(this).removeClass("select-open")
        } else {
          $(this).addClass("select-open")
        }
      }
    })
  }).on("mouseup", function() {
    $("td").unbind("mouseover")
  })

  
})

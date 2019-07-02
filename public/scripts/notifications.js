'use strict';

var formElement = document.getElementById('send-notification-form');
var notifTitleElement = document.getElementById('notifTitle');
var notifTextElement = document.getElementById('notifText');

function sendNotification(event) {
    event.preventDefault();

    var notifTitle = notifTitleElement.value;
    var notifText = notifTextElement.value;
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var timestamp = date + ' ' + time;
  
    var notification = {
        text: notifText,
        timestamp: timestamp,
        title: notifTitle
    };

    firebase
        .database()
        .ref('/notification')
        .push(notification)
        .then(function() {
            // goToCheckout();
            notifTitleElement.value = '';
            notifTextElement.value = '';
        })
        .catch(function(error) {
            console.error('Error saving order to /notification', error);
        });
}

formElement.addEventListener('submit', sendNotification);

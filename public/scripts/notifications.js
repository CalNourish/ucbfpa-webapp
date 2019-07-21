'use strict';

var formElement = document.getElementById('send-notification-form');
var notifTitleElement = document.getElementById('notifTitle');
var notifTextElement = document.getElementById('notifText');
var notificationList = document.querySelector('ol');

function getMostRecentNotifications() {
    firebase
        .database()
        .ref('/notification')
        .orderByChild("timestamp")
        .limitToLast(10)
        .on("child_added", function(snapshot) {
            var notification = document.createElement("li");   
            notification.textContent = "Title: " + snapshot.val().title + ", Text: " + snapshot.val().text + ", Timestamp: " + snapshot.val().timestamp;
            notificationList.insertBefore(notification, notificationList.firstChild);
        });
}

getMostRecentNotifications();

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

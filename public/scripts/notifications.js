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
            notification.className = "notification card"
            var title = document.createElement('h3')
            title.className = "notification-title"
            var body = document.createElement('p')
            var timestamp = document.createElement('div')
            title.textContent = snapshot.val().title
            body.textContent = snapshot.val().text
            timestamp.textContent = "Timestamp: " + snapshot.val().timestamp
            notificationList.insertBefore(notification, notificationList.firstChild);
            notification.appendChild(title)
            notification.appendChild(body)
            notification.appendChild(timestamp)
        });
}

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

getMostRecentNotifications();
formElement.addEventListener('submit', sendNotification);

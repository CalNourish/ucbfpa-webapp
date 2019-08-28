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

    if (notifTitle.length > 50) {
        //ask if they want to shorten title
        if (confirm("Send this notification? Your title length is " + notifTitle.length + " and may be truncated on some phone screens.")) {
            firebase
            .database()
            .ref('/notification')
            .push(notification)
            .then(function() {
                notifTitleElement.value = '';
                notifTextElement.value = '';
            })
            .catch(function(error) {
                console.error('Error saving order to /notification', error);
            });
        }
    } else if (notifText.length > 50) {
        //ask to shorten text
        if (confirm("Send this notification? Your text length is " + notifText.length + " and may be truncated on some phone screens.")) {
            firebase
            .database()
            .ref('/notification')
            .push(notification)
            .then(function() {
                notifTitleElement.value = '';
                notifTextElement.value = '';
            })
            .catch(function(error) {
                console.error('Error saving order to /notification', error);
            });
        }
    } else {
        //confirm send
        if (confirm("Send this notification?")) {
            firebase
            .database()
            .ref('/notification')
            .push(notification)
            .then(function() {
                notifTitleElement.value = '';
                notifTextElement.value = '';
                toastr.info('Notification sent')
            })
            .catch(function(error) {
                console.error('Error saving order to /notification', error);
                toastr.error(error, "Error sending notification")
            });
        }
    }



}

// Toast options
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "showDuration": "200",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "2000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

getMostRecentNotifications();
formElement.addEventListener('submit', sendNotification);

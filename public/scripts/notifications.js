'use strict';

configureNotifications();

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

    // TODO: Null checks.
  
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

function sendTokenToServer(generatedToken) {
  event.preventDefault();

  var token = {};
  token[generatedToken] = ''; 

  firebase
      .database()
      .ref('/notificationToken')
      .update(token)
      .catch(function(error) {
          console.error('Error saving token to /notificationToken', error);
      });
}

function configureNotifications() {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      const messaging = firebase.messaging();
      messaging.usePublicVapidKey("BOtZcASfobhUcw5aNkd2URdFSeWWlN-mdeYDT5rCsH2ONC5SZ2RcsQhF4gCx7QFjfk1cOHu54Yuymb_W5Mvce_E");
      messaging.getToken().then((currentToken) => {
        if (currentToken) {
          sendTokenToServer(currentToken);
          console.log(currentToken);
        } else {
          console.log('No Instance ID token available. Request permission to generate one.');
        }
      }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    });
      console.log('Notification permission granted.');
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
}

formElement.addEventListener('submit', sendNotification);

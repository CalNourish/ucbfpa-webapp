'use strict';

var formElement = document.getElementById('send-notification-form');
var notifTitleElement = document.getElementById('notifTitle');
var notifTextElement = document.getElementById('notifText');

function sendNotification(event) {
    event.preventDefault();

    var notifTitle = notifTitleElement.value;
    var notifText = notifTextElement.value;

    console.log(notifTitle);
    console.log(notifText);
}

formElement.addEventListener('submit', sendNotification);

// function goToCheckout() {
//     window.location.href = "/checkout";
// }

// function configureNotifications() {
//     const messaging = firebase.messaging();
//     messaging.usePublicVapidKey("BOtZcASfobhUcw5aNkd2URdFSeWWlN-mdeYDT5rCsH2ONC5SZ2RcsQhF4gCx7QFjfk1cOHu54Yuymb_W5Mvce_E");
  
//     Notification.requestPermission().then((permission) => {
//       if (permission === 'granted') {
//         console.log('Notification permission granted.');
//         // TODO(developer): Retrieve an Instance ID token for use with FCM.
//         // ...
//       } else {
//         console.log('Unable to get permission to notify.');
//       }
//     });
// }
  
//   // Get Instance ID token. Initially this makes a network call, once retrieved
//   // subsequent calls to getToken will return from cache.
// messaging.getToken().then((currentToken) => {
//     if (currentToken) {
//       sendTokenToServer(currentToken);
//       updateUIForPushEnabled(currentToken);
//     } else {
//       // Show permission request.
//       console.log('No Instance ID token available. Request permission to generate one.');
//       // Show permission UI.
//       updateUIForPushPermissionRequired();
//       setTokenSentToServer(false);
//     }
//   }).catch((err) => {
//     console.log('An error occurred while retrieving token. ', err);
//     showToken('Error retrieving Instance ID token. ', err);
//     setTokenSentToServer(false);
// });
  
//   // Callback fired if Instance ID token is updated.
// messaging.onTokenRefresh(() => {
//     messaging.getToken().then((refreshedToken) => {
//       console.log('Token refreshed.');
//       // Indicate that the new Instance ID token has not yet been sent to the
//       // app server.
//       setTokenSentToServer(false);
//       // Send Instance ID token to app server.
//       sendTokenToServer(refreshedToken);
//       // ...
//     }).catch((err) => {
//       console.log('Unable to retrieve refreshed token ', err);
//       showToken('Unable to retrieve refreshed token ', err);
//     });
// });
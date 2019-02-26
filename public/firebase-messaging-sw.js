// The web app needs a Service Worker that will receive and display web notifications,
// like for Food Recovery. Don't move or delete this file.

importScripts('/__/firebase/5.5.7/firebase-app.js');
importScripts('/__/firebase/5.5.7/firebase-messaging.js');
importScripts('/__/firebase/init.js');

firebase.messaging();

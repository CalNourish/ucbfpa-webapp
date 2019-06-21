'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');

admin.initializeApp();

exports.subscribeToFoodPantry = functions
  .database
  .ref('/notificationToken/{notificationToken}')
  .onWrite(async (change, context) => {
    const notificationToken = context.params.notificationToken;

    admin.messaging().subscribeToTopic(notificationToken, 'foodPantry')
      .then(function(response) {
        console.log('Successfully subscribed to topic:', response);
      })
      .catch(function(error) {
        console.log('Error subscribing to topic:', error);
      });
  });

exports.sendNotification = functions
  .database
  .ref('/notification/{notification}')
  .onWrite(async (change, context) => {
    var notification = context.params.notification;
    console.log('Notification: ');
    console.log(notification);

    // admin.messaging().send(notification, 'foodPantry')
    //   .then(function(response) {
    //     console.log('Successfully subscribed to topic:', response);
    //   })
    //   .catch(function(error) {
    //     console.log('Error subscribing to topic:', error);
    //   });
  });
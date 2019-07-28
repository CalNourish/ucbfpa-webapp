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

    const notification = change.after.val();

    var message = {
      notification: {
        title: notification.title,
        body: notification.text
      },
      topic: 'foodPantry'
    };

    // Send a message to devices subscribed to the provided topic.
    admin.messaging().send(message)
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  });

exports.authorizeLogin = functions
  .https
  .onCall((data, context) => {

    const contextAuth = context.auth;
    if (contextAuth == null) {
      return {
        authorized: "false"
      };
    }

    const token = contextAuth.token;
    if (token == null) {
      return {
        authorized: "false"
      };
    }

    return admin
      .database()
      .ref('authorizedUser')
      .once('value')
      .then(function(data) {
        var authorizedUsersFromDb = data.val();
        var authorizedEmails = [];
        for (const [name, email] of Object.entries(authorizedUsersFromDb)) {
          authorizedEmails.push(email);
        }

        const loginEmail = token.email;
        var isEmailAuthorized = authorizedEmails.indexOf(loginEmail) >= 0;
        if (isEmailAuthorized) {
          return {
            authorized: "true"
          };
        }

        return {
          authorized: "false"
        };
      });
});
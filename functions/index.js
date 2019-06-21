'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request');

admin.initializeApp();

exports.subscribeToFoodPantry = functions.database.ref('/notificationToken/{notificationTokenUid}')
    .onWrite(async (change, context) => {

      const notificationTokenUid = context.params.notificationTokenUid;

      request
        .post(
	      'https://iid.googleapis.com/iid/v1/' + notificationTokenUid + '/rel/topics/foodPantry',
	      {
	      	json: {},
	      	'auth': {
              'bearer': '<API-KEY>'
            }
	      },
	      function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	          console.log(body);
	        } else {
	          console.log(error);
	        }
	      }
	    );
    });
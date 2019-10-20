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

async function sendNotification(event) {
    event.preventDefault();

    var notifTitle = notifTitleElement.value;
    var notifText = notifTextElement.value;

    var confirmationMessage;
    if (notifTitle.length > 50) {
        confirmationMessage = "Send this notification? Your title length is " + notifTitle.length + " and may be truncated on some phone screens.";
    } else if (notifText.length > 50) {
        confirmationMessage = "Send this notification? Your text length is " + notifText.length + " and may be truncated on some phone screens.";
    } else {
        confirmationMessage = "Send this notification?";
    }

    if (confirm(confirmationMessage)) {
        var lambdaAuthorization = await firebase
        .database()
        .ref('lambdaAuthorization')
        .once('value')
        .then((data) => {
            return data.val();
        });

        var expoNotification = {
            title: notifTitle,
            message: notifText
        };

        var sendNotificationParams = {
            FunctionName : lambdaAuthorization['AWS_LAMBDA_FUNCTION_NAME'],
            InvocationType : 'Event',
            LogType : 'None',
            Payload: JSON.stringify(expoNotification)
        };

        AWS.config.region = lambdaAuthorization['AWS_COGNITO_REGION'];
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: lambdaAuthorization['AWS_COGNITO_IDENTITY_POOL'],
        });
        var lambda = new AWS.Lambda({region: lambdaAuthorization['AWS_LAMBDA_REGION'], apiVersion: lambdaAuthorization['AWS_LAMBDA_API_VERSION']});
        lambda.invoke(sendNotificationParams, function(error, unused) {
            if (error) {
                prompt(error);
            }
        });

        var today = new Date();
        function pad(n) { return n < 10 ? '0' + n : n }
        var date = today.getFullYear() + '-' + pad(today.getMonth()+1) + '-' + pad(today.getDate());
        var time = pad(today.getHours()) + ":" + pad(today.getMinutes()) + ":" + pad(today.getSeconds());
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
                notifTitleElement.value = '';
                notifTextElement.value = '';
                toastr.info('Notification sent')
            })
            .catch(function(error) {
                console.error('Error saving to /notification', error);
                toastr.error(error, "Error sending notification");
            });
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
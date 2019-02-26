/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var DEFAULT_ITEM_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
var DEFAULT_ITEM_ID_LENGTH = 5;

// key, location, name, phone, pickupDate, pickupStart, pickupEnd, donation, picUrl

// Loads chat message history and listens for upcoming ones.
function loadMessages() {
  // Loads the last 12 messages and listens for new ones.
  var callback = function(snap) {
    var data = snap.val();
    displayMessage(snap.key,
      data.location,
      data.name,
      data.phone,
      data.pickUpDate,
      data.pickUpFrom,
      data.pickUpUntil,
      data.donation,
      "https://image.flaticon.com/icons/svg/355/355980.svg");
  };

  firebase.database().ref('/foodRecovery/').limitToLast(12).on('child_added', callback);
  firebase.database().ref('/foodRecovery/').limitToLast(12).on('child_changed', callback);
}

// Saves a new message in the Realtime Database.
function saveMessage(messageText) {
  // Adds a new message entry to the Realtime Database.
  return firebase.database().ref('/messages/').push({
    name: getUserName(),
    text: messageText,
    profilePicUrl: getProfilePicUrl()
  }).catch(function(error) {
    console.error('Error writing new message to Realtime Database:', error);
  });
}

// Saves a new message containing an image in Firebase.
// This method first saves the image in Cloud Storage.
function saveImageMessage(file) {
  // 1 - Add a chat message placeholder (a loading icon) that will ultimately get updated with the shared image.
  firebase.database().ref('/messages/').push({
    name: getUserName(),
    imageUrl: LOADING_IMAGE_URL,
    profilePicUrl: getProfilePicUrl()
  }).then(function(messageRef) {
    // 2 - Upload the image to Cloud Storage.
    var filePath = firebase.auth().currentUser.uid + '/' + messageRef.key + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
      // 3 - Generate a public URL for the image file.
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Update the chat message placeholder with the image's URL.
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        });
      });
    });
  }).catch(function(error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
}


// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (checkSignedInWithMessage()) {
    saveImageMessage(file);
  }
}


// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}``

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function() {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Displays a Message in the UI.

function displayMessage(key, location, name, phone, pickupDate, pickupStart, pickupEnd, donation, picUrl) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    messageListElement.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
  }
  div.querySelector('.name').textContent = "Received: " + Math.floor(Math.random() * 5) + " minutes ago";
  var messageElement = div.querySelector('.message');

  messageElement.textContent = "";
  messageElement.textContent += "Name: " + name + "\n";
  messageElement.textContent += "Location: " + location + "\n";
  messageElement.textContent += "Phone: " + phone + "\n";
  messageElement.textContent += "Pickup: " + pickupDate + " @ " + pickupStart + " - " + pickupEnd + "\n";
  messageElement.textContent += "Donation: " + donation + "\n";


  // Replace all line breaks by <br>.
  messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}


// Checks that Firebase has been imported.
checkSetup();

// Shortcuts to DOM Elements.
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);

// // Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// Events for image upload.
imageButtonElement.addEventListener('click', function(e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);

//We load currently existing chat messages and listen to new ones.
loadMessages();

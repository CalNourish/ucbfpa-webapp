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

// Signs-in UC Berkeley Food Pantry.
function signIn() {
  // Sign into Firebase using popup auth & Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  console.log("signing in")
  firebase.auth().signInWithRedirect(provider)
}

// Signs-out of UC Berkeley Food Pantry.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate Firebase Auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return firebase.auth().currentUser;
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  var authorizeLogin = firebase
    .functions()
    .httpsCallable('authorizeLogin');

  authorizeLogin({}).then(function(result) {
    // Read result of the Cloud Function.
    let authorized = false;
    // Check that result.data is not null
    if (result.data) {
      authorized = result.data.authorized;
    }
    if (user && authorized === "true") { // User is signed in and is authorized!

      // Get the signed-in user's profile pic and name.
      var profilePicUrl = getProfilePicUrl();
      var userName = getUserName();

      // Set the user's profile pic and name.
      userPicElement.style.backgroundImage = 'url(' + profilePicUrl + ')';
      userNameElement.textContent = userName;

      // Show user's profile and sign-out button.
      userNameElement.removeAttribute('hidden');
      userPicElement.removeAttribute('hidden');
    
      // Display logged-in nav bar elements 
      loggedIn.css("display", "block")
      loggedOut.css("display", "none")
      
      // Display content
      $("#main-content").css("visibility", "visible");

    } else { // User is signed out or unauthorized.

      // Hide user's profile and sign-out button.
      userNameElement.setAttribute('hidden', 'true');
      userPicElement.setAttribute('hidden', 'true');

      // Display logged-out nav bar element
      loggedIn.css("display", "none");
      loggedOut.css("display", "block")

      // Redirect to index if not already there
      if (window.location.pathname != "/pantry-volunteers/") {
        window.location.href="/pantry-volunteers/"
      }
    }
  });
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage(provider) {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };

  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Shortcuts to DOM Elements.
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var accountDropdown = document.getElementById('account-dropdown');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');
var loggedIn= $(".logged-in")
var loggedOut = $(".logged-out")

// Saves message on form submit.
// messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

// Checks that Firebase has been imported.
checkSetup();

// Initialize auth
initFirebaseAuth();


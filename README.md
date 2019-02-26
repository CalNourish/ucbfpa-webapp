# Firebase Web Codelab - Start code

This folder contains the starting code for the [Firebase: Build a Real Time Web Chat App Codelab](https://codelabs.developers.google.com/codelabs/firebase-web/).

# Webapp
Tutorial followed for setup: 
`https://codelabs.developers.google.com/codelabs/firebase-web/#0`

To run the webapp locally:

Setup:
`npm -g install firebase-tools`

`firebase login`

`firebase use --add`

From web directory: 
`firebase serve --only hosting`

`✔  hosting: Local server: http://localhost:5000`

To deploy:
`firebase deploy --except functions`

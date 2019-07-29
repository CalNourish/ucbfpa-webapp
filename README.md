# CalNourish WebApp

Tutorial followed for setup: 
`https://codelabs.developers.google.com/codelabs/firebase-web/#0`

To run the webapp locally:

Setup:
`npm -g install firebase-tools`

`firebase login`

`firebase use default`

From web directory: 
`firebase serve --only hosting`

`✔  hosting: Local server: http://localhost:5000`

To deploy the webapp:
`firebase deploy --except functions`

To deploy just the functions:
`firebase deploy --only functions`
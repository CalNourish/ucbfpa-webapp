# CalNourish WebApp

## Tutorial followed for setup: 
`https://codelabs.developers.google.com/codelabs/firebase-web/#0`

## To run the webapp locally:

**Setup:**

`npm -g install firebase-tools`

`firebase login`

`firebase use default`

<br>

**From web directory:** 

`firebase serve --only hosting`

`✔  hosting: Local server: http://localhost:5000`


<br>

## Test and Prod Projects
You should be granted access to the **TestCalNourish** and **ProdCalNourish** projects.

View list of current aliases for this local project: `firebase use`

**Add an alias:** Run `firebase use --add` to add aliases for the test and prod projects

**Switch between projects**: Run `firebase use <alias>`

<br>

## Deploying
**Make sure to make note of which firebase alias you are using when deploying**

To deploy the webapp: `firebase deploy --except functions`

To deploy just the functions: `firebase deploy --only functions`

**Test Deployment**: Feel free to deploy with **TestCalNourish** whenever to make sure things are stable

**Prod Deployment**: When ready to deploy to prod, `git tag <version name>` the most recent commit to master and deploy from the prod alias 




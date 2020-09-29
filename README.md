# CalNourish WebApp

## Setup Tutorial

We followed [this guide](https://codelabs.developers.google.com/codelabs/firebase-web/#0).

## Quick Start

```npm -g install firebase-tools```
```firebase login```
```firebase use default```

## Local Hosting

```firebase serve --only hosting```
```✔  hosting: Local server: http://localhost:5000```

Ensure that you have the proper permissions to access the volunteer side of the application. Sign in with the google email that has been granted acccess.

For now, the volunteer side requires manually navigating to the volunteer path `/pantry-volunteers`. We decided on this for user experience reasons; we did not want a sign-in button floating on the page and potentially confusing non-volunteers. 

## Test and Prod Environments

You should be granted access to the **TestCalNourish** and **ProdCalNourish** projects.

View list of current aliases for this local project: ```firebase use```.

To add an alias, run ```firebase use --add``` to add aliases for the test and prod projects.

To switch between projects, run ```firebase use <alias>```.

These aliases will automatically connect with the appropriate firebase projects (i.e. database, auth, etc.). In development, you should only use **TestCalNourish** with the alias of `default` or `test`.

## Styling
Make style changes in `assets/styles` and run `npm start` so changes to that file can be compiled to `public/styles` files.

## Deployment

**Test Deployment**: Feel free to deploy with **TestCalNourish** whenever to make sure things are stable. Do this by pushing to `origin/dev` (resolving any conflicts with other people's changes) and then merging with `origin/test` which will autodeploy to Firebase.

**Prod Deployment**: Any deployments to prod should be merged onto `master` from `origin/test` and then deployed using the Firebase CLI:
```firebase deploy --except functions```. Make sure to use the `production` alias:
```firebase use production```.

Our autodeploy actions use [this Action](https://github.com/marketplace/actions/github-action-for-firebase).

## Configuring Notifications with AWS Cognito and Lambda

Our sendNotification logic resides in AWS Lambda, and we use AWS Cognito to authenticate. The following guide will walk you step-by-step in recreating the installation instructions. For security, the credentials reside in the database. This guide was adapted from [Setting up Amazon Cognito and the Amazon SDK for Javascript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html).

1. Sign in to the AWS Management Console and open the Amazon Cognito console [here](https://console.aws.amazon.com/cognito/).
2. We selected "us-west-1 (Oregon)" as our region.
3. Choose "Manage Identity Pools" on the console opening page.
4. On the next page, choose "Create new identity pool". If you have no existing identity pools, skip this step. It will automatically go to the pool creation page.
5. In the Getting started wizard, type a name for your identity pool in Identity pool name. We picked ```CalNourish```.
6. Choose "Enable access to unauthenticated identities".
7. Choose "Create Pool".
8. On the next page, choose "View Details" to see the names of the two IAM roles created for your identity pool. Make a note of the name of both roles.
9. Choose "Allow".
10. For the platform, select "Javascript".
11. Under "Get AWS Credentials", remember this piece of code. You'll be adding it to the webapp.
12. To reiterate, remember the names of the two IAM roles you created for your identity pool as well as the code snippet above.
13. Go back to the IAM console [here](https://console.aws.amazon.com/iam/).
14. In the navigation panel on the left of the page, choose Roles.
15. In the list of IAM roles, click on the link for the unauthenticated identities role previously created by Amazon Cognito.
16. In the "Summary" page for this role, choose "Attach policies".
17. In the "Attach Permissions" page for this role, search for "Lambda" and then select the check box for AWSLambdaRole.
18. Choose "Attach policy".
19. Repeat for the authenticated identities role.

## Setting up Amazon SDK in Browser

1. Visit [this page](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/) to get the code snippet needed to use the Amazon SDK in your browser. Add this snippet to your html file. In our case, this code resides in our [ucbfpa-webapp](https://github.com/CalNourish/ucbfpa-webapp) repository.
2. Add the code snippet that authenticates the user to the webapp. Again, this code resides [here](https://github.com/CalNourish/ucbfpa-webapp).
3. The next steps were taken from this guide: [Setting up Amazon Lambda for Javascript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/browser-invoke-lambda-function-example.html)
4. Scroll to the "Creating the Lambda Service Object" section and copy this code snippet so that it resides after you authenticate with Amazon Cognito.
5. Update the region to the region your Lambda function resides in (this may or may not be the same as the region where your Amazon Cognito resides. For us, the Lambda function resides in us-west-1.).
6. Update the API version to a more recent date.
7. Inside the params variable, change the function name to our function name.
8. Scroll to the "Invoking the Lambda Function" section and copy this code snippet to execute the lambda function.
9. Execute your Lambda function!

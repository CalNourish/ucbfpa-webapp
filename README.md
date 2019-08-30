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

**Test Deployment**: Feel free to deploy with **TestCalNourish** whenever to make sure things are stable

**Prod Deployment**: When ready to deploy to prod, `git tag <version name>` the most recent commit to master and deploy from the prod alias 

## Setting up Amazon Cognito

1. The next few steps were taken from this guide: [Setting up Amazon Cognito and the Amazon SDK for Javascript](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-browser.html).
2. Sign in to the AWS Management Console and open the Amazon Cognito console [here](https://console.aws.amazon.com/cognito/).
3. We selected "us-west-1 (Oregon)" as our region.
4. Choose "Manage Identity Pools" on the console opening page.
5. On the next page, choose "Create new identity pool". If you have no existing identity pools, skip this step. It will automatically go to the pool creation page.
6. In the Getting started wizard, type a name for your identity pool in Identity pool name. We picked ```CalNourish```.
7. Choose "Enable access to unauthenticated identities".
8. Choose "Create Pool".
9. On the next page, choose "View Details" to see the names of the two IAM roles created for your identity pool. Make a note of the name of both roles.
10. Choose "Allow".
11. For the platform, select "Javascript".
12. Under "Get AWS Credentials", remember this piece of code. You'll be adding it to the webapp.
13. To reiterate, remember the names of the two IAM roles you created for your identity pool as well as the code snippet above.
14. Go back to the IAM console [here](https://console.aws.amazon.com/iam/).
15. In the navigation panel on the left of the page, choose Roles.
16. In the list of IAM roles, click on the link for the unauthenticated identities role previously created by Amazon Cognito.
17. In the "Summary" page for this role, choose "Attach policies".
18. In the "Attach Permissions" page for this role, search for "Lambda" and then select the check box for AWSLambdaRole.
19. Choose "Attach policy".
20. Repeat for the authenticated identities role.

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

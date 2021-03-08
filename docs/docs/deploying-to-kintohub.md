---
title: Deploying to KintoHub
---

[KintoHub](https://www.kintohub.com) is an all-in-one platform to combine and deploy your backend services, websites, cron jobs, databases and everything your app needs in one place.

KintoHub allows anyone to deploy for free their static websites.

## Prerequisites

This guide assumes you already have a Gatsby project to deploy. If you need a project, you can use the [Quick Start](/docs/quick-start) or KintoHub's template [Gatsby Template](https://github.com/kintohub-examples/gatsby-site/generate) before continuing.

## Deploy

1. Navigate to [KintoHub](https://app.kintohub.com/) and login/sign-up your account.

2. Create a new service of type **Static Website**.

3. Grant the permission needed for accessing the repo that you created in the previous step. Or if you prefer not to connect your GitHub account, you may select **Import URL** and provide your access token.

4. Configure the service. Add the build command `yarn && yarn build`. This command is actually doing the following:

   - Install the dependencies.
   - Run `gatsby build`.
   - Put the generated site into the `./public` directory, which is the default value of “Build Output Path”.

5. Everything is set up, now press the deploy button and wait until deployment is finished.

6. Once the deployment is finished you can close the release logs, check the **Access tab** and copy the URL there. Paste it to the browser and you will see your website is live!

### Custom domain

1. Access the **Domains** tab.
2. Enter your domain or subdomain you wish to map to your service.
3. Click **Add Domain**.
4. Follow the instructions to add a **CNAME** key and value to your DNS host provider.
5. Click **OK**.

Wait for the certificate to be generated and access your new custom domain.  
Note: your DNS might take some time to update your domain.

## Support

Chat with KintoHub developers on [Discord](https://kintohub.com/discord).

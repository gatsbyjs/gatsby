---
title: Deploying to Firebase Hosting
---

[Firebase Hosting](https://firebase.google.com/docs/hosting) is a free web content hosting platform for developers. With a single command, you can quickly deploy web apps and serve both static and dynamic content to a global CDN (content delivery network).

## Prerequisites

- A [Firebase Account](https://console.firebase.google.com)
- A [Firebase Project](https://firebase.google.com/docs/web/setup#create-firebase-project) created
- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))

## Deployment

1. Install the Firebase CLI with `npm` by running the following command:

   ```shell
   npm install -g firebase-tools
   ```

2. Sign in to Firebase using your Google account by running the following command:

   ```shell
   firebase login
   ```

   You can test if the CLI is correctly installed by running `firebase projects:list`, which should show you a list of your Firebase Projects.

3. Navigate into your gatsby project directory and setup firebase:

   ```shell
   firebase init
   ```

   This command will prompt you to:

   - select the Firebase products you wish to set up. Be sure to select **Firebase Hosting**.
   - select the Firebase project you wish to use or create a new one, if you haven't done it previously.

   When prompted to select your public directory, press <kbd>enter</kbd>. It will default to `public`, which is also Gatsby's default public directory.

4. Update the `firebase.json` with the following cache settings

   ```json
   {
     "hosting": {
       "public": "public",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "headers": [
         {
           "source": "**/*",
           "headers": [
             {
               "key": "cache-control",
               "value": "public, max-age=0, must-revalidate"
             }
           ]
         },
         {
           "source": "static/**",
           "headers": [
             {
               "key": "cache-control",
               "value": "public, max-age=31536000, immutable"
             }
           ]
         },
         {
           "source": "**/*.@(css|js)",
           "headers": [
             {
               "key": "cache-control",
               "value": "public, max-age=31536000, immutable"
             }
           ]
         },
         {
           "source": "sw.js",
           "headers": [
             {
               "key": "cache-control",
               "value": "public, max-age=0, must-revalidate"
             }
           ]
         },
         {
           "source": "page-data/**",
           "headers": [
             {
               "key": "cache-control",
               "value": "public, max-age=0, must-revalidate"
             }
           ]
         }
       ]
     }
   }
   ```

5. Prepare your site for deployment by running `gatsby build`. This generates a publishable version of your site in the `public` folder.

6. Deploy your site by running the following command:

   ```shell
   firebase deploy
   ```

All done! Once the deployment concludes, you can access your website using `firebaseProjectId.firebaseapp.com` or `firebaseProjectId.web.app`.

Check the [Firebase Docs](https://firebase.google.com/docs/hosting/full-config) for information about how to customize your deployment further. Remember that each time you wish to redeploy your site, you will need to rerun `gatsby build` first.

<CloudCallout>
  For automatic setup of builds that are deployed straight to Firebase:
</CloudCallout>

## Limitations

Firebase doesn't support advanced features like [SSR](/docs/how-to/rendering-options/using-server-side-rendering/), [DSG](/docs/how-to/rendering-options/using-deferred-static-generation/), or [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn). You can get all features and faster builds by signing up to [Gatsby Cloud](/dashboard/signup).

## Additional resources

- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Get Started with Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart)
- [Connect a custom domain](https://firebase.google.com/docs/hosting/custom-domain)

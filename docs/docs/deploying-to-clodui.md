---
title: Deploying to Clodui
---

[Clodui] is a static hosting service; Clodui automatically optimizes your website files for speed. This guide explains how to deploy your Gatsby website to Clodui.

Clodui supports the following features to improve your website speed and development efforts :

- Serves a website served from a global CDN to reduce network latency.
- Compresses files to Brotli or GZip and serve it based on the browser support.
- Minifies all your HTML, CSS and JavaScript files.
- Generates [WebP](https://developers.google.com/speed/webp) version of all your images. Images then served based on browser support.
- Handles dynamic image resizes based on `Client-Hint` headers or query string parameters.
- Automatic form submission handling with support for webhook integration.
- Deployments are atomic with support for instant rollback.

**Prerequisites :**

- This guide assumes that you have a Gatsby site setup and ready to deploy

## Steps to get started

Follow these steps to deploy your website to Clodui.

1. [Sign up](https://app.clodui.com/auth/signup) to create an account using your email and password.
   _**Note :** Don't use social login like Google or Facebook to sign up because Clodui CLI doesn't support it yet._
2. Install the [Clodui CLI]:
   ```shell
   npm install @clodui/cli -g
   ```
3. Set environment variables `CLODUI_USERNAME`, `CLODUI_PASSWORD` with Clodui username and password respectively.
   In Linux/macOS terminal this can be done by:

   ```shell
   export CLODUI_USERNAME=<Clodui username>
   export CLODUI_PASSWORD=<Clodui password>
   ```

   On Windows command prompt this can be done by:

   ```shell
   SET CLODUI_USERNAME=<Clodui username>
   SET CLODUI_PASSWORD=<Clodui password>
   ```

4. To create your Clodui website from Gatsby output directory `public`; run this command from the root of your Gatsby project:

   ```shell
   clodui website create --source-dir public
   ```

   The command output shows website id, name(which is your website name), deployment status and URL to your website. URL to your website is of the following format `https://<website-name>.clodui.com`. URL is accessible after the deployment completes, i.e. deployment status is `Deployed`.

   If the deployment is in progress, wait for the deployment to finish. To check the latest website status, run the following command.

   ```shell
   clodui website status --website-id <Clodui website id>
   ```

5. After your website created, to deploy new changes from `public` directory, run the following command.

   ```shell
   clodui deploy create --website-id <Clodui website id> --source-dir public --publish
   ```

   `--publish` flag auto-publish the deployment so that changes are visible when you visit your website URL.

## Deploying from GitHub Actions

[GitHub Actions](https://github.com/features/actions) allows you to automate deployment workflows. Use custom
[Clodui Actions](https://github.com/marketplace/actions/clodui-actions) to deploy changes to your Clodui website.

To enable continuous deployment, add this to your GitHub workflow file as a next step after building the Gatsby website.

```yaml
- name: Deploy to Clodui
  uses: clodui/actions-cli@v2.0
  with:
    username: ${{ secrets.CLODUI_USERNAME }}
    password: ${{ secrets.CLODUI_PASSWORD }}
    website-id: ${{ secrets.WEBSITE_ID }}
    source-dir: ./public
    publish: publish
```

Here Clodui credentials and website id are fetched from the GitHub secret store.

## Additional resources

- [Clodui CLI documentation](https://www.clodui.com/docs/clodui-cli/)
- [Clodui Actions marketplace](https://github.com/marketplace/actions/clodui-actions)
- [Clodui CLI npm package](https://www.npmjs.com/package/@clodui/cli)

[clodui]: https://www.clodui.com
[clodui cli]: https://www.npmjs.com/package/@clodui/cli

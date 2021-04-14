---
title: Deploying to Aerobatic
---

[Aerobatic](https://www.aerobatic.com) is a specialized static site host. You can easily deploy your Gatsby site to Aerobatic with the following steps:

1. Install the Aerobatic CLI:

`npm install aerobatic-cli -g`

2. Create a new Aerobatic site at the root of your Gatsby project:

`aero create --name <your-site-name>`

3. Deploy your Gatsby build output:

`aero deploy --directory public`

Your site will be ready on their CDN at `https://<your-site-name>.aerobaticapp.com` in a matter of seconds.

There are some additional HTTP header optimizations you can configure in your `aerobatic.yml` file:

```yaml:title=aerobatic.yml
deploy:
  # Note with below setting it is not necessary to pass --directory to aero deploy command
  directory: public
  # Turn off the Aerobatic asset fingerprinting since Gatsby already does this
  optimizer:
    fingerprintAssets: false

plugins:
  # Force aggressive 1yr max-age header for all .js and .js.map requests
  - name: http-headers
    path: ["/*.js", "/*.js.map"]
    options:
      "Cache-Control": "public, max-age=31536000"
  - name: webpage
```

## Other resources

- Learn more about Gatsby and Aerobatic on [Aerobatic's site](https://www.aerobatic.com/docs/static-site-generators/#react).

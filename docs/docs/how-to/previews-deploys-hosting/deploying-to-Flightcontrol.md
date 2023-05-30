---
title: Deploying to Flightcontrol
---

[Flightcontrol](https://www.flightcontrol.dev/) fully automates Gatsby deployments to your AWS account. It gives users full access to monitor deployments and make changes to configurations.

## Prerequisites

- A Gatsby project set up. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- [A Flightcontrol Account](https://app.flightcontrol.dev/signup?ref=gatsby)
- [A GitHub account](https://github.com/signup)
- [An AWS Account](https://portal.aws.amazon.com/)

## Instructions

Create a `nixpacks.toml` file in your Gatsby Project

Copy and paste the following in the nixpacks.toml file

```
[phases.setup]
  nixPkgs = ['...','python311']

  aptPkgs = ['build-essential']
```

## Deployment Via Dashboard

1. Connect your project using GitHub
2. Select a GUI config type
3. Select your environment
4. Select the Gatsby.js Preset
5. Add a service

Configure the following settings in Build System

#Install Command
npm install

#Start Command
gatsby serve --port 3000 -H 0.0.0.0

6. Add a region
7. Adjust any configuration as needed.
8. Click "Create Project" and complete any required steps (like linking your AWS account).

## Deployment via Flightcontrol.json

Create a flightcontrol.json file in your Gatsby Project

Set configuration for the project in the flightcontrol.json file

Below is an example of a `flightcontrol.json` configuration file for a [Gatsby.js](https://www.gatsbyjs.com/) project.

```json
{
  "$schema": "https://app.flightcontrol.dev/schema.json",
  "environments": [
    {
      "id": "production",
      "name": "Production",
      "region": "us-west-2",
      "source": {
        "branch": "main"
      },
      "services": [
        {
          "id": "my-webapp",
          "name": "Gatsby App",
          "type": "fargate",
          "buildType": "nixpacks",
          "cpu": 0.5,
          "memory": 1.0,
          "minInstances": 1,
          "maxInstances": 1,
          "installCommand": "npm install",
          "buildCommand": "gatsby build",
          "startCommand": "gatsby serve --port 3000 -H 0.0.0.0"
        }
      ]
    }
  ]
}
```

Click "Create Project"

Flightcontrol supports [SSR](/docs/how-to/rendering-options/using-server-side-rendering/) and [Image CDN](/docs/how-to/images-and-media/using-gatsby-plugin-image/#gatsby-cloud-image-cdn)

## Additional resources

- [Setting the Node.js Version for Nixpacks Builds](https://www.flightcontrol.dev/docs/tips/javascript/setting-node-version?ref=docs-gatsby)

- [Flightcontrol Documentation](https://www.flightcontrol.dev/docs?ref=docs-gatsby)

- [Troubleshooting](https://www.flightcontrol.dev/docs/troubleshooting?ref=docs-gatsby)

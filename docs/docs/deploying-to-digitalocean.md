---
title: Deploying to DigitalOcean
---

In this guide you'll learn how to deploy your Gatsby site onto a [DigitalOcean](https://www.digitalocean.com/) droplet.

## What is DigitalOcean?

DigitalOcean is an Infrastructure as a service (IaaS) provider. It provides several easy to deploy services, such as virtual private servers (VPS) which are also known as Droplets, Kubernetes clusters and managed databases.

DigitalOcean Droplets are Linux-based VPS' which can be used as standalone servers, or used as part of a wider cloud based infrastructure. Droplets start at \$5 USD per month and can be created and deployed in under one minute.

## Prerequisites

This tutorial assumes that you have the following:

- Your Gatsby website available on a Git repository.
- A DigitalOcean Droplet running Ubuntu Linux 20.04 LTS. You will also need a non-root user account created which has sudo privileges. DigitalOcean provides excellent tutorials on [Droplet creation](https://www.digitalocean.com/docs/droplets/how-to/create/) and also on [setting up Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04).

- A custom domain in order to utilise LetsEncrypt and provide SSL encryption for your Gatsby website.

## Deployment

### Installing NodeJS, npm and Gatsby CLI

Firstly you should ensure that you have the latest versions of your installed system packages, run the following:

```bash
sudo apt-get update
sudo apt-get upgrade
```

In order to have a more up to date version of NodeJS than what is generally available in the official Ubuntu repositories, you can add a Personal Package Archive (PPA) which is maintained by the NodeJS team. In this tutorial you will be installing Long Term Support (LTS) which is currently v12.x.x. Do the following to add the NodeJS PPA:

```bash
cd ~
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
```

This will then add the PPA to your package manager and make the latest NodeJS LTS version available for installation. You can now install NodeJS by doing the following:

```bash
sudo apt install nodejs
```

Now verify that you have installed the NodeJS package and that it is the correct version:

```bash
node -v

v12.17.0
```

To upgrade npm (NodeJS's package manager) to the latest version run the following:

```bash
npm install -g npm@latest
```

Sometimes some npm packages require compiling from source, so you will need to install the build-essential package:

```bash
sudo apt-get install build-essential
```

The next step is to now install the Gatsby CLI package:

```bash
npm install -g gatsby-cli
```

And check now check that the Gatsby CLI packaged installed correctly:

```bash
gatsby -v


╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   Gatsby collects anonymous usage analytics                            ║
║   to help improve Gatsby for all users.                                ║
║                                                                        ║
║   If you'd like to opt-out, you can use `gatsby telemetry --disable`   ║
║   To learn more, checkout https://gatsby.dev/telemetry                 ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
Gatsby CLI version: 2.12.40
```

### Installing Nginx and configuring LetsEncrypt
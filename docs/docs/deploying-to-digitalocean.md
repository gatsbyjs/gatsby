---
title: Deploying to DigitalOcean
---

In this guide you'll learn how to deploy your Gatsby site onto a [DigitalOcean](https://www.digitalocean.com/) droplet.

## What is DigitalOcean?

DigitalOcean is an Infrastructure as a service (IaaS) provider who provide several easy to deploy services, such as virtual private servers (VPS) which are also known as Droplets, Kubernetes clusters and managed databases.

DigitalOcean Droplets are Linux-based VPS' which can be used as standalone servers, or used as part of a wider cloud based infrastructure. Droplets start at \$5 USD per month and you can create and deploy these in less than a minute.

## Prerequisites

This tutorial assumes that you have the following:

- Your Gatsby website available on a Git repository.

- A DigitalOcean Droplet running Ubuntu Linux 20.04 LTS. You will also need a non-root user account created which has sudo privileges. DigitalOcean provides excellent tutorials on [Droplet creation](https://www.digitalocean.com/docs/droplets/how-to/create/) and also on [setting up Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04).

- A custom domain to utilise LetsEncrypt and provide SSL encryption for your Gatsby website.

## Deployment

### Installing NodeJS and Gatsby CLI

#### Installing NodeJS

Before starting you should ensure that you have the latest versions of your installed system packages, run the following:

```shell
sudo apt update
sudo apt upgrade
```

To have a more up to date version of NodeJS than what is generally available in the official Ubuntu repositories, you can add a Personal Package Archive (PPA) which the NodeJS team maintain. In this tutorial you will be installing Long Term Support (LTS) which is currently v12.x.x. Do the following to add the NodeJS PPA:

```shell
cd ~
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
```

This will then add the PPA to your package manager and make the latest NodeJS LTS version available for installation. You can now install NodeJS by doing the following:

```shell
sudo apt install nodejs
```

Now verify that you have installed the NodeJS package and that it is the correct version:

```shell
node -v

v12.17.0
```

To upgrade npm (NodeJS's package manager) to the latest version run the following:

```shell
npm install -g npm@latest
```

Sometimes some npm packages need compiling from source, so you will need to install the build-essential package:

```shell
sudo apt install build-essential
```

#### Installing Gatsby CLI

The next step is to now install the Gatsby CLI package:

```shell
npm install -g gatsby-cli
```

And check now check that the Gatsby CLI packaged installed correctly:

```shell
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

#### Cloning and Building Your Gatsby Site

To build your Gatsby site and make it ready for deploying you need to clone your Gatsby site repository to your Droplet. Run the following, where `<your-github-url>` is your Gatsby site's Git repository:

```shell
git clone <your-github-url>
```

> The directory where you cloned your Gatsby site will be referred to as `<your-gatsby-site>`.

You can now enter your Gatsby site directory and install the sites' dependencies. Do the following:
```bash
cd <your-gatsby-site>
npm install
```

You can now then build your Gatsby site:
```bash
gatsby build
```

### Installing Nginx and configuring LetsEncrypt

### Installing Nginx

In order to serve your Gatsby website you need a webserver. One of the most widely used web servers for serving static content is [Nginx](https://www.nginx.com/).

Install Nginx:

```shell
apt install nginx
```

If you have set up [UFW](https://help.ubuntu.com/community/UFW) then you will need to allow access to both HTTP and HTTPS from the outside world. Do the following:

```shell
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
```

You should now be able to access your server by visiting `http://<your-server-ip>/` using your browser, you should see a Nginx placeholder page if everything is working correctly.

Now you need to let Nginx know where your Gatsby site files are, edit the Nginx default site configuration file with the following:

```shell
sudo nano /etc/nginx/sites-available/default
```

And then make the following changes:

```shell:title=/etc/nginx/sites-available/default
[...]
        root <your-gatsby-site>/public; // highlight-line
        #e.g root /home/gatsby_user/gatsby_site/public

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name <your-custom-domain>; // highlight-line
        #e.g server_name example.com
[...]
```
      

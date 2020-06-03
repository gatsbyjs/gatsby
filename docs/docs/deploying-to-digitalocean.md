---
title: Deploying to DigitalOcean
---

In this guide you'll learn how to deploy your Gatsby site onto a [DigitalOcean](https://www.digitalocean.com/) droplet.

## What is DigitalOcean?

DigitalOcean is an Infrastructure as a service (IaaS) provider who provide several easy to deploy services, such as virtual private servers which are also known as Droplets, Kubernetes clusters and managed databases.

DigitalOcean Droplets are Linux-based VPS' which can be used as standalone servers, or used as part of a wider cloud based infrastructure. Droplets start at \$5 USD per month and you can create and deploy these in less than a minute.

## Prerequisites

This tutorial assumes that you have the following:

- Your Gatsby website available on a Git repository.

- A DigitalOcean Droplet running Ubuntu Linux 20.04 LTS. You will also need a non-root user account created which has sudo privileges. DigitalOcean provides excellent tutorials on [Droplet creation](https://www.digitalocean.com/docs/droplets/how-to/create/) and also on [setting up Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-20-04).

- A custom domain to utilise LetsEncrypt and provide HTTPS encryption for your Gatsby website.

## Deployment

### Installing NodeJS and Gatsby CLI

#### Installing NodeJS

Before starting, you should ensure that you have the latest versions of your installed system packages. Run the following:

```shell
sudo apt update
sudo apt upgrade
```

To have a more up to date version of NodeJS than what is generally available in the official Ubuntu repositories, you can add a Personal Package Archive (PPA) which the NodeJS team maintain.

In this tutorial you will be installing the Long Term Support (LTS) version which is currently v12.x.x. Do the following to add the NodeJS PPA:

```shell
cd ~
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
```

This will then add the PPA to your package manager and make the latest NodeJS LTS version available for installation. You can now install NodeJS:

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
sudo npm install -g npm@latest
```

Sometimes some npm packages need compiling from source, so you will need to install the build-essential package:

```shell
sudo apt install build-essential
```

#### Installing Gatsby CLI

The next step is to now install the Gatsby CLI package:

```shell
sudo npm install -g gatsby-cli
```

And now you can check that the Gatsby CLI package was installed correctly:

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

To build your Gatsby site and make it ready for deploying you need to clone your Gatsby site repository to your Droplet. Run the following, where `<your-git-url>` is your Gatsby site's Git repository:

```shell
git clone <your-git-url>
```

> The directory where you cloned your Gatsby site will be referred to as `<your-gatsby-site>`.

You can now enter your Gatsby site directory and install the sites' dependencies. Do the following:

```shell
cd <your-gatsby-site>
npm install
```

You can now then build your Gatsby site:

```shell
gatsby build
```

### Installing Nginx and Configuring LetsEncrypt

#### Installing Nginx

In order to serve your Gatsby website you need a webserver. One of the most widely used web servers for serving static content is [Nginx](https://www.nginx.com/). Nginx is a lightweight high performance web server, perfectly suited for serving static sites such as Gatsby.

Install Nginx:

```shell
sudo apt install nginx
```

If you have set up [UFW](https://help.ubuntu.com/community/UFW) then you will need to allow access to both HTTP and HTTPS from the outside world. Do the following:

```shell
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx HTTPS'
```

You should now be able to access your server by visiting `http://<your-server-ip>/` using your browser, you should see a Nginx placeholder page if everything is working correctly.

Now you need to let Nginx know where your Gatsby site files are. Nginx is capable of hosting more than one site at a time, this is done by creating '[server blocks](https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/)' for each site you wish to host with each server block containing its own configuration.

Although you're only setting up one site at the moment configuring things this way will make it easier to add sites at a later date if you wish.

In order to create a server for your custom domain, copy the default provided by Nginx:

```shell
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/<your-custom-domain>
```

Now you can edit the server block:

```shell
sudo nano /etc/nginx/sites-available/<your-custom-domain>
```

First you need to look at the listen directives. You can have **only one server block with the default_server option enabled**. This option specifies which site to serve if the requested site does not match any of the server blocks.

For this example you can leave it as the default site, so you should remove this option from your newly created server block:

```shell:title=/etc/nginx/sites-available/<your-custom-domain>
[...]
        listen 80 default_server; // highlight-line
        listen [::]:80 default_server; // highlight-line
[...]
```

Your listen directives should now look like this:

```shell:title=/etc/nginx/sites-available/<your-custom-domain>
[...]
        listen 80; // highlight-line
        listen [::]:80; // highlight-line
[...]
```

And then update the site `root` with the directory where your Gatsby site is, and `server_name` to your domain name:

```shell:title=/etc/nginx/sites-available/<your-custom-domain>
[...]
        #e.g root /home/gatsby_user/gatsby_site/public
        root <your-gatsby-site>/public; // highlight-line

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        #e.g server_name www.example.com example.com
        server_name www.<your-custom-domain> <your-custom-domain>; // highlight-line
[...]
```

Now enable the site by creating a symlink in the `sites-enabled` directory:

```shell
sudo ln -s /etc/nginx/sites-available/<your-custom-domain> /etc/nginx/sites-enabled/<your-custom-domain>
```

Now you can reload the Nginx configuration files:

```shell
sudo systemctl reload nginx
```

Now visit `http://<your-custom-domain>` and your Gatsby site should be live!

#### Configuring LetsEncrypt

Although you can now access your site over HTTP, you should always secure your websites using HTTPS, even if they don't handle sensitive communications. HTTPS is also a requirement for many new browser features such as progressive web apps (PWAs) or service workers.

With services like [LetsEncrypt](https://letsencrypt.org/), HTTPS can now be quickly be added to your website. LetsEncrypt is a free, automated and open certification authority (CA) service provided by the [Internet Security Research Group](https://www.abetterinternet.org/).

LetsEncrypt recommend using [Certbot](https://certbot.eff.org/) to manage your HTTPS certificates. You should now install Certbot:

```shell
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Once installed, run Certbot:

```shell
sudo certbot --nginx
```

When prompted for what domains you would like to enable HTTPS for, you can leave the prompt blank to select all domains and continue by pressing enter.

When prompted for whether you want to redirect all HTTP traffic to HTTPS, you should select redirect all HTTP traffic to HTTPS.

Certbot will then automatically update your Nginx server blocks, request a certificate from LetsEncrypt and place this in the correct location and finally it will setup automatically renewing your certificate every 60 days.

Your site will now be available to access on `https://<your-custom-domain>`.

### Keeping Your Site Up To Date

You can manually keep your site afterup to date, after changes are made to the site's Git repo, by SSH'ing into your DigitalOcean Droplet, entering the directory of your Gatsby site and then running:

```shell
git pull
gatsby build
```

This pulls your updated Gatsby site from your Git repository, and then builds the latest version of your Gatsby site.

---
title: Deploying to DigitalOcean Droplet
---

This guide walks through how to deploy and host your next Gatsby site on [DigitalOcean Droplet](https://www.digitalocean.com/products/droplets/).

DigitalOcean provides the easiest cloud platform to deploy, manage, and scale applications of any size, removing infrastructure friction and providing predictability so developers and their teams can spend more time building better software.

DigitalOcean's famous product droplets are scalable compute IaaS(Infrastructure as a Service) or a VPS on the cloud which has great reliability and scalability and they come along with varied price range ideal for small apps to giant enterprise-level apps that harness the profit for your business.

They provide service to select from the 6 Unix based distributions and select your technology-based platform with preinstalled pre-requisites from the marketplace.

A Droplet could be spin up in just 55 seconds with as low as \$5/month!

## Pre-requisites

1. Your Gatsby site living in a Git repository (Github/Gitlab or any git cloud).
2. [DigitalOcean Droplet](https://www.digitalocean.com/products/droplets/) with a non-root user configured with sudo group.
3. A custom domain name for your Gatsby site which will help configure SSL for HTTPS.

## Steps to deploy your Gatsby site to DigitalOcean Droplet

### Install NodeJS, NPM and Gatsby-CLI onto your droplet

1. Login to your droplet as a non-root user.

2. Install NodeJS

   ```bash
   sudo apt-get update
   sudo apt-get install nodejs
   ```

3. Install npm

   ```bash
   sudo apt-get install npm
   ```

   To view the version of node and npm installed, run,

   ```bash
   node -v
   npm -v
   ```

4. To install the latest stable release (Optional) (Recommended),

   ```bash
   sudo npm install -g n
   sudo n stable
   ```

   `Note`: If you check the version now, you would see the older versions of node and npm from the cache.
   You can either exit and restart your terminal or refresh the cache by following commands,

   ```bash
   hash node
   hash npm
   ```

5. Install the gatsby-cli now globally. This will be useful ahead in building the gatsby site for production.

   ```bash
   sudo npm install -g gatsby-cli
   ```

### Clone your repository to the droplet

1. Next step is to clone your repository containing your gatsby app(Replace `<your-github-repo-site>` with your Github repository link)

   ```bash
   git clone <your-github-repo-site>
   ```

   Referring the directory cloned as `<my-gatsby-app>` throughout this post for simplicity.

### Build your gatsby site to generate a static site for production

1. The static files will be hosted publically on the droplet. `gatsby build` provides utility to build the site and generate the static files in the `/public`.

   ```bash
   cd my-gatsby-app
   sudo gatsby build
   ```

### Install Nginx Web Server to host the static site and open firewall to accept HTTP and HTTPS requests

To host a website or static files onto a Linux-based server/VPS, a web-server is required like Apache, Nginx.

Nginx is web-server, it provides the infrastructure code for handling client requests from the World Wide Web, along with features like a load balancer, mail proxy and HTTP Cache.

1. Install Nginx

   ```bash
   sudo apt-get install nginx
   ```

2. Configure firewall settings of the droplet to listen to HTTP and HTTPS requests on port 80 and 443 respectively.

   ```bash
   sudo ufw allow 'Nginx HTTP'
   sudo ufw allow 'Nginx HTTPS'
   ```

3. To check the access,

   ```bash
   sudo ufw app list
   ```

4. In case, if ufw status is disabled/inactive, you can enable it using,

   ```bash
   sudo ufw enable
   ```

   `Note`: Allow the OpenSSH if not already done, to not disconnect from your droplet.

   ```bash
   sudo ufw allow 'OpenSSH'
   ```

### Configuring Ngnix to point to your gatsby site's `/public` directory and add your domain

Change the root directory configuration of Nginx in the default server block file

1. Go to /etc/nginx/sites-available/

   ```bash
   cd /etc/nginx/sites-available/
   ```

2. Open the file default

   ```bash
   sudo vim default
   ```

3. Edit the file and make the following changes for below-mentioned fields, leave the rest of the fields as it is.

   ```bash
   server {
     root <path to my-gatsby-app>/public;

     index index.html index.htm index.nginx-debian.html;

     server_name <your-domain-name>;

     location / {
       try_files $uri $uri/ =404;
     }
   }
   ```

4. Restart the ngnix service,

   ```bash
   sudo systemctl restart nginx
   ```

5. Configure your domain to point to the IP address of your droplet. Go to the Advanced DNS settings in your domain provider's console and put an A record that points to the IP address of the droplet.

6. By this time, you can view your site live at `<your-domain>`.

### Configuring SSL for your Gatsby Site.

Follow the below steps to configure your site with a free SSL certificate from Lets Encrypt using their Certbot cli tool.

However, it's advised to use a premium SSL certificate from any SSL Certificate provider.

1. Install Certbot onto your droplet.

   You'll need to add the Certbot PPA to your list of repositories. To do so, run the following commands,

   ```bash
   sudo apt-get update
   sudo add-apt-repository ppa:certbot/certbot
   sudo apt-get update
   ```

   Run the following commands to install certbot.

   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Generate the certificate. Certbot will automatically edit and configure the ngnix config file for the SSL and point to the certificate file.

   Run the following command,

   ```
   sudo certbot --nginx
   ```

3. If you are using Certbot for the first time on this droplet then you will be prompted to enter your e-mail for recovery purpose.

4. Agree to the license agreement on prompt.

   `Note`: You will be prompted to select the domain for which you want to generate the certificate. Select the domain configured in [this](#configuring-ngnix-to-point-to-your-gatsby-site's-`public`-directory-and-add-your-domain) step.

   `Note`: You will be prompted to choose the option to redirect HTTP requests to HTTPS, you may choose on your needs.
   (Suggested, to choose to redirect HTTP to HTTPS)

5. Restart the nginx service.

   ```bash
   sudo systemctl restart nginx
   ```

6. Now, you can access your site at `<your-domain>` with a secure connection.

### View your Gatsby site live

Once you've followed along with all the steps and configuration properly, you can visit your site live at `<your-domain>`.

Whenever there's an update to your site, run a `sudo gatsby build` in the root of your `<my-gatsby-app>` and your changes will be live.

Congratulations! You've deployed your Gatsby App on DigitalOcean droplet along with configuring SSL for it.

## Addtional resources

There's a lot to learn more about DigitalOcean's Droplet, Ubuntu configurations and Nginx. Below are some useful links which will be useful in achieving the pre-requisites of this post:

- [Microblog - Create a new non-root user with sudo privileges on Ubuntu-based DigitalOcean Droplet configured with SSH](https://dev.to/mistryvatsal/microblog-create-a-new-non-root-user-with-sudo-privileges-on-ubuntu-based-digitalocean-droplet-configured-with-ssh-1l3)
- [Official DigitalOcean Docs](https://www.digitalocean.com/docs/)
- [Official Nginx Docs](http://nginx.org/en/docs/)
- [Configuring HTTPS Servers with Nginx](http://nginx.org/en/docs/http/configuring_https_servers.html)
- [How To Install Nginx on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04)
- [How To Secure Nginx with Let's Encrypt on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04)

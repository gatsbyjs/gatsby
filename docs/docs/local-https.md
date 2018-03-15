---
title: "Local HTTPS"
---

Gatsby provides an easy way to use a local HTTPS server during development, thanks to [devcert](https://github.com/davewasmer/devcert). When you enable the `https` option, a private key and certificate file will be created for your project and used by the development server.

## Usage

Start the development server using `gatsby develop` as usual, and add either the `-S` or `--https` flag.

    $ gatsby develop --https

## Setup

When setting up a development SSL certificate for the first time, you may be asked to type in your password after starting the development environment:

    info setting up SSL certificate (may require sudo)

    Password:

This is *only* required the first time you are using Gatsby's HTTPS feature on your machine. After that, certificates will be created on the fly.

After typing in your password, `devcert` will attempt to install some software necessary to tell Firefox (and Chrome, only on Linux) to trust your development certificates.

    Unable to automatically install SSL certificate - please follow the
    prompts at http://localhost:52175 in Firefox to trust the root certificate
    See https://github.com/davewasmer/devcert#how-it-works for more details
    -- Press <Enter> once you finish the Firefox prompts --

If you wish to support Firefox (or Chrome on Linux), visit [localhost:52175](http://localhost:52175) in Firefox and follow the point-and-click wizard. Otherwise, you may press enter without following the prompts. **Reminder: you'll only need to do this once per machine.**

Now open the development server at [https://localhost:8000](https://localhost:8000) and enjoy the HTTPS goodness ✨. Of course, you may change the port according to your setup.

Find out more about [how devcert works](https://github.com/davewasmer/devcert#how-it-works).

****

Keep in mind that the certificates are explicitly issued to `localhost` and will only be accepted there. Using it together with the `--host` option will likely result in browser warnings.

---
title: Local HTTPS
---

Gatsby provides an easy way to use a local HTTPS server during development, thanks to [devcert](https://github.com/davewasmer/devcert). When you enable the `https` option, a private key and certificate file will be created for your project and used by the development server.

## Usage (Automatic HTTPS)

Start the development server using `npm run develop` as usual, and add either the `-S` or `--https` flag.

    $ npm run develop -- --https

## Setup

When setting up a development SSL certificate for the first time, you may be asked to type in your password after starting the development environment:

    info setting up SSL certificate (may require sudo)

    Password:

This is _only_ required the first time you are using Gatsby's HTTPS feature on your machine. After that, certificates will be created on the fly.

After typing in your password, `devcert` will attempt to install some software necessary to tell Firefox (and Chrome, only on Linux) to trust your development certificates.

    Unable to automatically install SSL certificate - please follow the
    prompts at http://localhost:52175 in Firefox to trust the root certificate
    See https://github.com/davewasmer/devcert#how-it-works for more details
    -- Press <Enter> once you finish the Firefox prompts --

If you wish to support Firefox (or Chrome on Linux), visit `http://localhost:52175` in Firefox and follow the point-and-click wizard. Otherwise, you may press enter without following the prompts. **Reminder: you'll only need to do this once per machine.**

Now open the development server at `https://localhost:8000` and enjoy the HTTPS goodness ✨. Of course, you may change the port according to your setup.

Find out more about [how devcert works](https://github.com/davewasmer/devcert#how-it-works).

## Custom Key and Certificate Files

You may find that you need a custom key and certificate file for https if you use multiple
machines for development (or if your dev environment is containerized in Docker).

If you need to use a custom https setup, you can pass the `--https`, `--key-file` and
`--cert-file` flags to `npm run develop`.

- `--cert-file` [relative path to ssl certificate file]
- `--key-file` [relative path to ssl key file]

See the example command:

```shell
gatsby develop --https --key-file ../relative/path/to/key.key --cert-file ../relative/path/to/cert.crt
```

in most cases, the `--https` passed by itself is easier and more convenient to get local https.

---

Keep in mind that the automatic certificates issued with the `--https` flag are explicitly issued to `localhost` and will only be accepted there. Using it together with the `--host` option will likely result in browser warnings.

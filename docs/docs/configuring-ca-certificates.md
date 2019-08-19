---
title: Configuring CA Certificates
---

For developers using a private (or corporate) package registry that requires a certificate from a certificate authority (CA), you may need to set your certificate in your npm, yarn, or node config.

## Common errors from misconfigured certificates

This might be a problem if you are seeing errors like `unable to get local issuer certificate` in the console output while trying to install Gatsby plugins, particularly with plugins or themes that need to be built as native Node.js modules (eg. `gatsby-plugin-sharp`). It may happen after running `npm install` or `yarn install` in a fresh clone of a repository when trying to pull packages from a place besides a public registry and the certifcate has not been set in your config.

## cafile config option

Both [npm](https://docs.npmjs.com/misc/config#cafile) and [yarn](https://yarnpkg.com/lang/en/docs/cli/config/), support a `cafile` config option. You'll have to add `cafile` as the key, and set the path to your certificate as the value.

### Using npm to set cafile

```shell
npm config set cafile "path-to-my-cert.pem"
```

To check the value of the certificate path at the `cafile` key, use the following command to list all keys in your npm config:

```shell
npm config ls -l
```

### Using yarn to set cafile

```shell
yarn config set cafile "path-to-my-cert.pem"
```

You can then check what the values in the yarn config with the following command:

```shell
yarn config list
```

### Using Node.js

Alternately, if you aren't using npm or yarn, you can configure the option for your installation of Node.js on your machine. Export the path to your certificate with the `NODE_EXTRA_CA_CERTS` variable:

```shell
export NODE_EXTRA_CA_CERTS=["path-to-my-cert.pem"]
```

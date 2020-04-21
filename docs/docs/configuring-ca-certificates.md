---
title: Configuring CA Certificates
---

If you're using a private (typically a corporate) package registry that requires a certificate from a CA (certificate authority), you may need to setup the certificate in your `npm`, `yarn`, and `node` config.

## Common errors from misconfigured certificates

If you're seeing errors like `unable to get local issuer certificate` in the console output while trying to install a Gatsby plugin, a misconfigured certificate might be the problem. This occurs particularly with plugins or themes that need to be built as native Node.js modules (e.g. `gatsby-plugin-sharp`). It may happen when installing packages from a private registry (via `npm install` or `yarn install`) without an appropriately setup certificate in config.

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

You can now check values in your yarn config with the following command:

```shell
yarn config list
```

### Using Node.js

Alternatively, you can also configure this for Node.js on your machine. Export the path to your certificate with the `NODE_EXTRA_CA_CERTS` variable:

```shell
export NODE_EXTRA_CA_CERTS=["path-to-my-cert.pem"]
```

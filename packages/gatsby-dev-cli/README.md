# gatsby-dev-cli

A dev cli tool for Gatsby.

It's a simple cli tool for have easily a functionnal development environment for working on Gatsby.

## Install

Fork gatsby repo and clone it.

```bash
$ npm install -g gatsby-dev-cli@canary
$ gatsby-dev --set-path-to-repo /path/to/my/cloned/version/gatsby
```


## How to use

Go to your project and execute corresponding following command to use local version of gatsby.

Note: First time can be very long, be patient ;)

### Repo with gatsby dependencies

```bash
$ gatsby-dev
```

Tools automaticly find gatsby packages into current `package.json`, copy it from your local fork and watch!

### Repo without gatby dependencies

```bash
$ gatsby-dev --packages gatsby gatsby-typegen-remark
```

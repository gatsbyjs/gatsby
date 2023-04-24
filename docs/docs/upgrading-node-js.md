---
title: Upgrading Your Node.js Version
---

## Gatsby's Node.js support policy

Gatsby aims to support any version of Node that has a release status of _Current_, _Active_, or _Maintenance_. Once a major version of Node reaches _End of Life_ status Gatsby will stop supporting that version.

Gatsby will stop supporting the _End of Life_ Node release in a minor version.

Check [Node's releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

## What version of Node.js do I have?

Run `node -v` in a terminal to see which version of Node.js you have.

```shell
node -v
v18.9.0
```

This example shows Node.js version 18, specifically v18.9.0.

## Upgrading Node.js

Generally, it's recommended to use [the Node version whose status is _Active LTS_](https://github.com/nodejs/Release#nodejs-release-working-group).

> What about Node.js 15 and other odd release versions? Stable versions of Node.js are evenly numbered releases - Node 14, Node 16, Node 18 etc. Only use uneven release numbers if you'd like to try cutting-edge and experimental features.

There are multiple ways to update your version of Node.js depending on how you originally installed it. Read on to find the best approach for you.

### Using Homebrew

You will have Homebrew installed on your computer if you [followed part zero of the Gatsby tutorial](/docs/tutorial/getting-started/part-0/#install-nodejs-for-your-appropriate-operating-system). Homebrew is a program that allows you to install specific versions of Node.js (and other software).

To update from Node.js 16 to Node.js 18 using Homebrew, open a terminal and run the following commands:

```shell
brew search node
```

You should see output similar to this:

```shell
brew search node
==> Formulae
heroku/brew/heroku-node ✔        llnode                           node@18                          nodebrew
leafnode                         node ✔                           node@14                          nodeenv
libbitcoin-node                  node-build                       node_exporter                    nodenv
```

You're interested in the next stable version of Node.js after Node.js 16, which is Node.js 18. Homebrew makes this available in a package called `node@18`. Run:

```shell
brew install node@18
```

Once that's complete, run:

```shell
node -v
```

to confirm that you've upgraded from Node.js version 16 up to version 18.

### Using a Node.js version management package

There are two popular packages used for managing multiple versions of Node.js on your system. Use one of these to update to a newer version of Node.js if they're already available on your computer.

These packages are very useful for people that regularly work with different versions of Node.js.

#### nvm

Run

```shell
nvm
```

in a terminal to see if nvm is installed on your system. If it's installed, you can run:

```shell
nvm install 18
nvm alias default 18
```

to install and use Node.js version 18.

[Check nvm's documentation for further instructions](https://github.com/nvm-sh/nvm).

#### n

Run:

```shell
n
```

in a terminal to see if n is installed on your system. If it's installed, you can run `n 18` to install and use Node.js version 18.

[Check n's documentation for further instructions](https://github.com/tj/n).

### Installing from nodejs.org

If you aren't using any of the previously listed installation methods, you can [download a Node.js installer directly from nodejs.org](https://nodejs.org/en/).

## Conclusion

Gatsby takes backwards compatibility seriously and aims to support older versions of Node.js for as long as possible. We understand that juggling different software versions is not a productive way to spend your day.

Gatsby also relies on a huge ecosystem of JavaScript dependencies. As the ecosystem moves away from older, unsupported Node.js versions we have to keep pace to ensure that bugs can be fixed and new features can be released.

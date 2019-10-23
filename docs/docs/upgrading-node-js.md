---
title: Upgrading Your Node.js Version
---

## Gatsby's Node.js support policy

Gatsby aims to support any version of Node that has a release status of _Current_, _Active_, or _Maintenance_. Once a major version of Node reaches _End of Life_ status Gatsby will stop supporting that version.

Gatsby will stop supporting the _End of Life_ Node release in a minor version.

Check [Node's releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

## What version of Node.js do I have?

Run `node -v` in a terminal to see which version of Node.js you have.

```
node -v
v10.16.0
```

This example shows Node.js version 10, specifically v10.16.0.

## Upgrading from Node.js version 6

Node.js version 6 reached _End-of-life_ status on 30th April 2019. Many of Gatsby's dependencies are updating to Node.js version 8 and above. Gatsby must also update in order to deliver new features and bug fixes more quickly.

Generally it's recommend to use [the Node version whose status is _Active LTS_](https://github.com/nodejs/Release#nodejs-release-working-group) (Node 10 at time of writing). However, in this document you'll learn how to update from Node 6 to Node 8 as this is likely to be the least disruptive upgrade for you.

> What about Node.js 7? Stable versions of Node.js are evenly numbered releases - Node.js 6, Node.js 8, Node.js 10 etc. Only use uneven release numbers if you'd like to try cutting-edge and experimental features.

There are multiple ways to update your version of Node.js depending on how you originally installed it. Read on to find the best approach for you.

### Using Homebrew

This is the recommended way to install a newer version of Node.

You will have homebrew installed on your computer if you [followed part zero of the Gatsby tutorial](https://www.gatsbyjs.org/tutorial/part-zero/#-install-nodejs-and-npm). Homebrew is a program that allows you to install specific versions of Node.js (and other software).

To update from Node.js 6 to Node.js 8 using Homebrew, open a terminal and run the following commands:

```
brew search node
```

You should see output similar to this:

```
brew search node
==> Formulae
heroku/brew/heroku-node ✔        llnode                           node@10                          nodebrew
leafnode                         node ✔                           node@8                           nodeenv
libbitcoin-node                  node-build                       node_exporter                    nodenv
```

You're interested in the next stable version of Node.js after Node.js 6, which is Node.js 8. Homebrew makes this available in a package called `node@8`. Run:

```
brew install node@8
```

Once that's complete, run:

```
node -v
```

to confirm that you've upgraded from Node.js version 6 up to version 8.

### Using a Node.js version management package

There are two popular packages used for managing multiple versions of Node.js on your system. Use one of these to update to a newer version of Node.js if they're already available on your computer.

These packages are very useful for people that regularly work with different versions of Node.js.

#### nvm

Run

```
nvm
```

in a terminal to see if nvm is installed on your system. If it's installed, you can run:

```
nvm install 8
nvm alias default 8
```

to install and use Node.js version 8.

[Check nvm's documentation for further instructions](https://github.com/nvm-sh/nvm).

#### n

Run:

```
n
```

in a terminal to see if n is installed on your system. If it's installed, you can run `n 8` to install and use Node.js version 8.

[Check n's documentation for further instructions](https://github.com/tj/n).

### Installing from nodejs.org

If you aren't using any of the previously listed installation methods, you can [download a Node.js installer directly from nodejs.org](https://nodejs.org/en/).

Gatsby's recommended way to install Node.js is by using Homebrew. Refer to the previous [Homebrew section of this document](#using-homebrew) for more info.

## Conclusion

Gatsby takes backwards compatibility seriously and aims to support older versions of Node.js for as long as possible. We understand that juggling different software versions is not a productive way to spend your day.

Gatsby also relies on a huge ecosystem of JavaScript dependencies. As the ecosystem moves away from older, unsupported Node.js versions we have to keep pace to ensure that bugs can be fixed and new features can be released.

In this document you learned how you upgrade from Node.js version 6 (which has reached _End of Life_ status), to Node.js version 8 (which has reached _Maintenance_) status.

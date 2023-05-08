---
title: Node.js
disableTableOfContents: true
---

Learn more about Node.js, one of the software packages that makes Gatsby possible.

## What is Node.js?

Node.js is a JavaScript runtime that uses the same engine as Google Chrome. With Node.js, you can run JavaScript applications on your computer, without the need for a web browser.

In the early 2000s, services such as Gmail and Flickr showed us that JavaScript could be used to build robust applications, available to anyone with a web browser and internet connection.

However, those JavaScript applications had a big limitation: they could only perform as well as the runtime allowed. Before 2009, the runtime was almost always a web browser. So Google formed the Chromium Project, in part, to create a faster browser. The result was Google Chrome, released in 2008, and its new JavaScript engine: [V8](https://v8.dev/).

A year later, Node.js made its debut as a standalone JavaScript runtime using the V8 engine.

Once you've installed Node.js, you can use it to run JavaScript from the [command line](/docs/glossary#command-line). Type `node` at a prompt to launch the Node.js interactive shell. Include the path to a JavaScript file to execute that script: e.g. `node /Users/gatsbyfan/hello-world.js`.

You will need to [install Node.js](/docs/tutorial/getting-started/part-0/#install-nodejs-for-your-appropriate-operating-system) before using Gatsby. Gatsby is built using JavaScript, and requires the Node.js runtime.

Installing Node.js also installs [npm](/docs/glossary#npm), the Node.js _package manager_. A package manager is specialized software that lets you install and update modules and packages used in your project.

You'll use npm to install Gatsby and its dependencies. Type `npm install -g gatsby-cli` at a command line prompt to install the Gatsby command line interface or CLI. The `-g` flag installs Gatsby globally, which means that you can use it by typing `gatsby` at a prompt. For example, you can use `gatsby new` to create a new Gatsby site.

## Learn more about Node.js

- [Node.js](https://nodejs.org/en/) official website

- [Introduction to Node.js](https://nodejs.dev)

- [NodeSchool](https://nodeschool.io/) offers online and in-person Node.js workshops

- [V8](https://v8.dev/) developer blog website

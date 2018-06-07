---
title: Set Up Your Development Environment
typora-copy-images-to: ./
---

Before you start to code, you need familiarity with some core web technologies and make sure that you have successfully installed all the tools you’ll need. If you are brand-new to any of this, we provide links to optional reading and resources in case you want to dig in deeper.

## Core Technologies

You don’t need to be familiar with these already — if you’re not, don’t worry! You’ll pick up a lot through the course of this tutorial series; These are some of the main web technologies you’ll use when building a Gatsby website.

- **HTML**: A markup language that every web browser is able to understand. It stands for HyperText Markup Language. HTML gives your web content a universal informational structure, defining things like headings, paragraphs, and more.
- **CSS**: A presentational language used to style the appearance of your web content (fonts, colors, layout etc).
- **JavaScript**: A programming language that helps us make the web dynamic and interactive. It is not necessary to make a functional website, but the vast majority of websites include JavaScript.
- **React**: A code library (built with JavaScript) for building user interfaces. It’s the framework that Gatsby uses to build pages and structure content.
- **GraphQL**: A query language; A programming language that allows you to pull data into your website. It’s the interface that Gatsby uses for managing site data.

> 💡 (*Optional!*) For a comprehensive introduction to what a website is, HTML, and CSS, check out “[Building your first web page](https://learn.shayhowe.com/html-css/building-your-first-web-page/)”. It’s a great place to start learning about the web, from scratch. For a more hands-on introduction to [HTML](https://www.codecademy.com/learn/introduction-to-javascript), [CSS](https://www.codecademy.com/learn/learn-css) and [JavaScript](https://www.codecademy.com/learn/learn-html), check out the tutorials from Codecademy. [React](https://reactjs.org/tutorial/tutorial.html) and [GraphQL](http://graphql.org/graphql-js/) also have their own introductory tutorials.

## Command Line

The command line is a text-based interface used to run commands on your computer. (You’ll also often see it referred to as the terminal. In this tutorial we’ll use both interchangeably). It’s a lot like using the Finder on a Mac, or Windows Explorer. Finder and Explorer are examples of graphical user interfaces (GUI). The command line is powerful, text-based way to interact with your computer.

Take a moment to locate and open up the command line interface (CLI) for your computer. (Depending on which operating system you are using, see [instructions for Mac](http://www.macworld.co.uk/feature/mac-software/how-use-terminal-on-mac-3608274/), or [instructions for Windows](https://www.quora.com/How-do-I-open-terminal-in-windows)).

> 💡 For a great introduction to using the command line, check out [Codecademy’s Command Line tutorial](https://www.codecademy.com/courses/learn-the-command-line/lessons/navigation/exercises/your-first-command) for Mac and Linux users, and [this tutorial](https://www.computerhope.com/issues/chusedos.htm) for Windows users. (Even if you are a Windows user, the first page of the Codecademy tutorial is a valuable read, as it explains *what* the command line is, not just how to interface with it.)

## Node.js

Node.js is an environment that can run JavaScript code. JavaScript was initially only used in client-side web development (run by the JavaScript engine in the user’s browser), but software like Node.js allows us to use it on the server-side as well.

Gatsby is built with Node.js — to get up and running, you will need to have a recent version installed on your computer. 

### ⌚ Download Node.js

If you don’t have Node.js installed, visit the [Node.js site](https://nodejs.org/) and follow the instructions to download and install the recommended version for your operating system. Once you have followed the install steps, make sure everything was installed properly:

### ✋ Check your Node.js installation
1. Open up your terminal. 
2. Run `node --version`. (If you’re not familiar with the command line, this means type `node --version`  in the command prompt, and hit the Enter key. From here on, this is what we mean by “run `command`").
3. Run `npm --version`.

You should see something like the output shown in the gif below. (Your versions may not be the same!) If entering those commands doesn’t show you a version number, go back and make sure you have installed Node.js.

![](https://d2mxuefqeaa7sj.cloudfront.net/s_8FB0E402DCBE189CA26AEC8EB1B27767B46B544EF50AE1038B4299BF5C07AD38_1520482633574_gatsby-node.gif)


Gatsby supports versions of Node back to version 6.

## npm

npm is a JavaScript package manager. A package is a module of code that you can choose to include in your projects. If you just downloaded and installed Node.js, npm was installed with it! (That’s why both were there when you checked the versions just a minute ago).

npm has three distinct components: the npm website, the npm registry, and the npm CLI (command line interface).

- On the npm website, you can browse what JavaScript packages are available in the npm registry.
- The npm registry is a large database of information about JavaScript packages available on npm. 
- Once you've identified a package you want, you use the npm CLI to install it in your project. The npm CLI is what talks to the registry — you generally only interact with the npm website or the npm CLI.

> 💡 Check out npm’s introduction, “[What is npm?](https://docs.npmjs.com/getting-started/what-is-npm)”.

## Gatsby CLI

The Gatsby CLI tool lets you quickly create new Gatsby-powered sites, and also run commands for developing Gatsby sites. It is a published npm package. You can install the Gatsby CLI from the npm registry, using the npm CLI.

### ✋ Install the Gatsby CLI tool
1. Navigate to the terminal.
2. Run `npm install --global gatsby-cli`.

A couple of different things are happening here. 

- `npm install`:
    - We’re using the npm CLI to install the Gatsby CLI. `npm install` is the command used to install packages. 
- `--global`:
    - When installing npm packages, you can install them globally, or in a specific project. (We’ll learn about the latter, later). The `--global` flag signals that we want the first option, to install globally. This means our package will be available to us on our computer, outside of the context of a specific project.
- `gatsby-cli`:
    - This is the exact name our package is registered with on the [npm registry](https://www.npmjs.com/package/gatsby-cli).

### ✋ Check your Gatsby CLI installation
1. Open up your terminal. 
2. Run `gatsby --version`.
3. Run `gatsby --help`.


![](https://d2mxuefqeaa7sj.cloudfront.net/s_8FB0E402DCBE189CA26AEC8EB1B27767B46B544EF50AE1038B4299BF5C07AD38_1520482614025_gatsby-cli.gif)


As before (when you checked your Node.js installation), the `gatsby --version` should return a version number. `--help` shows different commands available to you, now that the gatsby-cli is installed.

## Generate a new site with “Hello World”

Now let’s use the gatsby-cli tool to create our first Gatsby site. The Gatsby CLI tool lets you install “starters”, which are partially built sites with some default configuration to help you get moving faster on creating a certain type of site. Let’s scaffold out our first site!

### ✋ Generate a new Gatsby site
1. Open up your terminal. 
2. Run `gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world`. (*Note: Depending on your download speed, the amount of time this takes could vary*).
3. Run `cd hello-world`.
4. Run `gatsby develop`.
![](https://d2mxuefqeaa7sj.cloudfront.net/s_8FB0E402DCBE189CA26AEC8EB1B27767B46B544EF50AE1038B4299BF5C07AD38_1520718475736_part-zero-starter.gif)


What just happened?

- `gatsby new hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world`:
    - Starting with `gatsby` says, ‘hey, we want to use the gatsby-cli tool!’
    - `new` is a command available via the gatsby-cli to create a new Gatsby project. (remember to check out `gatsby --help`!)
    - Here, `hello-world` is an arbitrary title — you could pick anything. The CLI tool will place the code for your new site in a folder called “hello-world”.
    - Lastly, the Github URL you specified points to a code repository that holds the starter code you want to use.
- `cd hello-world`: 
    - This says ‘I want to change directories (`cd`) to this other subfolder called “hello-world”. Whenever you want to run any commands for your site, you need to be in the context for that site (aka, your terminal needs to be pointed at the directory where your site code lives).
- `gatsby develop`:
    - This command starts a development server. You will be able to see and interact with your new site in a development environment — local (on your computer, not published to the internet).

### ✋ View your site locally

Open up a new tab in your browser and navigate to [http://localhost:8000](http://localhost:8000/). 

![](https://d2mxuefqeaa7sj.cloudfront.net/s_8FB0E402DCBE189CA26AEC8EB1B27767B46B544EF50AE1038B4299BF5C07AD38_1520718713857_Screen+Shot+2018-03-10+at+3.51.20+PM.png)


Congrats! The beginnings of your very first Gatsby site! 🎉 

*Note: You’ll be able to visit this site locally at [http://localhost:8000](http://localhost:8000/) for as long as your development server is running. (That’s the process you started by running the `gatsby develop` command). To stop running that process (or to "stop running the development server"), go back to the terminal window, hold down the “control” key and then hit “c” (ctrl-c).*

> 💡 You may have wondered what the `github.com` link was. If you haven’t heard of GitHub before, you may want to pause here. To understand GitHub, you need to know what “git” is; Git is a popular version control system — it tracks and manages the history of files, and how they change over time. A "repository” (or “repo”) is where this revision history lives. GitHub is an online hosting service for git repositories. If you’re interested, check out the [Try Git: Git Tutorial](https://try.github.io/) for a 15 minute introduction to using git.

## Code Editor

A code editor is a program designed specifically for editing computer code. There are many great ones out there -- [VS Code](https://code.visualstudio.com/), [Atom](https://atom.io/), [Sublime Text](https://www.sublimetext.com/), and more.

The editor we'll use in this tutorial is VS Code.

### ⌚ Download a code editor 

Pick a code editor and download it. Don’t worry too much about which one — just what looks good to you!

## ➡️ What’s Next?

To summarize, in this section you:

- [x] Installed Node.js and the npm CLI tool
- [x] Installed the npm CLI tool
- [x] Installed the Gatsby CLI tool
- [x] Generated a new Gatsby site using the Gatsby CLI tool
- [x] Downloaded a code editor

Now, let’s move on to [getting to know Gatsby building blocks](/tutorial/part-one/).

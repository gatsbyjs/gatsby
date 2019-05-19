---
title: Glossary
---

When you're new to Gatsby there can be a lot of words that seem alien. This glossary aims to give you a 10,000ft overview of common terms and what they mean to the layperson.

## A

### AST

Abstract Syntax Tree: A tree representation of the source code that is found during a [compilation](#compiler) step between two languages. For example, [gatsby-transformer-remark](/packages/gatsby-transformer-remark/) will create an AST from [Markdown](#markdown) to describe a Markdown document in a tree structure using the [Remark](#remark) parser.

### API

Application Programming Interface: A method for one application to communicate with another. For example, a [source plugin](#source-plugin) will often use an API to get its data.

### Accessibility

The inclusive practice of removing barriers that prevent interaction with, or access to websites, by people with disabilities. When sites are correctly designed, developed and edited for accessibility, generally all users have equal access to information and functionality. Read about [Gatsby's Commitment to Accessibility](/blog/2019-04-18-gatsby-commitment-to-accessibility/).

## B

### Babel

A tool that lets you write the most modern [JavaScript](#javascript), and on [build](#build) it gets [compiled](#compiler) to code that most web browsers can understand.

### Back-End

The behind the scenes that the [public](#public) do not see. This often refers to the control panel of your [CMS](#cms). These are often powered by server-side programming languages such as PHP or ASP.net.

### Build

The process of taking your code and content and packaging it into a website that can be hosted and accessed.

## C

### CLI

Command Line Interface: An application that runs on your computer through the [command line](#command-line) and interacted with your keyboard.

Gatsby has two command line interfaces. One, [`gatsby`](/docs/gatsby-cli/), for day-to-day development with Gatsby and another, [`gatsby-dev`](/contributing/setting-up-your-local-dev-environment/#gatsby-repo-install-instructions), for those who contribute to the Gatsby project.

### CMS

Content Management System: an application where you can manage your content and have it saved to a database or file for accessing later. Examples of Content Management Systems include Wordpress, Drupal, Contentful, and Netlify CMS.

### Command Line

A text-based interface to run commands on your computer. The default Command Line applications for Mac and Windows are `Terminal` and `Command Prompt` respectively.

### Compiler

A compiler is a program that translates code written in one language to another language. For example [Gatsby](#gatsby) can compile [React](#react) applications into static [HTML](#html) files.

### Components

Components are independent and re-usable chunks of code powered by [React](#react) that, when combined, make up your website or app.

A component can include components within it. In fact, [pages](#page) and [templates](#templates) are examples of components.

### Config

The configuration file, `gatsby-config.js` tells Gatsby information about your website. A common option set in config is your sites metadata that can power your SEO meta tags.

## D

### Data Source

Content and data's origin point, typically integrated into Gatsby with [source plugins](#source-plugin). A data source is often a [Headless CMS](#headless-cms), but it could also include Markdown, JSON, or YAML files.

### Database

A database is a structured collection of data or content. Often a [CMS](#cms) will save to a database using [back-end technologies](#back-end). They're often accessed in Gatsby via a [source plugin](#source-plugin)

### Decoupled

Decoupling describes the separation of different concerns. With [Gatsby](#gatsby) this most commonly means decoupling the [Front-End](#front-end) from the [Back-End](#back-end), like with [Decoupled Drupal](https://dri.es/how-to-decouple-drupal-in-2019) or [Headless Wordpress](https://www.smashingmagazine.com/2018/10/headless-wordpress-decoupled/).

### Deploy

The process of [building](#build) your website or app and uploading onto a [hosting provider](#hosting).

### Development Environment

The [environment](#environment) when you're developing your code. It's accessed through the [CLI](#cli) using `gatsby develop`, and provides extra error reporting and things to help you debug before building for [production](#production-environment).

## E

### ECMAScript

ECMAScript (often referred to as ES) is a specification for scripting languages. [JavaScript](#javascript) is an implementation of ECMAScript. Often developers will use [Babel](#babel) to [compile](#compiler) the latest ECMAScript code into more widely supported JavaScript.

### Environment

The environment that Gatsby runs in. For example, when you are writing your code you probably want as much debugging as possible, but that's undesirable on the live website or app. As such, Gatsby can change its behavior depending on the environment it's in.

Gatsby supports two environments by default, the [development environment](#development-environment) and the [production environment](#production-environment).

### Environment Variables

[Environment Variables](/docs/environment-variables/) allow you to customise the behavior of your app depending on its [environment](#environment). For instance, you may wish to get content from a staging CMS during development and connect to your production CMS when you [build](#build) your site. With environment variables you can set a different URL for each environment.

## F

### Filesystem

The way files are organized. With Gatsby, it means having files in the same place as your website's or app's code instead of pulling data from an external [source](#source). Common filesystem usage in Gatsby includes Markdown content, images, data files, and other assets.

### Front-End

The [public-facing](#public) interface for your website or app, delivered using web technologies: HTML, CSS, and JavaScript.

## G

### Gatsby

Gatsby is a modern website framework that builds performance into every website or app by leveraging the latest web technologies such as [React](#react), [GraphQL](#graphql), and modern [Javascript](#javascript). Gatsby makes it easy to create blazing fast, compelling web experiences without needing to become a performance expert.

### GraphQL

A [query](#query) language that allows you to pull data into your website or app. It’s the [interface that Gatsby uses](/docs/graphql/) for managing site data.

## H

### HTML

A markup language that every web browser is able to understand. It stands for HyperText Markup Language. [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) gives your web content a universal informational structure, defining things like headings, paragraphs, and more. It is also key to providing an accessible website.

### Headless CMS

A [CMS](#cms) that only handles the [back-end](#back-end) content management instead of handling both the back-end and [front-end](#front-end). This type of setup is also referred to as [Decoupled](#decoupled).

### Hosting

A hosting provider keeps a copy of your website or app and makes it accessible to [the public](#public). [Common hosting providers for Gatsby](/docs/deploying-and-hosting/) projects include Netlify, AWS, S3, Surge, Heroku, and more.

### Hydration

Once a page that has been generated by Gatsby is loaded in a web browser, it is re-hydrated into a full React application that can manipulate the DOM.

## I

## J

### JAMStack

JAMStack refers to a modern web architecture using [JavaScript](#javascript), [APIs](#api), and ([HTML](#html)) markup. From [JAMStack.org](https://jamstack.org): "It’s a new way of building websites and apps that delivers better performance, higher security, lower cost of scaling, and a better developer experience."

### JavaScript

A programming language that helps us make the web dynamic and interactive. [JavaScript](https://developer.mozilla.org/en-US/docs/Web/Javascript) is a widely deployed web technology in browsers. It is also used on the server-side with [Node.js](#node). It is an implementation of the [ECMAScript](#ECMAScript) specification.

## K

## L

## M

### MDX

Extends [Markdown](#markdown) to support [React](#react) [components](#components) within your content.

### Markdown

A way of writing HTML content with plain text, using special characters to denote content types such as hash symbols for [headings](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements), and underscores and asterisks for text emphasis.

## N

### NPM

[Node](#node) [Package](#package) Manager. Allows you to install and update other packages that your project depends on. [Gatsby](#gatsby) and [React](#react) are examples of your project's dependencies. See also: [Yarn](#yarn).

### Node

Gatsby uses [data nodes](/docs/node-interface/) to represent a single piece of data. A [data source](#data-source) will create multiple nodes.

### Node.js

A program that lets you run [JavaScript](#javascript) on your computer. Gatsby is powered by Node.

## O

## P

### Package

A package usually describes a [JavaScript](#javascript) program that has additional information about how it should be distributed and used, such as its version number. [NPM](#npm) and [Yarn](#yarn) manages and installs the packages your project uses. [Gatsby](#gatsby) itself is a package.

### Page

An [HTML](#html) page.

This also often refers to [components](#components) that live in `/src/pages/` and are converted to pages by [Gatsby](#gatsby), as well as [pages created dynamically](/docs/creating-and-modifying-pages/#creating-pages-in-gatsby-nodejs) in your `gatsby-node.js` file.

### Plugin

Additional code that adds functionality to Gatsby that wasn't included out-of-the-box. Common [Gatsby plugins](/plugins/) include [source](#source-plugins) and [transformer](#transformer) plugins for pulling in and manipulating data, respectively.

### Production Environment

The [environment](#environment) for the [built](#build) website or app that users will experience when [deployed](#deploy). It can be accessed through the [CLI](#cli) using `gatsby build` or `gatsby serve`.

### Programmatically

Something that automatically happens based on your code and configuration. For example, you might [configure](#config) your project to create a [page](#page) for every blog post written, or read and display the current year as part of a copyright in your site footer.

### Public

This usually refers to either a member of the public (as opposed to your team) or the folder `/public` in which your [built](#build) website or app is saved.

## Q

### Query

The process of requesting specific data from somewhere. With Gatsby you normally query with [GraphQL](#graphql).

## R

### React

A code library (written with [JavaScript](#javascript)) for building user interfaces. It’s the framework that [Gatsby](#gatsby) uses to build pages and structure content.

### Remark

A parser to translate [Markdown](#markdown) to other formats like [HTML](#html) or [React](#react) code.

### Routing

Routing is the mechanism for loading the correct content in a website or app based on a network request - usually a URL. For example, it allows for routing URLs like `/about-us` to the appropriate [page](#page), [template](#template), or [component](#component).

## S

### Source Code

Source code is your code that lives in `/src/` folder and makes up the unique aspects of your website or app. It is made up of [JavaScript](#javascript) and sometimes [CSS](#css) and other files.

The source code gets [built](#build) into the site the [public](#public) will see.

### Source Plugin

A [plugin](#plugin) that adds additional [data sources](#data-source) to Gatsby that can then be [queried](#query) by your [pages](#page) and [components](#component).

### Starter

A pre-configured Gatsby project that can be used as a starting point for your project. They can be discovered using the [Gatsby Starter Library](/starters/) and installed using the [Gatsby CLI](/docs/starters/).

### Static

Gatsby [builds](#build) static versions of your page that can be easily [hosted](#hosting). This is in contrast to dynamic systems in which each page is generated on-the-fly. Being static affords major performance gains because the work only needs to be done once per content or code change.

It also refers to the `/static` folder which is automatically copied into `/public` on each [build](#build) for files that don't need to be processed by Gatsby but do need to exist in [public](#public).

## T

### Template

A [component](#component) that is [programmatically](#programmatically) turned into a page by Gatsby.

### Transformer

A [plugin](#plugin) that transforms one type of data to another. For example you might transform a spreadsheet into a [JavaScript](#javascript) array.

## U

## V

## W

### Webpack

A [JavaScript](#javascript) application that Gatsby uses to bundle your website's code up. This happens automatically on [build](#build).

## X

## Y

### Yarn

A [package](#package) manager that some prefer to [NPM](#npm). It is also required for [developing Gatsby](/contributing/setting-up-your-local-dev-environment/#using-yarn).

## Z

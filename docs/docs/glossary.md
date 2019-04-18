---
title: Glossary
---

When you're new to Gatsby there can be a lot of words that seem alien. This glossary aims to give you a 10,000ft overview of common terms and what they mean to the layperson.

## A

### API

Application Programming Interface: A method for one application to communicate with another. For example, a [source plugin](#source-plugin) will often use an API to get its data.

## B

### Build

The process of taking your code and content and packaging it into a website that can be hosted and accessed.

### Babel

A tool that lets you write the most modern [JavaScript](#javascript), and on [build](#build) it gets converted to code that most web browsers can understand.

### Back-End

The behind the scenes that the [public](#public) do not see. This often refers to the control panel of your [CMS](#cms).

## C

### Command Line

A text-based interface to run commands on your computer. The default Command Line applications for Mac and Windows are `Terminal` and `Command Prompt` respectively.

## Components

Components are independent and re-usable chunks of code powered by [React](#react) that when combined make up your website or app.

A component can include components within it. In fact, [pages](#page) and [templates](#templates) are examples of a component.

### CLI

Command Line Interface: An application that runs on your computer and is run through the [command line](#command-line) and interacted with your keyboard.

Gatsby has two command line interfaces. One, `gatsby`, for day-to-day development with Gatsby and another, `gatsby-dev`, for those who contribute to the Gatsby project.

### CMS

Content Management System: an application where you can manage your content and have it saved to a database or file for accessing later.

### Config

The config file, `gatsby-config.js` tells Gatsby information about your website. A common option set in config is your sites meta data that can power your SEO meta tags.

## D

### Database

A database is a structured collection of data or content. Often a [CMS](#cms) will save to a database. They're often accessed in Gatsby via a [source plugin](#source-plugin)

### Data Source

A source of data that usually gets fed into Gatsby using [source plugins](#source-plugin). A data source is often a [CMS](#cms).

### Development Environment

The [environment](#environment) for when you're developing your code. It's accessed through the [CLI](#cli) using `gatsby develop`.

### Deploy

The process of [building](#build) your website or app and uploading onto a [hosting provider](#hosting).

## E

### Environment

The environment that Gatsby runs in. For example when you are writing your code you probably want as much debugging as possible, but that's undesirable on the live website or app. As such, Gatsby can change its behaviour depending on the environment it's in.

Gatsby supports two environments by default, the [development environment](#development-environment) and the [production environment](#production-environment).

### Environment Variables

Allows you to customise the behavior of your app depending on its [environment](#environment).

## F

### Filesystem

The way files are organized. But with Gatsby it means having files in the same place as your website's or app's code instead of having data from an external [source](#source)

### Front-End

The [public-facing](#public) interface for your website or app.

## G

### Gatsby

This project. A framework based on [React](#react) that helps you build blazing fast websites and apps.

### GraphQL

A [query](#query) language that allows you to pull data into your website or app. It’s the interface that Gatsby uses for managing site data.

## H

### Hosting

A hosting provider keeps a copy of your website or app and makes it accessible to [the public](#public).

### HTML

A markup language that every web browser is able to understand. It stands for HyperText Markup Language. HTML gives your web content a universal informational structure, defining things like headings, paragraphs, and more.

### Headless CMS

A [CMS](#cms) that only handles the [back-end](#back-end) content management instead of handling both the back-end and [front-end](#frontend).

## I

## J

### JavaScript

A programming language that helps us make the web dynamic and interactive.

## K

## L

## M

### Markdown

A way of writing content in plain text, using special characters such as underscores and asterisks to format content.

### MDX

Extends [Markdown](#markdown) to support [React](#react) [components](#components) within your content.

## N

### Node

This might refer to Node.js - a program that lets you run [JavaScript](#javascript) on your computer. Gatsby is powered by Node.

In Gatsby it may also refer to a data node. A single piece of data. A [data source](#data-source) will create multiple nodes.

### NPM

[Node](#node) Package Manager. Allows you to install and update other packages that your project depends on. [Gatsby](#gatsby) and [React](#react) are examples of your project's dependencies. See also: [Yarn](#yarn).

## O

## P

### Page

An [HTML](#html) page.

This also often refers to [components](#components) that live in `/src/pages/` and are converted to pages by Gatsby.

### Plugin

Additional code that adds functionality to Gatsby that wasn't included out-of-the-box.

### Public

This usually refers to either a member of the public (as opposed to your team) or the folder `/public` in which your [built](#build) website or app is saved.

### Programmatically

Something that automatically happens based on your code and configuration. For example, you might [configure](#config) your project to create a [page](#page) for every blog post written.

### Production Environment

The [environment](#environment) for the [built](#build) website or app. It's accessed through the [CLI](#cli) using `gatsby build` or `gatsby serve`.

## Q

### Query

The process of requesting specific data from somewhere. With Gatsby you normally query with [GraphQL](#graphql).

## R

### React

A code library (built with [JavaScript](#javascript)) for building user interfaces. It’s the framework that [Gatsby](#gatsby) uses to build pages and structure content.

## S

### Source Code

Source code is your code that lives in `/src/` folder and makes up the unique aspects of your website or app. It is made up of [JavaScript](#javascript) and sometimes [CSS](#css) and other files.

The source code gets [built](#build) into the site the [public](#public) will see.

### Source Plugin

A [plugin](#plugin) that adds additional [data sources](#data-source) to Gatsby that can then be [queried](#query) by your [pages](#page) and [components](#component).

### Starter

A pre-configured Gatsby project that can be used as a starting point for your project. They can be discovered using the [Gatsby Starter Library](/starters/).

### Static

Gatsby [builds](#build) static versions of your page that can be easily [hosted](#hosting). This is in contrast to dynamic systems in which each page is generated on-the-fly. Being static affords major performance gains because the work only needs to be done once per content or code change.

It also refers to the `/static` folder which is automatically copied into `/public` on each [build](#build) for files that don't need to be processed by Gatsby but do need to exist in [public](#public).

## T

### Template

A [component](#component) that is [programatically](#programatically) turned into a page by Gatsby.

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

A package manager that some prefer to [NPM](#npm).

## Z

## 0-9

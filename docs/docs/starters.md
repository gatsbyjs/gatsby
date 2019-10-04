---
title: "Gatsby Starters"
---

The Gatsby CLI tool lets you install **starters**, which are boilerplate Gatsby sites maintained by the community and intended for jump-starting development quickly.

## Installing starters

Execute the `gatsby new` command to clone a boilerplate starter, install its dependencies, and clear Git history.

### Using Git repo URLs

When creating a new Gatsby site, you can optionally specify a starter to base your new site on; they can come from any publicly available Git repo, such as GitHub, GitLab, or Bitbucket. You can supply the `[URL_OF_STARTER_GIT_REPO]` directly:

```shell
gatsby new [SITE_DIRECTORY] [URL_OF_STARTER_GIT_REPO]
```

For example, to create a site in a `blog` directory with Gatsby Starter Blog from its GitHub URL:

```shell
gatsby new blog https://github.com/gatsbyjs/gatsby-starter-blog
```

This downloads the files and initializes the site by running `npm install`.

### Using GitHub usernames and repos instead of URLs

Alternatively, you can also supply a GitHub user name and repository:

```shell
gatsby new [SITE_DIRECTORY] [GITHUB_USER_NAME/REPO]
```

Here is an example with the `[GITHUB_USER_NAME/REPO]` format:

```shell
gatsby new blog gatsbyjs/gatsby-starter-blog
```

This also downloads the files and initializes the site by running `npm install`.

If you don't specify a custom starter, your site will be created from the [default starter](https://github.com/gatsbyjs/gatsby-starter-default).

> **Note:** If you work for an Enterprise-level company where you are unable to pull from public GitHub repositories, you can still set up Gatsby. Check out the [docs to learn more](/docs/setting-up-gatsby-without-gatsby-new/).

### Using a local starter

Another option is to supply a path (relative or absolute) to a local folder containing a starter:

```shell
gatsby new [SITE_DIRECTORY] [LOCAL_PATH_TO_STARTER]
```

Here is an example assuming a starter exists on the path `Code/my-local-starter`:

```shell
gatsby new blog Code/my-local-starter
```

## Official starters

Official starters are maintained by Gatsby.

| Starter                                                                              | Demo                                                         | Use case                       | Features                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------ | ---------------------------- |
| [gatsby-starter-default](https://github.com/gatsbyjs/gatsby-starter-default)         | [Demo](https://gatsby-starter-default-demo.netlify.com/)     | Appropriate for most use cases | General Gatsby site          |
| [gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog)               | [Demo](https://gatsby-starter-blog-demo.netlify.com/)        | Create a basic blog            | Blog post pages and listings |
| [gatsby-starter-hello-world](https://github.com/gatsbyjs/gatsby-starter-hello-world) | [Demo](https://gatsby-starter-hello-world-demo.netlify.com/) | Learn Gatsby                   | Gatsby bare essentials       |

## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in a Gatsby project.

    .
    ├── node_modules
    ├── src
    ├── .gitignore
    ├── .prettierrc
    ├── gatsby-browser.js
    ├── gatsby-config.js
    ├── gatsby-node.js
    ├── gatsby-ssr.js
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    └── README.md

1.  **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

2.  **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser) such as your site header or a page template. `src` is a convention for “source code”. This directory further contains following sub directories.

    - **`/components`**: This sub directory contains all the repetatvie sections of UI on your fron-tend.
    - **`/images`**: Images used on your site will be under this directory.
    - **`/pages`**: Every component under this directory will be defined as a page of your site.

3.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

4.  **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

5.  **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://www.gatsbyjs.org/docs/browser-apis/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.

6.  **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://www.gatsbyjs.org/docs/gatsby-config/) for more detail).

7.  **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby Node APIs](https://www.gatsbyjs.org/docs/node-apis/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.

8.  **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://www.gatsbyjs.org/docs/ssr-apis/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

9.  **`LICENSE`**: Gatsby is licensed under the MIT license.

10. **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won’t change this file directly).**

11. **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

12. **`README.md`**: A text file containing useful reference information about your project.

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.org/). Here are some places to start:

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.org/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.org/docs/).** In particular, check out the _Guides_, _API Reference_, and _Advanced Tutorials_ sections in the sidebar.

## Making starters

Learn [how to make a starter](/docs/creating-a-starter/) in the Gatsby docs. Starters can be created for your team(s) only or distributed to the broader community. It's up to you!

## Community starters

Community starters are created and maintained by Gatsby community members.

- Looking for a starter for a particular use case? Browse starters that have been submitted to the [Starter Library](/starters/).
- Created a starter you'd like to share? Follow [these steps to submit your starter](/contributing/submit-to-starter-library/) to the Starter Library.

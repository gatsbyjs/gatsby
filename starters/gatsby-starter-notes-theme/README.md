<p align="center">
  <a href="https://www.gatsbyjs.com">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Starter for the official Gatsby notes theme
</h1>

Quickly get started using the Gatsby notes theme! This starter creates a new Gatsby site that is preconfigured to work with the [official Gatsby notes theme](https://www.npmjs.com/package/gatsby-theme-notes).

## 🚀 Quick start

1.  **Create a Gatsby site.**

    Use the Gatsby CLI to create a new site, specifying the notes theme starter.

    ```shell
    # create a new Gatsby site using the notes theme starter
    gatsby new my-themed-notes https://github.com/gatsbyjs/gatsby-starter-notes-theme
    ```

2.  **Start developing.**

    Navigate into your new site’s directory and start it up.

    ```shell
    cd my-themed-notes/
    gatsby develop
    ```

3.  **Open the code and start customizing!**

    Your site is now running at `http://localhost:8000`!

    To get started, check out the guide to [using a Gatsby theme](https://gatsbyjs.com/docs/themes/using-a-gatsby-theme), or the longer, [more detailed tutorial](https://gatsbyjs.com/tutorial/using-a-theme).

## 🧐 What's inside?

Here are the top-level files and directories you'll see in a site created using the notes theme starter.

```text
gatsby-starter-notes-theme
├── content
│   └── notes
│       ├── example-dir
│       │   └── hi.mdx
│       └── hello.mdx
├── .gitignore
├── .prettierrc
├── gatsby-config.js
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

1.  **`/content`**: A content folder holding assets that the theme expects to exist. In this case, you're starting with some example notes! Delete the notes contained in `/content/notes` and start writing your own!

2.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

3.  **`.prettierrc`**: This file tells [Prettier](https://prettier.io/) which configuration it should use to lint files.

4.  **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. When using themes, it's where you'll include the theme plugin, and any customization options the theme provides.

5.  **`LICENSE`**: This Gatsby starter is licensed under the 0BSD license. This means that you can see this file as a placeholder and replace it with your own license.

6.  **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won’t change this file directly).**

7.  **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

8.  **`README.md`**: A text file containing useful reference information about your project.

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.com/).

Here are some places to start:

### Themes

- To learn more about Gatsby themes specifically, we recommend checking out the [theme docs](https://www.gatsbyjs.com/docs/themes/).

### General

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.com/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.com/docs/).** In particular, check out the _Reference Guides_ and _Gatsby API_ sections in the sidebar.

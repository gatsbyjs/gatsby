---
title: Gatsby Project Structure
---

Inside a Gatsby project, you may see some or all of the following folders and files:

```text
/
|-- /.cache
|-- /plugins
|-- /public
|-- /src
    |-- /api
    |-- /pages
    |-- /templates
    |-- html.js
|-- /static
|-- gatsby-config.js
|-- gatsby-node.js
|-- gatsby-ssr.js
|-- gatsby-browser.js
```

## Folders

- **`/.cache`** _Automatically generated._ This folder is an internal cache created automatically by Gatsby. The files inside this folder are not meant for modification. Should be added to the `.gitignore` file if not added already.

- **`/plugins`** This folder hosts any project-specific ("local") plugins that aren't published as an `npm` package. Check out the [plugin docs](/docs/plugins/) for more detail.

- **`/public`** _Automatically generated._ The output of the build process will be exposed inside this folder. Should be added to the `.gitignore` file if not added already.

- **`/src`** This directory will contain all of the code related to what you will see on the frontend of your site (what you see in the browser), like your site header, or a page template. “src” is a convention for “source code”.

  - **`/api`** JavaScript and TypeScript files under `src/api` become functions automatically with paths based on their file name. Check out the [functions guide](/docs/reference/functions/) for more detail.
  - **`/pages`** Components under `src/pages` become pages automatically with paths based on their file name.
  - **`/templates`** Contains templates for programmatically creating pages. Check out the [templates docs](/docs/conceptual/building-with-components/#page-template-components) for more detail.
  - **`html.js`** For custom configuration of default `.cache/default_html.js`. Check out the [custom HTML docs](/docs/custom-html/) for more detail.

- **`/static`** If you put a file into the static folder, it will not be processed by webpack. Instead it will be copied into the public folder untouched. Check out the [assets docs](/docs/how-to/images-and-media/static-folder/#adding-assets-outside-of-the-module-system) for more detail.

## Files

You can also author all these files in TypeScript, see [TypeScript and Gatsby](/docs/how-to/custom-configuration/typescript/) for more details.

- **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](/docs/reference/config-files/gatsby-browser/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.

- **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. Check out the [config docs](/docs/reference/config-files/gatsby-config/) for more detail.

- **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby node APIs](/docs/reference/config-files/gatsby-node/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.

- **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](/docs/reference/config-files/gatsby-ssr/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

## Miscellaneous

The file/folder structure described above reflects Gatsby-specific files and folders. Since Gatsby sites are also React apps, it's common to use standard React code organization patterns such as folders like `/components` and `/utils` inside `/src`. The [React docs](https://reactjs.org/docs/faq-structure.html) have more information on a typical React app folder structure.

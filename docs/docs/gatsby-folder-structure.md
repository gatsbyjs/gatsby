## Gatsby Folder Structure:

```
/                      // Root
|-- /.cache            // Gatsby's cache directory (created automatically)
|-- /plugins           // (optional) To host local plugins code - link to writing plugin docs
|-- /public            // Gatsby's output directory (created automatically)
|-- /src               // Your project source
    |-- /pages         // describe pages dir
    |-- /templates     // (optional) describe templates dir
    |-- html.js        // (optional) to customise .cache/default-html.js
|-- /static            // (optional) Your static files that are not imported through module system.
|-- gatsby-config.js   // describe & link to docs
|-- gatsby-node.js     // describe & link to docs
|-- gatsby-ssr.js      // describe & link to docs
|-- gatsby-browser.js  // describe & link to docs
```

- **`/.cache`** This folder is created automatiacally by Gatsby. The files inside this folder is not meant for modification.

- **`/plugins`** To host local plugins that are not published as an `npm` package. More info here - https://next.gatsbyjs.org/docs/plugins/

- **`/src`** This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser), like your site header, or a page template. “Src” is a convention for “source code”.
    - **`/pages`** Components under src/pages become pages automatically with paths based on their file name. More info here - https://next.gatsbyjs.org/docs/recipes/#creating-pages
    - **`/templates`** Contains templates for programmatically creating pages. More info here - Components under src/pages become pages automatically with paths based on their file name.
    - **`html.js`** For custom configuration of default .cache/default_html.js. More info here - https://next.gatsbyjs.org/docs/custom-html/

- **`/static`** If you put a file into the static folder, it will not be processed by Webpack. Instead it will be copied into the public folder untouched. More info here - https://www.gatsbyjs.org/docs/adding-images-fonts-files/#adding-assets-outside-of-the-module-system

- **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://next.gatsbyjs.org/docs/browser-apis/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.
  
- **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://next.gatsbyjs.org/docs/gatsby-config/) for more detail).
  
- **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby node APIs](https://next.gatsbyjs.org/docs/node-apis/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.
  
- **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://next.gatsbyjs.org/docs/ssr-apis/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

#### Misc:
Above folder structure reflects `gatsby` specific files and folders. Since Gatsby is a normal React project, one can use folders like `/components`, `/utils` etc inside `/src` for organizing code. More info on a typical React app folder structure can be found here - https://reactjs.org/docs/faq-structure.html


## Gatsby Folder Structure:

```
/                      
|-- /.cache            
|-- /plugins           
|-- /public            
|-- /src               
    |-- /pages         
    |-- /templates     
    |-- html.js        
|-- /static            
|-- gatsby-config.js   
|-- gatsby-node.js     
|-- gatsby-ssr.js      
|-- gatsby-browser.js  
```

- **`/.cache`** This folder is created automatiacally by Gatsby. The files inside this folder is not meant for modification.

- **`/plugins`** To host local plugins that are not published as an `npm` package. Check out the [plugin docs](https://gatsbyjs.org/docs/plugins/) for more detail.

- **`/src`** This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser), like your site header, or a page template. “Src” is a convention for “source code”.
    - **`/pages`** Components under src/pages become pages automatically with paths based on their file name. Check out the [pages docs](https://gatsbyjs.org/docs/recipes/#creating-pages) for more detail. 
    - **`/templates`** Contains templates for programmatically creating pages. Check out the [templates docs](https://www.gatsbyjs.org/docs/building-with-components/#page-template-components) for more detail.
    - **`html.js`** For custom configuration of default .cache/default_html.js. Check out the [custom html docs](https://gatsbyjs.org/docs/custom-html/) for more detail.

- **`/static`** If you put a file into the static folder, it will not be processed by Webpack. Instead it will be copied into the public folder untouched. Check out the [assets docs](https://www.gatsbyjs.org/docs/adding-images-fonts-files/#adding-assets-outside-of-the-module-system) for more detail.

- **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://gatsbyjs.org/docs/browser-apis/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.
  
- **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. Check out the [config docs](https://gatsbyjs.org/docs/gatsby-config/) for more detail.
  
- **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby node APIs](https://gatsbyjs.org/docs/node-apis/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.
  
- **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://gatsbyjs.org/docs/ssr-apis/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

#### Misc:
Above folder structure reflects `gatsby` specific files and folders. Since Gatsby is a normal React project, one can use folders like `/components`, `/utils` etc inside `/src` for organizing code. Check out [React docs](https://reactjs.org/docs/faq-structure.html) for more info on a typical React app folder structure.


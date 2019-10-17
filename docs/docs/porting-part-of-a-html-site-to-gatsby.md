---
title: Porting Part of a HTML Site to Gatsby
---

## Why partially port a HTML website?

When introducing Gatsby into an existing static HTML site, it might not be feasible to rewrite the entire site at once. In these cases, porting pieces of the site to Gatsby one at a time, while the rest of the site still uses HTML, might be preferable. This page will guide you through this process.

> **Note**: The aim of this guide is to take a shallow, focused path to porting part of a static HTML website to Gatsby. The full [Gatsby tutorial](/tutorial/) is more broad, with deeper dives on the core concepts and technologies.

## Why Gatsby?

### Web building blocks

A static web site is generally composed of distinct building blocks made of HTML. With Gatsby you will define the blocks that make up your site once and then reuse them. Building a website with these custom parts is fun! A lot of the repetitive tasks disappear as your changes take immediate effect across a site.

### Community

Gatsby is Open Source and extensible in every way. A vibrant and active community of contributors, over 2500 to date, are constantly improving Gatsby itself. The Gatsby community also adds extra functionality through plugins and themes. The comprehensive documentation here at [gatsbyjs.org](https://gatsbyjs.org) is also maintained by the community.

### Built in path prefixing

There are two common issues faced when porting part of a static site:

- Correctly prefixing link paths within the site.
- Hosting static assets (CSS, images etc.) on a separate domain from the HTML files.
  Gatsby has built in options to set consistent and functional paths for both pages and assets.

### Dynamic content

Gatsby gathers content from any number of sources, into a single input point for each page. Once ported, content extracted from the site is easy to maintain in isolation from code. You can choose from many content management platforms such as Prismic and Contentful. Gatsby will bring the content together for consumption in your pages.

## Getting Started

### Which part to port?

Here is the structure of an example static HTML/CSS website that this guide will walk through:

```
 asset-domain
 ├── favicon.ico
 ├── person.png
 ├── normalize.css
 └── style.css
website-domain
  ├── index.html
  ├── 404.html
  ├── about.html
  ├── contact.html
  ├── services
  │   ├── index.html
  │   ├── growing.html
  │   ├── cleaning.html
  │   ├── shrinking.html
  └── who
      ├── index.html
      ├── ellla-arborist.html
      ├── marin-leafer.html
      └── sam-surgeon.html
```

The `/who` section of the site is a great candidate for porting as it is all within a single folder. Through this guide, you will develop the ported Gatsby section in isolation before integrating into the site.

### Assumptions

The example site uses global CSS files (`style.css` and `normalize.css`), more sophisticated styling structures can be accommodated but will not be covered here. No client side JavaScript (e.g jQuery etc.) is on the example site, Gatsby may conflict with client side JavaScript if it is not removed when porting.

### Development environment

Gatsby generates websites and compiles applications, but also has a tool for local development. With some setup your computer can run generation and the local development environment. Follow the [Gatsby development environment tutorial](/tutorial/part-zero/) to get setup and then return here to continue.

### Gatsby Project

Now that you are setup we'll be using the Gatsby and NPM CLI tools on your command line to get this site section ported!
Make a new project using the Gatsby hello world starter with the following command:

```shell
gatsby new gatsby-site-section https://github.com/gatsbyjs/gatsby-starter-hello-world
```

You now have a folder called `gatsby-site-section` containing a basic Gatsby website. Open the new folder in your code editor and `cd` (change directory) into the folder in your command line to continue:

```shell
cd gatsby-site-section
```

The `/src` folder contains all code for the Gatsby site. In the Gatsby build stage [every file in the `/src/pages` folder will result in a HTML file](/docs/recipes/#creating-pages-automatically). Currently, the only page file is the root `/src/pages/index.js`:

```jsx:title=/gatsby-site-section/src/pages/index.js
import React from "react"

export default () => <div>Hello world!</div>
```

[Run the development server](/docs/quick-start/#start-development-server) with `gatsby develop` in the command line to see the website in your browser. Hello Gatsby! 👋

## Porting index.html

Here is `/who/index.html` from the example site structure above:

```html:title=/website-domain/who/index.html
<html lang="en">
  <head>
    <title>Taylor's Tidy Trees - Who We Are</title>
    <link
      href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/favicon.ico"
      rel="shortcut icon"
      type="image/x-icon"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"
      integrity="sha256-l85OmPOjvil/SOvVt3HnSSjzF1TUMyT9eV0c2BzEGzU="
      crossorigin="anonymous"
    />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/style.css"
    />
  </head>
  <body>
    <header>
      <h3 class="brand-color">Taylor's Tidy Trees</h3>
      <nav>
        <ul>
          <li><a href="/about.html">About</a></li>
          <li><a href="/services/index.html">Services</a></li>
          <li><a href="/index.html">Who We Are</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <h2>These are our staff:</h2>
      <ul>
        <li><a href="/who/ella-arborist.html">Ella (Arborist)</a></li>
        <li><a href="/who/sam-surgeon.html">Sam (Tree Surgeon)</a></li>
        <li><a href="/who/marin-leafer.html">Marin (Leafer)</a></li>
      </ul>
    </main>
  </body>
</html>
```

In the following sections, you'll convert this block of HTML into its equivalent code in Gatsby.

### Head elements

You might have noticed that the `/src/pages/index.js` file doesn't have a `<html>`, `<head>` or `<body>`. Gatsby makes a basic html structure for each page and places the `/src/pages/index.js` output into its body. More `<head>` elements and `<html>` attributes are added to the output page with a module called [React Helmet](https://github.com/nfl/react-helmet). React Helmet is added to a Gatsby project in the command line with NPM and then to the Gatsby config file:

```shell
npm install --save react-helmet gatsby-plugin-react-helmet
```

Gatsby projects have a config file at `/gatsby-config.js` where options can be specified and plugins added. Add a plugin line with `gatsby-plugin-react-helmet` to your config file:

```js:title=/gatsby-site-section/gatsby-config.js
/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  plugins: ["gatsby-plugin-react-helmet"], // highlight-line
}
```

Now you can import the `<Helmet>` component to the `index.js` file and place `<header>` & `<main>` elements for the existing HTML. Gatsby pages must have a single root parent so add a [React Fragment component](https://reactjs.org/docs/fragments.html) around them:

```jsx:title=/src/pages/index.js
import React from "react"
import Helmet from "react-helmet"

export default () => (
  <>
    <Helmet></Helmet>
    <header></header>
    <main>
      <div>Hello world!</div>
    </main>
  </>
)
```

### Page content

Copy in the contents of each of the 3 sections from the `/who/index.html` file above:

```jsx:title=/gatsby-site-section/src/pages/index.js
import React from "react"
import Helmet from "react-helmet"

export default () => (
  <>
    <Helmet>
      {/* highlight-start */}
      <title>Taylor's Tidy Trees - Who We Are</title>
      <link
        href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/favicon.ico"
        rel="shortcut icon"
        type="image/x-icon"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/normalize.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/style.css"
      />
      {/* highlight-end */}
    </Helmet>
    <header>
      {/* highlight-start */}
      <h3 className="brand-color">Taylor's Tidy Trees </h3>
      <nav>
        <ul>
          <li>
            <a href="/about.html">About</a>
          </li>
          <li>
            <a href="/services/index.html">Services</a>
          </li>
          <li>
            <a href="/index.html">Who We Are</a>
          </li>
          <li>
            <a href="/contact.html">Contact</a>
          </li>
        </ul>
      </nav>
      {/* highlight-end */}
    </header>
    <main>
      {/* highlight-start */}
      <h2>These are our staff:</h2>
      <ul>
        <li>
          <a href="/who/ella-arborist.html">Ella (Arborist)</a>
        </li>
        <li>
          <a href="/who/sam-surgeon.html">Sam (Tree Surgeon)</a>
        </li>
        <li>
          <a href="/who/marin-leafer.html">Marin (Leafer)</a>
        </li>
      </ul>
      {/* highlight-end */}
    </main>
  </>
)
```

Take a look in the browser and we should have a functional website! Let's take a second to explore how HTML and JavaScript combine in a Gatsby application.

### HTML and JavaScript

The code for Gatsby pages look like a hybrid of JavaScript and HTML. The code for each page is a JavaScript function describing a block of HTML given a set of inputs. Gatsby runs each page's JavaScript function during build to get a static HTML file.

The appearance of Gatsby page code depends on how dynamic the content and behaviour is. The code for a very static page will _almost_ look like pure HTML. The code for a page with many inputs, and logic applied to those inputs, will look more like pure JavaScript. This guide will stay on the HTML side of the balance to suit the your static site. Using Gatsby to arrange the necessary JavaScript now, opens many future possibilities though. Gatsby delivers your JavaScript page functions to the user after the static HTML, ready for client side dynamic behaviour.

Your pasted HTML in `/gatsby-site-section/src/pages/index.js` needs a small change to be valid. `class` attributes [must be renamed to `className`](https://reactjs.org/docs/dom-elements.html#classname) for usage with React, as class is a reserved word in JavaScript.

### Layout component

There are 3 pages in the `/who` section of Taylor's Tidy Trees for members of the team, here is the one for Ella:

```html:title=/website-domain/who/ella-arborist.html
<html lang="en">
  <head>
    <title>Taylor's Tidy Trees - Who We Are - Ella</title>
    <link
      href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/favicon.ico"
      rel="shortcut icon"
      type="image/x-icon"
    />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/normalize.css"
    />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/style.css"
    />
  </head>
  <body>
    <header>
      <h3 class="brand-color">Taylor's Tidy Trees</h3>
      <nav>
        <ul>
          <li><a href="/about.html">About</a></li>
          <li><a href="/services/index.html">Services</a></li>
          <li><a href="/who/index.html">Who We Are</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <h2>Ella is an excellent Arborist. We guarantee it.</h2>
      <div class="bio-card">
        <img
          alt="Comically crude stick person sketch"
          src="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/person.png"
        />
        <p>Ella</p>
      </div>
    </main>
  </body>
</html>
```

The foundational building block for building and styling pages in Gatsby is [the `<Layout>` component](/docs/layout-components/). The `<Layout>` component wraps around page content, providing the common structure that appears on all pages. Looking at the `/index.html` and `/who/ella-arborist.html` you can see that most of the page is identical. Other than the title of the page, everything except for the contents of the main block is repeated.

Create a folder inside `/src`, next to `/src/pages` called `components`. Inside components make a file called `Layout.js`. Here is a basic structure to use for the file:

```jsx:title=/gatsby-site-section/src/components/Layout.js
import React from "react"
import Helmet from "react-helmet"

export default ({ children }) => (
  <>
    <Helmet></Helmet>
    <header></header>
    <main>{children}</main>
  </>
)
```

Like in `/src/pages/index.js` the file exports a JavaScript function that returns an HTML like structure, but this time the function takes an argument. The first argument provided to a component function is always an object called the props. On the props object, the children of the component are available. Within the HTML like markup, the curly braces wrap a JavaScript expression whose result will be placed there. In this case it is a very simple expression that results in the contents of the `children` variable.

The common elements from the `/index.html` and `/who/ella-arborist.html` files can now copied into the `<Layout>` component. A second prop is also added and used in a second JavaScript expression in the `<title>` element. The added expression results in the title, with the `staffName` prop added only if it is provided. You'll see the prop used later on when porting the `/who/ella-arborist.html` page.

```jsx:title=/gatsby-site-section/src/components/Layout.js
import React from "react"
import Helmet from "react-helmet"

export default ({ children, staffName }) => (
  <>
    <Helmet>
      <title>
        Taylor's Tidy Trees - Who We Are{staffName ? ` - ${staffName}` : ""}
      </title>
      <link
        href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/favicon.ico"
        rel="shortcut icon"
        type="image/x-icon"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/normalize.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/style.css"
      />
    </Helmet>
    <header>
      <h3 class="brand-color">Taylor's Tidy Trees</h3>
      <nav>
        <ul>
          <li>
            <a href="/about.html">About</a>
          </li>
          <li>
            <a href="/services/index.html">Services</a>
          </li>
          <li>
            <a href="/who/index.html">Who We Are</a>
          </li>
          <li>
            <a href="/contact.html">Contact</a>
          </li>
        </ul>
      </nav>
    </header>
    <main>{children}</main>
  </>
)
```

The next step is to use that `<Layout>` component in the `index.js` page file. Gatsby itself provides a number of core building blocks, `<Link>` is one of them. `<Link>` is imported at the top of the file to replace the `<a>` tags. The Link component takes a `to` prop as opposed to the `href` of an anchor tag. Using the `<Link>` component enables Gatsby to make optimizations like prefetching page content just before a user clicks a link.

```jsx:title=/gatsby-site-section/src/pages/index.js
import React from "react"
import Layout from "../components/Layout"
import { Link } from "gatsby"

export default () => (
  <Layout>
    <h2>These are our staff:</h2>
    <ul>
      <li>
        <Link to="/ella-arborist">Ella (Arborist)</Link>
      </li>
      <li>
        <Link to="/sam-surgeon">Sam (Tree Surgeon)</Link>
      </li>
      <li>
        <Link to="/marin-leafer">Marin (Leafer)</Link>
      </li>
    </ul>
  </Layout>
)
```

### Porting other section pages

Now it's time for the work to really pay off! Ella's page is a matter of using your `<Layout>` component again and copying in the main content. Don't forget to change `class` to `className`! A `staffName` prop can be passed to `<Layout>` this time to change the dynamic page title, passing props is similar to an attribute on a HTML element:

```jsx:title=/gatsby-site-section/src/pages/ella-arborist.js
import React from "react"
import Layout from "../components/Layout"
import { Link } from "gatsby"

export default () => (
  {/* highlight-start */}
  <Layout staffName="Ella">
  {/* highlight-end */}
    <h2>Ella is an excellent Arborist. We guarantee it.</h2>
    <div className="bio-card">
      <img
        alt="Comically crude stick person sketch"
        src="https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/person.png"
      />
      <p>Ella</p>
    </div>
  </Layout>
)
```

The other 2 pages for Marin and Sam can now be made with a similar structure. Maybe you are even thinking about another component for the Bio Card!

## Build

With your new Gatsby application complete, it's time to integrate it into your existing HTML website. If you were to build the Gatsby application into static files now and upload them in the place of the existing HTML files, the paths of the links made by Gatsby would not be correct. There are a couple of Gatsby configuration options to fix this.

### Path Prefix

The `pathPrefix` option in `/gatsby-config.js` tells Gatsby the path at which the build output will be served from. Links to other pages and to the generated JavaScript files that provide [progressive enhancements](/docs/glossary/#progressive-enhancement) for the user will be prefixed with the `pathPrefix` value. This is the config addition for the example Gatsby application, served at the `/who` path:

```js:title=/gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-react-helmet`],
  pathPrefix: `/who`, // highlight-line
}
```

### Asset Prefix

The `assetPrefix` option tells Gatsby about an external location, the asset domain, where its compiled JavaScript files will be served from. In addition to the `pathPrefix`, the link paths for Gatsby's generated JavaScript files will be prefixed with the `assetPrefix` value if provided. In the example website there are three assets already hosted at an asset domain; the style sheets `style.css` and `normalize.css`, and the image `person.png`. If Gatsby's generated JavaScript assets are also to be served from the asset domain, the `assetPrefix` must be set with its address:

```js:title=/gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-react-helmet`],
  pathPrefix: `/who`,
  {/* highlight-start */}
  assetPrefix:
    "https://gatsby-html-partial-assets.s3.eu-west-2.amazonaws.com/gatsby",
  {/* highlight-end */}
}
```

### Build step

You now have a site that mirrors the existing HTML site section. Stop the development server if it's still running, it's time to run the build! 🎉

```shell
gatsby build --prefix-paths
```

> **Note**: The `--prefix-paths` option _must_ be used for path and asset prefixes to be applied

Once a build is complete, the compiled set of files can be found in `/public`. It's all in there and ready to replace the existing files! In the case of the example site, the folder contents are deployed directly to the `/who` path of the website domain in place of the existing HTML files. If `assetPrefix` is also being used, the contents are also uploaded to a new `/gatsby/who` folder on the asset domain.

### Integrated site file structure

Here is the structure of the HTML & non JavaScript asset files after the built, Gatsby `/who` section is added to website domain and the `/gatsby/who/` folder is added at the asset domain:

```
 asset-domain
├── favicon.ico
├── person.png
├── normalize.css
├── style.css
{/* highlight-start */}
└── gatsby
    └── who
{/* highlight-end */}
website-domain
  ├── assets
  │   ├── person.png
  │   ├── style.css
  │   └── gatsby
  │       └── who
  ├── index.html
  ├── 404.html
  ├── about.html
  ├── contact.html
  ├── services
  │   ├── index.html
  │   ├── growing.html
  │   ├── cleaning.html
  │   ├── shrinking.html
  └── who
{/* highlight-start */}
      ├── index.html
      ├── ellla-arborist
      │   └── index.html
      ├── marin-leafer
      │   └── index.html
      └── sam-surgeon
          └── index.html
{/* highlight-end */}
```

## Porting more parts

To replace multiple parts of a website with a single Gatsby application there are a few additional steps:

1. Mirror the website structure within the Gatsby `/src/pages` folder.

2. Adjust the `pathPrefix` Gatsby configuration option to reflect the new root path at which the Gatsby application will be served.

3. Ensure the `to` props on all Gatsby `<Link>` components are correct relative to `/src/pages/` as the application root.

For the example website covered in this guide, here is what each step involves for also migrating the `services` part of the site:

1. Create a `/src/pages/who` folder, and move into it all the files currently in `/src/pages`. Create a new `/src/pages/services` folder and follow the html migration steps above for the `/services/` HTML files. The already completed Layout component will save a lot of the work!

```
gatsby-site-sections/src/pages

├── who
│   ├── index.js
│   ├── ellla-arborist.js
│   ├── marin-leafer.js
│   └── sam-surgeon.js
└── services
    ├── index.js
    ├── growing.js
    ├── cleaning.js
    └── shrinking.js
```

2. The `pathPrefix` configuration option is no longer needed as the Gatsby application will now be served at the root of the site alongside the remaining HTML files.

3. Add `/who` to the start of the `to` attributes in the existing index.js, and do the equivalent for `/services`. In the `Layout.js` component file, change the `<a>` tag linking to the services page to a Gatsby `<Link>` component.

After following those steps for the example site it is pretty much entirely Gatsby! Migrating the rest of the HTML files, `/about.html`, `/contact.html`, `/404.html` and `/index.html` to Gatsby pages would enable pre-fetching links between all the pages in the site. The complete Gatsby application is ready to take full advantage of Gatsby and it's community.

## Next steps

Gatsby can handle assets through direct imports to page and component files, the [asset import documentation](/docs/importing-assets-into-files/) covers imports as well as the less optimized static folder. Once assets are handled through Gatsby, plugins can be used to optimize their processing and delivery.

The [building with components page](/docs/building-with-components/) has information about why Gatsby uses React component architecture and how it fits into a Gatsby application.

[Sourcing content and data](/docs/content-and-data/) is a great next step if you are interested in separating your content from your website code.

Short guides can be found at the [recipes section](/docs/recipes), for adding functionality such as optimizing and querying local images, adding markdown support and integrating various modern CSS tools. The [adding website functionality page](/docs/adding-website-functionality/) has longer guides for larger tasks such as making your site accessible, adding authentication and doing client side data fetching.

Gatsby is dedicated to making you feel welcome! Learn more and engage with the community by starting a conversation or contributing yourself. The [community page](/contributing/community/) has further information and channels where you can get support.

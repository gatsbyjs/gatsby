---
title: Docs and Website Components
tableOfContentsDepth: 2
---

import LayerModel from "../../www/src/components/layer-model"
import HorizontalNavList from "../../www/src/components/horizontal-nav-list"
import Breadcrumb from "../../www/src/components/docs-breadcrumb"
import { itemListContributing } from "../../www/src/utils/sidebar/item-list"
import TableOfContents from "../../www/src/components/docs-table-of-contents"

The Gatsbyjs.org site has a handful of components that have been developed to facilitate writing new content for the blog and the docs. There are also components that help organize and lay out content in various pages across the website.

This guide documents what components are available and explains how to use them. You can also refer to the [code for this page on GitHub](https://github.com/gatsbyjs/gatsby/blob/master/docs/contributing/docs-and-website-components.md) to see to how each component can be used, because they are all embedded here!

Information about authoring in Markdown and styling components on the site is also listed.

## Globally available components

A variety of components have been written to help with formatting code and content across the blog and the docs and don't need to be imported.

---

### Guide List

The `<GuideList />` is a component that renders an h2 heading and a list of links to child docs nested below the current doc in the site's information architecture. It is often used on overview pages like the [Headless CMS](/docs/headless-cms/) guide where many other pages are nested below it to show what a docs section contains.

#### Usage

The Guide List component takes one prop:

- `slug` (required) - the value of which is already available on every page's context on Gatsbyjs.org by default

The slug is used to find a matching value in one of the `yaml` files that sets up the hierarchical structure for how the guides in the [docs](https://github.com/gatsbyjs/gatsby/blob/master/www/src/data/sidebars/doc-links.yaml), [tutorial](https://github.com/gatsbyjs/gatsby/blob/master/www/src/data/sidebars/tutorial-links.yaml), and [contributing](https://github.com/gatsbyjs/gatsby/blob/master/www/src/data/sidebars/contributing-links.yaml) section are organized. It finds the matching entry in the hierarchy and renders the pages that are children of it in a list.

The component can be used like this:

```markdown:title=docs/headless-cms
---
title: Headless CMS
---

Overview information about headless CMSs...

<GuideList slug={props.slug} /> // highlight-line
```

#### Sample

When rendered in a page, the Guide List looks like this:

<GuideList slug="/docs/headless-cms/" />

_This example has the prop `slug="/docs/headless-cms/"` set, and can be seen on the doc for [Headless CMS](/docs/headless-cms/)_

---

### Egghead Embed

To embed video content from [Egghead](https://egghead.io) on the site, there is an `<EggheadEmbed />` component that adds an iframe with the video inline with other content.

#### Usage

The Egghead Embed component takes two props:

- `lessonLink` - the URL of the lesson from Egghead
- `lessonTitle` - the name of the lesson that is used to add more information to the embedded iframe.

It can be used like this:

```markdown:title=docs/using-gatsby-image
---
title: Using Gatsby Image
---

This is how you use `gatsby-image`...

<!-- highlight-start -->

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-use-gatsby-image-s-graphql-fragments-for-blurred-up-and-traced-svg-images"
  lessonTitle="Use gatsby-image's GraphQL fragments for blurred-up and traced SVG images"
/>

<!-- highlight-end -->
```

#### Sample

Rendered, it looks like this:

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-use-gatsby-image-s-graphql-fragments-for-blurred-up-and-traced-svg-images"
  lessonTitle="Use gatsby-image's GraphQL fragments for blurred-up and traced SVG images"
/>

---

### Pull Quote

The `<Pullquote />` component is used to call out a quote in the blog. It applies borders and styles that make a section of the content pop out to readers.

#### Usage

The Pull Quote component takes two optional props, and uses the children it wraps to populate its inner content:

- `citation` - the reference of the person or entity that made the quoted statement
- `narrow` - styles the pull quote by removing the left and right negative margins, keeping it inside the parent container. This prop is not used in the blog to help the quote stand out, but could be used in docs where it's necessary to keep content from overlapping with other sections of the layout, such as the Table of Contents.

It is used like this:

```markdown:title=blog/new-announcement.md
---
title: Big News!
author: Jay Gatsby
---

<!-- highlight-start -->
<Pullquote citation="Winston Churchill" narrow={true}>
  To improve is to change, so to be perfect is to have changed often.
</Pullquote>
<!-- highlight-end -->
```

#### Sample

Rendered, the component looks like this:

<Pullquote narrow={true} citation="Winston Churchill">
  To improve is to change, so to be perfect is to have changed often.
</Pullquote>

---

## Other available components

Other less commonly used components aren't globally available, but can imported at the top of a Markdown file and used in other docs.

---

### Layer Model

The `<LayerModel />` was made to help explain concepts of how Gatsby works at a high level. It conceptually breaks Gatsby into different layers and shows how data is pulled, aggregated, and eventually rendered as an app. It's used on docs pages to help explain how Gatsby works at different levels.

#### Usage

The Layer Model component takes one prop:

- `initialLayer` - defaults to `Content`, can be one of `Content`, `Build`, `Data`, `View`, `App` that correspond to the different layers

```markdown
---
title: GraphQL Concepts in Gatsby
---

import LayerModel from "../../www/src/components/layer-model"

To help understand how GraphQL works in Gatsby...

<LayerModel initialLayer="Data" />
```

#### Sample

When used, it looks like this:

<LayerModel initialLayer="Data" />

### Horizontal Navigation List

The `<HorizontalNavList />` was made for the [Glossary](/docs/glossary/), and renders a list of links to alphabetical subheadings on the page in a horizontal format. Because of its specific use case, it isn't made globally available but can be imported if needed on other pages.

#### Usage

The Horizontal Nav List component takes two props:

- `slug` - which is provided in the props of the page by default
- `items` - an array of strings for items to render and wrap with a `<Link />` to subheadings

The docs on Gatsbyjs.org use the [gatsby-remark-autolink-headers](/packages/gatsby-remark-autolink-headers/) plugin to automatically apply hover links to heading tags across docs pages. Because it automatically creates links to subheadings on pages like the glossary, the Horizontal Nav List can supply matching links (like `"guide-list"` which would align with the automatically created link at `/docs/docs-and-website-components#guide-list`).

<!-- prettier-ignore -->
```markdown
---
title: Glossary
---

import HorizontalNavList from "../../www/src/components/horizontal-nav-list.js"

The glossary defines key vocabulary...

---

<HorizontalNavList
  slug={props.slug}
  items={["guide-list", "egghead-embed", "pull-quote", "layer-model", "horizontal-navigation-list"]}
/>
```

#### Sample

Rendered, it looks like this:

<HorizontalNavList
items={[
"guide-list",
"egghead-embed",
"pull-quote",
"layer-model",
"horizontal-navigation-list",
]}
slug={props.slug}
/>

### Breadcrumb

The `<Breadcrumb />` component is used in layout files to display the hierarchy of pages a user is currently browsing on.

#### Usage

The Breadcrumb component takes one prop:

- `location` - an object provided in the props of page templates by default
- `itemList` - an object comprised of the docs hierarchical structure

<!-- prettier-ignore -->
```jsx
import Breadcrumb from "../../www/src/components/docs-breadcrumb"

<Breadcrumb location={props.location} itemList={itemList} />
```

_You can also refer to [an example of usage of the Breadcrumb in the Gatsbyjs.org source code](https://github.com/gatsbyjs/gatsby/blob/1d65ce051967dda5c4a89da920fc34692524e237/www/src/templates/template-docs-markdown.js#L82)_

#### Optional `breadcrumbTitle` entries in sidebar files

To alter the title of a doc that is displayed in the Breadcrumb component, a `breadcrumbTitle` is supported as a key in the [sidebar YAML files](https://github.com/gatsbyjs/gatsby/tree/master/www/src/data/sidebars). It is commonly used to provide an abbreviated version of a doc's title when displayed next to its parent page title, e.g. shortening "Adding a Custom webpack Config" to "webpack Config".

#### Sample

Rendered, it looks like this:

<Breadcrumb
location={{
    pathname: "/contributing/docs-and-website-components/",
  }}
itemList={itemListContributing}
/>

---

### Table of Contents

The `<TableOfContents />` component is used to render a list of subheaders from a docs page and automatically provide deep links to them.

#### Usage

The component takes 2 props:

- `location` - an object provided in the props of page templates by default
- `page` - an object with data passed in from the sites `gatsby-node.js` that contains information from the MDX plugin about the structure of headings

<!-- prettier-ignore -->
```jsx
import TableOfContents from "../../www/src/components/docs-table-of-contents"

<TableOfContents location={props.location} page={page} />
```

_You can also refer to [an example of usage of the Table of Contents in the Gatsbyjs.org source code](https://github.com/gatsbyjs/gatsby/blob/1d65ce051967dda5c4a89da920fc34692524e237/www/src/templates/template-docs-markdown.js#L121)_

The Table of Contents component also has some optional configurations that can be set in the frontmatter of a doc's markdown.

In docs where the Table of Contents isn't required and should be disabled, a key in the frontmatter called `disableTableOfContents` can be set to `true` like this:

```markdown
---
title: Glossary
disableTableOfContents: true
---

When you're new to Gatsby there can be a lot of words to learn...
```

In other docs where the Table of Contents is extremely long it can make sense to only show headers from the doc up to a certain level, rather than all subheadings. You can set the `tableOfContentsDepth` key to a number that will limit the subheadings shown in the table of contents to that "depth". If it is set to 2, `<h2>`/`##`, and `<h3>`/`###` headers will be listed, if set to 3, `<h2>`/`##`, `<h3>`/`###`, and `<h4>`/`####` will all be shown. It is set like this:

```markdown
---
title: Glossary
tableOfContentsDepth: 2
---

When you're new to Gatsby there can be a lot of words to learn...
```

#### Sample

The Table of Contents looks like this when rendered (and is also displayed on the right hand side of the page):

<TableOfContents
location={{ pathname: "/contributing/docs-and-website-components/" }}
page={{
    frontmatter: {
      title: "Docs and Website Components",
      tableOfContentsDepth: 2,
    },
    tableOfContents: {
      items: [
        {
          url: "#globally-available-components",
          title: "Globally available components",
          items: [
            {
              url: "#guide-list",
              title: "Guide list",
            },
            {
              url: "#egghead-embed",
              title: "Egghead embed",
            },
            {
              url: "#pull-quote",
              title: "Pull quote",
            },
          ],
        },
        {
          url: "#other-available-components",
          title: "Other available components",
          items: [
            {
              url: "#layer-model",
              title: "Layer model",
            },
            {
              url: "#horizontal-navigation-list",
              title: "Horizontal navigation list",
            },
            {
              url: "#breadcrumb",
              title: "Breadcrumb",
            },
            {
              url: "#table-of-contents",
              title: "Table of Contents",
            },
          ],
        },
        {
          url: "#writing-content-in-markdown",
          title: "Writing content in markdown",
          items: [
            {
              url: "#code-blocks",
              title: "Code blocks",
            },
          ],
        },
        {
          url: "#styling-components-on-gatsbyjsorg-with-theme-ui",
          title: "Styling components on Gatsbyjs.org with Theme-UI",
          items: [
            {
              url: "#design-tokens",
              title: "Design tokens",
            },
            {
              url: "#the-sx-prop",
              title: "The sx prop",
            },
          ],
        },
      ],
    },
  }}
/>

---

## Writing content in Markdown

New docs and blog posts are added to the [docs](https://github.com/gatsbyjs/gatsby/tree/master/docs/) folder inside the Gatsby repository. They are stored as `.md` (Markdown) or `.mdx` (MDX) files and can be written using Markdown, or using inline JSX thanks to MDX. Writing in Markdown will output tags that are styled according to [Gatsby's design guidelines](/guidelines/color/).

You can read more about writing in Markdown in the [Markdown syntax guide](/docs/mdx/markdown-syntax).

### Code blocks

Code can be formatted using regular Markdown syntax, but the docs site has additional enhancements that can be used thanks to various Gatsby plugins that aren't all native Markdown.

#### Usage

Code blocks are wrapped in 3 backticks. A language can be added immediately after the first set of back ticks to provide syntax highlighting for the language. A `title` of the file can be added after the language. Line highlighting can be included in the code block by commenting `highlight-line`, or `highlight-start` followed by a `highlight-end`.

<!-- prettier-ignore -->
````
```javascript:title=gatsby-config.js
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-prismjs`
      ],
    },
  },
]
```
````

In order to demonstrate how to use code blocks in a doc without your triple backticks being styled and formatted automatically (just like the example above), you can wrap a set of triple backticks in quadruple backticks like this:

`````
````
```javascript:title=gatsby-config.js
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-prismjs`
      ],
    },
  },
]
```
````
`````

#### Sample

The above code block is rendered like this:

<!-- prettier-ignore -->
```javascript:title=gatsby-config.js
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-prismjs`
      ],
    },
  },
]
```

Line numbers and line highlighting can be added to code blocks as well, and is explained in detail in the [`gatsby-remark-prismjs` README](/packages/gatsby-remark-prismjs/?=remark#optional-add-line-highlighting-styles).

## Styling components on Gatsbyjs.org with Theme-UI

Styles on the site are applied using [Theme-UI](https://theme-ui.com/), which allows for theming across the site based on design tokens (also called variables).

### Design tokens

Design tokens are used to consolidate the number of colors and style attributes that are applied to components throughout the site. By limiting the styles that can be applied, the site stays consistent with the guidelines for color, typography, spacing, etc.

Tables listing design tokens that are used on the site can be found in the [design guidelines](/guidelines/design-tokens/).

### The `sx` prop

The [`sx` prop](https://theme-ui.com/sx-prop) from Theme-UI allows you to access theme values to style elements and components, it should be used wherever possible. The prop is "enabled" by adding `theme-ui`'s [JSX pragma](https://theme-ui.com/jsx-pragma) at the top of a `js` file.

It is still okay to directly import tokens, e.g. `mediaQueries` or `colors` directly from [`www/src/gatsby-plugin-theme-ui`](https://github.com/gatsbyjs/gatsby/blob/master/www/src/gatsby-plugin-theme-ui/index.js) if it helps your specific use case — for example when global CSS is required, when passing theme values to other libraries or plugins, when authoring complex responsive styles, etc.

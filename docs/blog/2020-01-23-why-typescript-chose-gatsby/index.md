---
title: "Why the TypeScript team is using Gatsby for its new website"
date: 2020-01-23
author: Orta Therox
excerpt: "Discover why the TypeScript team uses Gatsby, and what constraints they use to make it work for their team"
tags: ["typescript", "developer-experience", "story", "case-studies"]
---

## Why are we using Gatsby for TypeScript's new Website?

The TypeScript v1 site is a [Jekyll](https://jekyllrb.com/) website, and Jekyll packs a lot of power into a small tool. Jekyll is really great way to build static websites, but it's built to work for small-medium sized websites of around 1-20 pages.

You can feel the scope by how they treat templating ([liquid](https://shopify.github.io/liquid/), which is a sandbox'd logic-less templating engine), how they treat the data modelling for your site (there are only really two data types: [Posts](https://jekyllrb.com/docs/posts/) & [Pages](https://jekyllrb.com/docs/pages/)) and how the tool is set up to work better with a specific folder structure.

At [Artsy](https://artsy.github.io), where I worked at before TypeScript, we had started to hit the limits of [working within Jekyll](https://artsy.github.io/blog/2019/01/30/why-we-run-our-blog/) at around 200 blog posts and a lot of custom pages. It was taking a long time to see any changes live, and the way in which we built new features into the site tended to multiply the build times. We took some time to explore different tools to use as a writing environment for our blog. In the process I looked deeply into Gatsby, and concluded that it was the right abstraction for building static sites.

A few months later, I joined the TypeScript team and one of my goals was to provide better foundations for our documentation and reference tools. Right now, the TypeScript v1 website is about 60 pages, but if it was going to expand to handle internationalization (a multiplier on pages) and support all the wild ideas I have to make TypeScript easier to learn, we would need an abstraction aimed at handling larger sites but it had to stay statically deployed.

It would also help to have a tool where we can use TypeScript. Our v1 website is currently a Ruby project wrapped by some JavaScript script files and Gulp. Consolidating that on JavaScript everywhere would be a good win.

### What Makes Gatsby Unique

When I was evaluating static site generators, what makes Gatsby stand out is this one idea which adds an extra step to the build process. In a normal static site generator, you would more or less directly map files to their output:

```ts
const files = fs.getDirSync()
const htmlFiles = files.map(makePage)
htmlFiles.forEach(html => {
  fs.writeFileSync(filename, html)
})
```

Gatsby on the other hand does something a bit more like this:

```ts
const setupData = () => {
  const files = fs.getDirSync()
  const data = files.map(makePage)
  graphQLServer.add(data)
}

const createSite = () => {
  const pages = graphQLServer.query("{  pages { title, text } }")
  const htmls = pages.map(renderComponent)
  htmls.forEach(html => {
    fs.writeFileSync(filename, html)
  })
}

setupData()
createSite()
```

Gatsby adds a GraphQL API which sits in-between the setup of the data and the generation of files in your static site. This abstraction provides a very strong separation of "setting up the site" vs "representation on the file system" which provides more places to introspect what is going on internally.

What does this look like in practice? The server-side generation starts at [`gatsby-node.js`](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/gatsby-node.js) but an interesting example is how a TSConfig Reference page is set up:

- In the Gatsby config file, [we request a plugin](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/gatsby-config.js#L52-L58) to look for markdown files in a particular folder and to mark them as `tsconfig-reference`.
- Then in `onCreatePages` in `gatsby-node.js` we make a [GraphQL query to get all these files](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/lib/bootup/ingestion/createTSConfigReference.ts#L12-L26) via the name `"tsconfig-reference"`.
  These files are then used to create Pages inside Gatsby (e.g. `en.md` => `/en/tsconfig`, `pt.md` => `/pt/tsconfig`) and we link the React component used to render them.
- Once all of the pages are set up, Gatsby runs through each page.
- For the TSConfig it would load [this template](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/src/templates/tsconfigReference.tsx), run [this query](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/src/templates/tsconfigReference.tsx#L94-L120),and pass the results as the initial argument to [this function](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/src/templates/tsconfigReference.tsx#L9) - it does this per language.

It's a few more steps then `mv ../tsconfig/en.html en/tsconfig.html` - yep, but once you grok the larger idea, then each step is a well composed, isolated and easily tested part of a larger system. That's what makes Gatsby a great abstraction.

### Types For Tools

The TypeScript support in Gatsby is good, and improving as they start to port their own codebase to TypeScript. When I first started, I shipped [a few `d.ts`](https://github.com/gatsbyjs/gatsby/pull/13619) file improvements and welcome any pings from their team with questions when it changes. In the last 2-3 months, I've been running in a fully typed codebase which has been a breeze.

If you're familiar with React, and clicked through into the [TSConfig Template](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/src/templates/tsconfigReference.tsx#L9) - you might have been a bit surprised by the somewhat unorthodox usage of React.

I'm using React as a templating language, and not as a reactive UI framework. The site never uses a `setState`-like API in React. Effectively meaning that React runs once when the site is generated, and then never used again.

My goal is that the TypeScript v2 website can be understood with the least amount of abstractions possible. It should not be too surprising, but vast majority of the TypeScript compiler team have a compiler background, and don't really do web development. To ensure that they can contribute, and understand the codebase I'm aiming to use Gatsby and React to get as close to vanilla HTML + CSS + TypeScript (heh) as possible.

One way to do that, is to separate the generation of HTML + CSS from any additional JavaScript which happens at runtime. This means almost every component in the site conforms to this general pattern:

```ts
// JS imports
import React, { useEffect } from "react"
import { Layout } from "../components/layout"

// Style
import "./tsconfig.scss"

// The main React component
const TSConfigReferenceTemplateComponent = (props: PropTypes) => {
  useEffect(() => {
    // code which happens when the page has finished loading
  })

  // creation of static HTML via React + JSX
  const post = props.data.markdownRemark
  return (
    <Layout locale={props.pageContext.locale}>
      <div className="tsconfig">
        <div id="full-option-list" className="indent">
          <h1>TSConfig Reference</h1>
        </div>

        <nav id="sticky">
          <ul>
            <li>...</li>
          </ul>
        </nav>

        <div className="indent">
          <div dangerouslySetInnerHTML={{ __html: post.html! }} />
        </div>
      </div>
    </Layout>
  )
}

export default TSConfigReferenceTemplateComponent

// The optional GraphQL query to get info for that page
export const pageQuery = graphql`
  query TSConfigReferenceTemplate($path: String, $tsconfigMDPath: String!) {
    sitePage(path: { eq: $path }) {
      id
    }
    markdownRemark(fileAbsolutePath: { eq: $tsconfigMDPath }) {
      html
    }
  }
`
```

I like this, because the rest of the team don't need to _learn_ React - just JSX which acts as a proxy for HTML.

In the meanwhile, anyone working on the code stills get the advantages in tooling, because all of this is supported by the TypeScript compiler:

- I can still make custom React components like `Layout` above to encapsulate complexity,and TypeScript still has the props verified
- JSX support with TypeScript is dreamy, and I love it
- The 'runtime' code inside `useEffect` will be transpiled and verified to be correct by TypeScript
- The 'runtime' code can re-use the same libraries as the server-side rendering, but have strong guarantees about only being optionally available

By not using any of the React `setState`-ish APIs, I can guarantee there is no "runtime" React rendering happening on a user's browser either. This means the HTML in the built file is exactly what someone will see whether they have JavaScript enabled or not. One advantage of this, has been that I can reliably run [`BackstopJS`](https://garris.github.io/BackstopJS/) to take screenshots of these static files to keep track of visual regressions as the site grows and others start to contribute.

Would I recommend this constraint to people making Gatsby websites? Probably not - it's going against the grain (React is a really good tool) of how you're expected to use Gatsby. But the trade-off is worth it for me, and it lowers the barrier if a compiler engineer wants to contribute.

### Speed

I'm blown away by how fast Gatsby is for a user.

The founder of Gatsby, Kyle Mathews [gave a great talk in 2017 on the ways in which Gatsby is fast](https://youtu.be/Gtd-Ht-D0sg?t=961) and [here more recently](https://www.youtube.com/watch?v=HQEotVfTXwk), in rough:

- Pre-fetching of related links
- Clever splitting of code
- Shrinking of assets
- Offline support
- Native lazy loading

His long term vision is to think of Gatsby as a compiler which takes a set of input source files, and will keep trying to make a static output which is faster and faster for users. Another great resource for understanding the mechanics about why Gatsby is fast is this talk by [Nicolas Goutay at GOTO 2019](https://www.youtube.com/watch?v=p14g-Sep7HY).

### Ecosystem Wins

Gatsby has a massive community, and a lot of the time I'm able to just re-use someone elses work. The TypeScript team only has a few [unique](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/gatsby-remark-shiki/README.md) [needs](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/typescript-vfs) in [our code samples](http://www.typescriptlang.org/v2/dev/twoslash/) but other than that, it's a pretty vanilla website.

It's been great to just add a single line into the [`gatsby-config.js`](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/typescriptlang-org/gatsby-config.js), run `yarn add gatsby-plugin-something` and suddenly a whole new set of features are set up. Plugins tend to be small and easy to audit, I've used a few.

### TypeScript Support

While not "out-of-the-box", with a little elbow grease (as of early 2020) to get comprehensive TypeScript support:

- Add [`ts-node`](https://www.npmjs.com/package/ts-node) to your `devDependencies`, and create a [`tsconfig.json`](https://github.com/microsoft/TypeScript-Website/blob/0afd526969d98c321787ab1962f72f9361ab54bd/packages/typescriptlang-org/tsconfig.json) in the root of your site
- Add set up the plugin [`gatsby-plugin-typescript`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-typescript)
- At the top of both `gatsby-config.js` and `gatsby-node.js` add:
  ```ts
  require("ts-node").register({ files: true })
  ```
  From these files, you can import `.ts` or .`tsx` files.
- To generate types for your GraphQL queries, use the plugin [gatsby-plugin-codegen](https://www.npmjs.com/package/gatsby-plugin-codegen) (I [.gitignored](https://github.com/microsoft/TypeScript-website/blob/0df8f249d812acb37541c9f0aa39f4c35dafe8b6/packages/typescriptlang-org/.gitignore#L71-L74) some of its output)

If you're not gonna go all-in on TypeScript, (which is totally reasonable!) you can get a lot of tooling wins in VS Code by using JSDoc to annotate functions in your `gatsby-node.js`:

```js
/** @type { import("gatsby").GatsbyNode["createPages"] } */
const createPages = (args, _opts) => {
  args. // You'll get auto-complete on args now
}

module.export.createPages = createPages
```

Follow [this issue](https://github.com/gatsbyjs/gatsby/issues/18983) if you want to stay on top of the best way to use TypeScript with Gatsby.

With that plug sorted, I just want to say thanks to the Gatsby team and everyone improving the gatsby ecosystem for providing a solid way to build really fast websites! You make all our lives a little bit better.

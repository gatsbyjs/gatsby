---
title: "Migrating My Blog From Hexo To Gatsby"
date: "2017-10-01"
image: "hexo-to-gatsby.png"
author: "Ian Sinnott"
excerpt: "How I migrated my blog to Gatsby and how you can do the same."
---

_This article was originally posted on
[my blog (original link)](https://blog.iansinnott.com/migrating-a-blog-to-gatsby-part-2-of-gatsby-migration/).
I'm reposting here in the hopes that it helps more people get started with
Gatsby!_

# Migrating a blog to Gatsby

---

**Abstract:** Gatsby is a great tool for building a blog. In part 1 I did the
more basic task of migrating an existing React site to Gatsby. This time I
migrated my blog, which was a lot more involved and required a lot more
Gatsby-specific knowledge.

Here's the gist of what I'm going to cover:

* Preparing an existing blog for migration
* Configuring Gatsby to handle markdown
* Querying your markdown files using GraphQL
* Adding custom data to the generated GraphQL schema
* Turning all your markdown files into static pages

Let's jump in.

---

## Preparing your existing blog for migration

**NOTE:** If you _don't_ already have a blog or want to create one from scratch
there's a
[tutorial for exactly that right here](/blog/2017-07-19-creating-a-blog-with-gatsby/).

Let's move some files around. Gatsby gives you a good amount of flexibility when
it comes to file structure, but for consistency with the docs I'm going to use
the suggested file structure for migrating my blog. How you handle this step
will depend on what you're migrating from. I am migrating form Hexo, which is
very similar to Jekyll in how it structures files.

### Clean up your source repo

For the first step, clear everything other than your actual post content out of
the repo. For me, this meant everything that wasn't under the `source/`
directory (that's a Hexo convention). One way to do this is to take everything
not relevant to the upcoming Gatsby blog and move it into its own directory that
doesn't interfere with anything. I chose to create `hexo.bak/` where all my old
blog files would live (except for the content).

You could also simply delete everything other than your raw content. It's up to
you. But once your done with this cleanup you should have made a decision on
where to hold your content, and moved everything else away or removed it.

Here's what that looks like for me:

```
.
├── content
│   ├── _drafts
│   │   └── [ Draft markdown files ... ]
│   └── _posts
│       └── [ Post markdown files ... ]
└── hexo.bak
    └── [ All my old hexo related files ... ]
```

For the rest of this post I'll ignore the `hexo.bak/` directory because it's not
relevant to Gatsby.

## Set up Gatsby

You need to copy all the standard Gatsby boilerplate into your directory. There
are many ways you could do this but I'll go over what I did.

To get all the Gatsby files you can use the Gatsby CLI.

```yaml
npm install -g gatsby-cli   # Install gatsby CLI
gatsby new temp-gatsby-files # Initialize gatsby in a temp directory
cp -R temp-gatsby-files/* ./ # Copy all the files into your root directory
rm -rf temp-gatsby-files     # Remove the temp directory
```

However you get Gatsby initialized in your repository root, afterwards you
should have a file structure that looks something like this:

```
.
├── content
│   └── [ Markdown files ... ]
├── public
│   └── index.html
├── src
│   ├── layouts
│   │   ├── index.css
│   │   └── index.js
│   └── pages
│       ├── 404.js
│       ├── index.js
│       └── page-2.js
├── gatsby-config.js
└── package.json
```

Now run the Gatsby dev server to make sure everything works:

```
npm run develop
```

**NOTE:** If you open up `package.json` you can see what the `develop` script is
doing.

Boom 💥! The default site is up.

![Gatsby Default Screen](https://dropsinn.s3.amazonaws.com/Screen%20Shot%202017-08-26%20at%2012.57.40%20PM.png)

## Rendering a list of posts

Let's customize that landing page to render a list of posts. You will also
probably want to customize the header and overall layout.

### Customizing the layout

This is pretty simple. Just modify the primary layout file that was generated:

```
src/layouts/index.js
```

You can also customize the styles in `src/layouts/index.css`. Stylus, Sass,
Less, etc are also supported if you add the appropriate plugin.
[Here's the list](https://github.com/gatsbyjs/gatsby/tree/master/packages)
(there's a page on the website too, but the source is more up to date).

**Sidenote:** You can also create your own plugin to do whatever you want, which
I talked about in part 1.

### Customizing the landing page

Also straightforward, just edit:

```
src/pages/index.js
```

This file is where we'll actually render out the list of posts. So where the
hell does that data come from??

### Querying data with GraphQL

Now we're getting in to the meat of Gatsby and one of the areas where it really
shines: Data sources. You can pull in data from anywhere to be rendered in your
blog, but for our use case the only data source will be the file system (aka the
markdown files stored on your hard drive).

But first, let's check out [GraphiQL][]. It's an excellent playground for
testing out GraphQL queries in any GraphQL project. Gatsby ships with it enabled
by default, thank goodness. GraphQL can actually be oddly opaque without this
excellent tool.

Visit <http://localhost:8000/___graphql> in the browser and you'll be greeted
with this lovely dev tool:

![Gatsby Graphiql](https://dropsinn.s3.amazonaws.com/Screen%20Shot%202017-08-26%20at%201.31.08%20PM.png)

I recommend getting to know this tool if you're not already familiar. You will
be coming back to this often to find the right query to pull data for your
pages.

### Querying the file system

If you play around with GraphiQL you'll notice there's not that much there.
Let's fix that. We need to teach Gatsby how to query the file system. Luckily
this is so common it's been done for you. Install the file system source plugin:

```
yarn add gatsby-source-filesystem
```

Now modify `gatsby-config.js` to both use the plugin and tell it what directory
to source files from. Add this to the `plugins` array:

```js
{
  resolve: 'gatsby-source-filesystem',
  options: {
    name: 'posts', // Name this source
    path: path.resolve('./content/_posts'), // Tell it where to find the files
  },
}
```

As you can see on my system I keep all my markdown files under `content/_posts/`
which is reflected in the `path` option for the plugin.

Now restart the dev server and open GraphiQL up again. You should have access to
the `allFile` root type. Try running this query:

```graphql
query {
  allFile {
    edges {
      node {
        ext
        name
      }
    }
  }
}
```

This will list all the files in the directory you specified to the plugin. You
can query all sorts of information about the files. Just investigate the fields
available to you under `node` in GraphQL.

**Pro tip:** Hit <kbd>ctrl</kbd><kbd>space</kbd> to trigger autocomplete and
bring up the list of all available fields.

### Handling Markdown

Being able to query files is a big win, and if you have a directory of HTML
files this is all you will need. But if you want to render markdown files as
HTML you will need another plugin. Let's add that now:

```
yarn add gatsby-transformer-remark
```

As before, add it to the `plugins` field in `gatsby-config.js`:

```js
{
  resolve: 'gatsby-transformer-remark',
  options: {
    plugins: [],
  },
}
```

This particular plugin can also take _its own_ plugins via the `plugins` option.
I've left it empty but this is where you can add things like syntax highlighting
or auto-linking of headers. Here's the current list:
https://www.npmjs.com/search?q=gatsby-remark

Save and restart your dev server, then go into GraphiQL and try out the new
`allMarkdownRemark` field:

```graphql
query {
  allMarkdownRemark {
    edges {
      node {
        html
      }
    }
  }
}
```

This query gives you the full HTML for all your markdown files. If you are using
frontmatter you can also access that here. I'm assuming you have a `title` field
in your frontmatter:

```
query {
  allMarkdownRemark {
    edges {
      node {
        frontmatter {
          title
        }
        html
      }
    }
  }
}
```

Now you have access to the full HTML of your posts as well as the titles. With
this we have enough information to render a list of posts on the front page.

### Getting GraphQL data into your components

Gatsby has the concept of the `pageQuery`. For every page you create you can
specify a `pageQuery` that will pass data into the default export of that page.

```jsx
// src/pages/index.js
import React from "react";

export default class BlogIndex extends React.Component {
  render() {
    // Handle graphql errors
    if (this.props.errors && this.props.errors.length) {
      this.props.errors.forEach(({ message }) => {
        console.error(`BlogIndex render errr: ${message}`);
      });
      return <h1>Errors found: Check the console for details</h1>;
    }

    return (
      <div>
        <h2>Some things I wrote</h2>
        {this.props.data.allMarkdownRemark.edges.map(({ node }, i) => (
          <a key={i}>{node.frontmatter.title}</a>
        ))}
      </div>
    );
  }
}

export const pageQuery = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
          }
        }
      }
    }
  }
`;
```

This is a simplified example, but there are a few things going on that might not
be intuitive.

* In the render method we first check for errors, and return early if any are
  found
* If no error are found we render a link for each item in the array:
  `this.props.data.allMarkdownRemark.edges`
* We export a `pageQuery` variable that is constructed using the magic `graphql`
  global

The error handling is pretty straightforward, if a bit verbose, as long as you
know what graphql responses look like. In case you didn't know, if you get an
error in a graphql query the response will contain the `errors` array. We check
for this array and handle it accordingly.

Now let's looks specifically at where we render a link for each blog post:

```jsx
{
  this.props.data.allMarkdownRemark.edges.map(({ node }, i) => (
    <a key={i}>{node.frontmatter.title}</a>
  ));
}
```

Notice that the data shape is exactly what we specified in the GraphQL query.
This may seem like a lot of nesting just to get at an array of data, but GraphQL
emphasizes _clarity_ over conciseness. You'll notice that if you run your
GraphQL query in GraphiQL the data will have the exact shape described above.

And that brings us finally to the page query:

```js
export const pageQuery = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
          }
        }
      }
    }
  }
`;
```

This is how you get data from Gatsby into your react components. Make sure you
don't misspell `pageQuery` otherwise you won't get what you want.

Also note that `graphql` is just some magic global variable. Your linter will
probably complain about it being undefined and you will just have to ignore it.
Personally I think it would be more clear if `graphql` was imported from Gatsby,
but the project is still young so the API could change at some point ¯\\_( ツ
)_/¯

### Linking to blog posts

> But the links don't link anywhere... where's that `href`?

Let's remedy that. Import the `Link` component and swap it for the simple
`<a>` tag that was in there before:

```jsx
import React from 'react';
import { Link } from 'gatsby';

export default class BlogIndex extends React.Component {
  render() {
    // Handle graphql errors
    if (this.props.errors && this.props.errors.length) {
      this.props.errors.forEach(({ message }) => {
        console.error(`BlogIndex render errr: ${message}`);
      });
      return <h1>Errors found: Check the console for details</h1>;
    }

    return (
      <div>
        <h2>Some things I wrote</h2>
        {this.props.data.allMarkdownRemark.edges.map(({ node }, i) => (
          <Link to={/* ??? */} key={i}>{node.frontmatter.title}</Link>
        ))}
      </div>
    );
  }
}
```

> But what does it link to? What is the URL of each blog post?

That's an open question because it depends on your data and how you structured
it before. For example, if you included the intended URL in the frontmatter of
each post it's a simple matter of updating your query to include that:

```js
export const pageQuery = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
            url # <-------------  New!
          }
        }
      }
    }
  }
`;
```

```jsx
{
  this.props.data.allMarkdownRemark.edges.map(({ node }, i) => (
    <Link to={node.frontmatter.url} key={i}>
      {node.frontmatter.title}
    </Link>
  ));
}
```

Many existing Gatsby examples use `path` within each markdown file's frontmatter
to designate the url. For example:

```md
---
title: My Post
path: my-post
---

# My post
```

In this case `node.frontmatter.path` would be used to construct URLs. If this is
the case for you then you're probably all set for the index page.

> But what if the URL for each post is **NOT** in the frontmatter?

This was exactly my situation. The URL was actually derived from the title of
the post so I had to figure out how to augment the GraphQL fields with my own
data. Namely the URL of the post derived from the post title.

## Adding custom data to the GraphQL schema

If I have a post named "Isn't this a fun title" then I want the URL to be
"isnt-this-a-fun-title". Notice that spaces turn into hyphens and special
characters are removed. This is simple enough to do in JavaScript, but it felt
wrong to do it on the fly when rendering components. This is _data_ so I wanted
to be able to query it through GraphQL.

Enter `setFieldsOnGraphQLNodeType`.

**Aside:** Gatsby is super extensible. It's the primary reason I switched from
Hexo which worked well enough for my use case.

In order to extend this particular part of Gatsby you need to create a
`gatsby-node.js` file. This file let's you work with all of Gatsby's plugin
hooks that are run in node. The GraphQL server is run in node, so this is where
we add custom fields. Example:

```js
// gatsby-node.js
const { GraphQLString } = require("graphql");

const getURL = node => {
  /* See the source link below for implementation */
};

exports.setFieldsOnGraphQLNodeType = ({ type }) => {
  if (type.name !== "MarkdownRemark") {
    return {};
  }

  return Promise.resolve({
    url: {
      type: GraphQLString,
      resolve: node => getURL(node),
    },
  });
};
```

> Source code for
> [gatsby-node.js here](https://github.com/iansinnott/iansinnott.github.io/blob/source/gatsby-node.js).

If you've worked with GraphQL before this should look very familiar. In fact, as
you can see the string type is imported directly from GraphQL and not from
Gatsby.

You check the type of node and if it's a type youʼre interested in you
resolve with some fields. Fields in GraphQL require a `type` and a way to
`resolve` the value.

I've omitted the implementation of `getURL` here, but you can see the
[source code here](https://github.com/iansinnott/iansinnott.github.io/blob/gatsby-migration/gatsby-node.js#L17)
(NOTE: in the source it's called `getSlug` instead of `getURL`).

You can use this technique to add any field you want to your GraphQL schema. Now
you should be all set to render `Link` components that actually point somewhere
interesting 👍.

## Generating pages from markdown files

This is where it all comes together. If you finished the last section you would
have ended up with a bunch of links that point to the correct URL but when you
tried visiting the URL there was nothing there 😕. This is because Gatsby hasn't
yet generated an additional pages. It's still just rendering whatever is in your
`src/pages/` directory.

By default, Gatsby will create a static HTML page for everything under
`src/pages/`. At this point we've discussed `src/pages/index.js` extensively. It
will be the `index.html` page of your site, and thus your landing page.

For any stand-alone pages, simply create a corresponding js file in the `pages/`
directory and you are good to go. For example, `src/pages/about.js` would
generate an `about.html` page. Simple.

But almost everyone will want to generate some pages based on data, not on the
files in the pages directory. Gatsby let's us do this.

### Generating custom pages

The key here is again to hook in to one of Gatsby's many plugin hooks. In this
case, `createPages`. In the same `gatsby-node.js` file as before:

```js
// gatsby-node.js

// .. other stuff from before...

exports.createPages = ({ boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  const postTemplate = path.resolve("./src/templates/custom-page.js");

  // Create a custom page!
  createPage({
    path: `/my-custom-page/`,
    component: postTemplate,
    context: {}, // Context will be passed in to the page query as graphql variables
  });
};
```

At the most basic level this method of page creation is quite simple: Grab the
`createPage` function from the API and call it with some props.

* `path` is required. This is the path that your page will have as a generated
  HTML file. It's the URL of your final page.
* `component` is also required. It's the file containing the react component
  that will be used to render this particular page.
* `context` is optional but I've included it here because it will be important
  soon. This lets you pass data down to the react component specified in the
  `component` option as well as the `pageQuery` (if any).

The API is actually pretty simple: To generate a new page call `createPage` with
some props. So in pseudo code:

```js
// Get all markdown files
// Call create page for each one
markdownFiles.forEach(post => {
  createPage({
    path: post.url,
    component: "./src/templates/post.js",
    context: {
      id: post.id,
    },
  });
});
```

I've included the pseudo code to highlight the fact that nothing too magical is
going on here. We just need to call create page for every post we want to
create. The implementation is a bit more verbose, but that's still all it's
doing.

So in order to make this work we also need to be able to query GraphQL just like
we do in the page query. Gatsby let's us do exactly that by giving us access to
the `graphql` object and letting us return a promise so that we can do async
work.

```js
// NOTE: I'm using async/await to simplify the code since it's now natively supported
// in Node 8.x. This means that our function will return a promise
exports.createPages = async ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  const postTemplate = path.resolve("./src/templates/post.js");

  // Using async await. Query will likely be very similar to your pageQuery in index.js
  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            url
          }
        }
      }
    }
  `);

  if (result.errors) {
    console.log(result.errors);
    throw new Error("Things broke, see console output above");
  }

  // Create blog posts pages.
  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.url,
      component: postTemplate,
      context: {
        // Context will be passed in to the page query as graphql vars
        id: node.id,
      },
    });
  });
};
```

Notice that the query is very similar to the `pageQuery` in index.js but it's
not identical. This time we actually want the `id` because it will allow the
post template to use the ID to query one single blog post.

## Rendering individual posts

If you've made it to this point rendering individual posts is quite
straightforward. You need to:

* Create the `postTemplate` file referenced in `createPages` above
* Export your template component as the default export
* Add a `pageQuery` that will fetch the blog post to render

Here it is in all it's glory:

```jsx
// src/templates/post.js
import React from "react";

export default class BlogPost extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;

    return (
      <div className="Post">
        <h1>{post.frontmatter.title}</h1>
        <div
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="content"
        />
      </div>
    );
  }
}

// NOTE: The $id var is passed in via context when calling createPage in gatsby-node.js
export const pageQuery = graphql`
  query PostById($id: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
      }
      html
    }
  }
`;
```

If you're not used to GraphQL syntax the `pageQuery` might be a little
intimidating, but it's all standard GraphQL so if you take the time to learn
GraphQL on its own you will be able to use that knowledge here. I.e. it is not
Gatsby-specific.

The important thing to note here is that `$id` is passed in via `context` in
`gatsby-node.js`. That's how the post data and processed HTML string make their
way into props. Then it's just a matter of rendering as you would with any other
component.

## Where to go from here

There's a lot more you can do with Gatsby and it's not always obvious how to
proceed, but you have the full power of JavaScript at your disposal. So as long
as you don't mind reading a bit of source code to figure out how something works
there's no limit to what you can implement.

Here are some ideas:

* Add previous and next buttons to each post
* Create a remark plugin to add custom block types
* Aggregate tags from your frontmatter and generate pages for all posts of a
  specific tag

Some of these—such as pagination—are implemented on my blog. You can find the
source code here:

[Source code for the blog](https://github.com/iansinnott/iansinnott.github.io/tree/gatsby-migration)

## Closing thoughts

In my opinion Gatsby provides a few killer features:

* Extensible through a powerful plugin API.
* Supports arbitrary data sources that can be easily queried using GraphQL.
* Splits your code automatically so you don't have to worry about bundle size
  increasing as a function of the number of pages you render.

It's not a perfect project (looking at you global `graphql` object) and it's
still under heavy development, so you may run in to bugs, but in my view the
pros heavily outweigh the cons. It's a best-in-class static site generator and
well worth the adoption time if you want to customize your blog.

---

If anything was unclear or you have more questions feel free to ask me on
[Twitter](https://twitter.com/ian_sinn).

[graphiql]: https://github.com/graphql/graphiql

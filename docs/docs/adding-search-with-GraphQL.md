---
title: "Adding client side search with GraphQL"
---


# Table of Contents

1. [Introduction](#Beforehand)
2. [Setup](#Setup)
3. [Adding Content](#Adding-some-content)
4. [Gatsby Config](#Gatsby-configuration)
5. [Post implementation](#Blog-post-template)
6. [Search implementation](#Search-implementation)

# Beforehand

As you're discovering how Gatsby can get data from different sources, you'll see that you have at your disposal a myriad of ways to do so, ranging from the most used ones like [Contentful](https://www.contentful.com/), [WordPress](https://wordpress.com/), [Drupal](https://www.drupal.org/), to the most edgier ones like [ButterCMS](https://buttercms.com/), [GraphCMS](https://graphcms.com/) and their appropriate plugins to ensure connectivity.

With this tutorial, it will demonstrate you could implement client side search for any of those data sources.

To keep things simple, we'll be emulating a personal blog. 

Applying this tutorial to other data sources, should be easily achieved with some slight modifications.

## Prerequisites

Before we go through the details and the code, you should be familiar with the basics of Gatsby. 

Check out the [tutorial](https://www.gatsbyjs.org/tutorial/) and brush up on the [documentation](https://www.gatsbyjs.org/docs/), more specifically the [client side search](https://www.gatsbyjs.org/docs/adding-search-with-js-search/#adding-search-with-js-search).
In addition to this some knowledge of [ES6 syntax](https://medium.freecodecamp.org/write-less-do-more-with-javascript-es6-5fd4a8e50ee2) will be useful.

## Setup

You'll start by creating a new Gatsby website based on the official _hello world starter_.

Open up a terminal and run the following command.

```bash
npx gatsby new gatsby-blog-search https://github.com/gatsbyjs/gatsby-starter-hello-world
```
After the process is complete, some additional packages are required.

Change directories to the newly created website and issue the following command:

```bash
npm install --save gatsby-source-filesystem gatsby-transformer-remark js-search
```

Or if Yarn is being used:

```bash
yarn add gatsby-source-filesystem gatsby-transformer-remark js-search
```

## Adding some content

After the installation is done.

It's time to add some content that will be searched later.

Start by creating a folder called `content` and add some folders inside with a file called `index.md` and inside each one.

Resulting in the following folder tree:

```bash
|root
   |content
       |folder1
           index.md
       |folder2
           index,md
       |folder3
           index.md
       |folder4
           index.md 
```

### Defining the file contents

Inside each `index.md` files add some _frontmatter_ and some content to be displayed.

To keep this tutorial simple, the following _frontmatter_ keys were added:

```yml
title: Hello World
author: three
```

Depending on the number of files created, replicate this to each file, with a diferent title and possibly a different author.

I'll leave the contents up to you.

Now the key thing to remember here, are the **title** and **author**, as these will be used later by the search engine.


## Gatsby configuration

Now that we have almost all the parts necessary in place, time to do some changes to the Gatsby website.

Start by modifying the `gatsby-config.js` file:

```javascript

module.exports={
    siteMetadata:{
        title:`gatsby blog search`,
    },
    plugins:[
        {
            resolve:`gatsby-source-filesystem`,
            options:{
                path:`${__dirname}/content`
            }
        },
        `gatsby-transformer-remark`
    ]
}

```

What the code block above is doing is, notifying Gatsby that we want to use some plugins:

1. `gatsby-source-filesystem`, checks the path provided in the options for content and grabs it, so that it can be manipulated using GraphQL queries.
2. `gatsby-transformer-remark`, will grab each markdown file, read the contents inside and transforms it into html.

Then we need to modify `gatsby-node.js`.

```javascript
const path= require(`path`);

const {createFilePath}= require(`gatsby-source-filesystem`);

exports.createPages = ({graphql,actions}) => {
    const {createPage}= actions
    const searchTemplate=path.resolve(`./src/templates/blog-search.js`) // search template to be used
    const blogPost= path.resolve(`./src/templates/post.js`) // blog post template to be used to display the contents
    return graphql(
        `
        {
            allMarkdownRemark{
              edges {
                node {
                  id
                  html
                  fields {
                    slug
                  }
                  frontmatter {
                    title
                    author
                  }
                }
              }
            }
          }
        `
    ).then(result=>{
        if (result.errors) {
            throw result.errors
        }
        const posts = result.data.allMarkdownRemark.edges
        
        createPage({
          path:`/`, // the path that will be used for the search
          component:searchTemplate, // the template used
          context:{
            blogPosts: result.data.allMarkdownRemark.edges.map(item=>{
              return {
                id:item.node.id,
                title:item.node.frontmatter.title,
                author:item.node.frontmatter.author,
                path:item.node.fields.slug
              }
            }), // array of data for the search template
            options:[`title`,`author`] // options that will be used by js-search to act upon while searching based on the frontmatter keys defined earlier
          }
        })
        // iterates the array resulting from the graphql query and creates a page for each item
        posts.forEach(element => {
            createPage({
                path:element.node.fields.slug, // creates the page for the blog entry post
                component:blogPost, // the template used
                context:{
                    content: element.node.html, // the post content
                    title:element.node.frontmatter.title, // title 
                    author:element.node.frontmatter.author // author (remember the keys added earlier?)
                }
            })
        });
    }) 
}

// Gatsby api call that will create a graphql node and a physical path for each post that was added
exports.onCreateNode = ({ node, actions, getNode }) => {
    const { createNodeField } = actions
  
    if (node.internal.type === `MarkdownRemark`) {
      const value = createFilePath({ node, getNode })
      createNodeField({
        name: `slug`,
        node,
        value,
      })
    }
  }
```

Breaking down the code into smaller parts:

1. A GraphQL query that will search for every markdown file created earlier, or in other words the blog posts.
2. Through the use of Gatsby's `createPage()` api a page for each blog post will be created and one extra for searching.
3. Using the `pageContext` property, the corresponding data is supplied to the pages. And also some options, these will inform `js-search` to use each item as a search parameter. 

## Review of the steps so far

Doing a quick review of what was done so far:

1. Created a new Gatsby website based on a template.
2. Added some Gatsby plugins and the js-search dependency which will index and search the blog posts.
3. Created the file and folder structure to house the contents.
4. Configured Gatsby to fetch the data and create some pages programmatically.

## Search and blog post implementation

Now time for the final two pieces to be put in place. Or in other words, the creation of the necessary templates.

### Blog post template

Start by creating a file called called `post.js` in  `scr/templates/` folder. 

And inside that file add the following contents:

```javascript
import React from 'react'
import { Link } from 'gatsby'

const BlogPost = props => {
  const { pageContext } = props
  const { title, author, content } = pageContext

  return (
    <div
      style={{
        display: 'block',
        margin: '2em auto',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>{title}</h1>
      <div style={{ margin: '2em auto', textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: content }} />
      <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{author}</p>
      <Link to="/">Go back</Link>
    </div>
  )
}
export default BlogPost

```

Nothing to complicated here, just a plain stateless React component, that will show the blog post.
 
### Search implementation

Now for the actual search. 

Create another file called `blog-search.js` in the `src/templates/` folder and add the following contents:

```javascript
import React, { Component } from 'react'
import { Link } from 'gatsby'
import * as JsSearch from 'js-search'

class BlogSearch extends Component {
  state = {
    results: [],
    search: null,
    searchQuery: ``,
  }
  componentDidMount() {
    const { pageContext } = this.props
    const { blogPosts, options } = pageContext

    const dataToSearch = new JsSearch.Search('id')

    /**
     *  defines a indexing strategy for the data
     * more more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
     */
    dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy()

    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer()

    /**
     * defines the search index
     * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
     */
    dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex('id')

    options.map(item => dataToSearch.addIndex(item))

    dataToSearch.addDocuments(blogPosts)
    this.setState({ search: dataToSearch })
  }

  searchData = e => {
    const { search } = this.state
    const queryResult = search.search(e.target.value)
    this.setState({ searchQuery: e.target.value, results: queryResult })
  }

  render() {
    const { results, searchQuery } = this.state
    const { pageContext } = this.props
    const { blogPosts } = pageContext

    const queryResults = searchQuery === '' ? blogPosts : results
    return (
      <div style={{ margin: '2em auto' }}>
        <h1 style={{ marginTop: `3em`, textAlign: `center` }}>Blog search with JS Search and Gatsby Api</h1>
        <form onSubmit={this.handleSubmit}>
          <div style={{ margin: '0 auto' }}>
            <label htmlFor="Search" style={{ paddingRight: '10px' }}>
              Enter your search here
            </label>
            <input
              id="Search"
              value={searchQuery}
              onChange={this.searchData}
              placeholder="Enter your search here"
              style={{ margin: '0 auto', width: '400px' }}
            />
          </div>
        </form>
        <div>Number of results:{queryResults.length}</div>
        <div>
          <ul>
            {queryResults.map(item => {
              return (
                <li key={`list_item${item.id}`}>
                  <Link key={`link_${item.id}`} to={item.path}>
                    {item.title}
                  </Link>
                  {` `} by {item.author}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }
}

export default BlogSearch
```

Breaking down the code into smaller parts:

1. When this component is mounted, the `componentDidMount()` lifecycle is triggered and during it's execution will create a new instance of the search engine.
2. The data at your disposal is then indexed.
3. Depending on what the user types, the previously indexed data is queried and if there are results, they will be shown. 
3. Clicking any of items will redirect to the appropriate page.


## Joining the pieces

To get it to work on your site, you would only need to copy over the `gatsby-node.js` file located [here](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-js-search-with-GraphQL/gatsby-node.js.js). 

And both template files, `post` located [here](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-js-search-with-GraphQL/src/templates/post.js) and `blog-search.js` [here](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-js-search-with-GraphQL/src/templates/blog-search.js).

Now after all of this process is complete. Issue `gatsby develop` on the terminal and open a browser window to `http://localhost:8000`.

You'll be presented with the result of this rather extensive tutorial. You'll be able to search your posts created based on the author and title.


Now go build something great.


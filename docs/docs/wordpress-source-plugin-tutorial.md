## How to create a site with data pulled from WordPress 

### What this tutorial covers:

In this tutorial, you will install the `gatsby-source-wordpress` plugin in order to pull blog and image data from a WordPress install into your Gatsby site and render that data. This [Gatsby + Wordpress demo site](https://using-wordpress.gatsbyjs.org/) shows you a sample of what you’re going to be building in this tutorial., although it’s missing the cool images you’ll be adding :D

### Why go through this tutorial? 

While each source plugin may operate differently from others, it’s worth going through this tutorial because you will almost definitely be using a source plugin in most Gatsby sites you build. This tutorial will walk you through the basics of connecting your Gatsby site to a CMS, pulling in data, and using React to render that data in beautiful ways on your site.

If you’d like to look at the growing number source plugins available to you, search for “source” in the [Gatsby plugin library](/plugins/?=source).

### Creating a site with the `gatsby-source-wordpress` plugin

Create a new Gatsby project and change directories into the new project you just created:

```shell
gatsby new wordpress-tutorial-site
cd wordpress-tutorial-site
```

Install the `gatsby-source-wordpress` plugin. For extra reading on the plugin’s features and examples of GraphQL queries not included in this tutorial, see the [`gatsby-source-wordpress` plugin’s READme file](/packages/gatsby-source-wordpress/?=wordpress).

```shell
npm install --save gatsby-source-wordpress
```

Add the `gatsby-source-wordpress` plugin to `gatsby-config.js` using the following code, which you can also find in the [demo site’s source code](https://github.com/gatsbyjs/gatsby/blob/master/examples/using-wordpress/gatsby-config.js). 

```javascript{32-58}
 module.exports = {
  siteMetadata: {
    title: 'Gatsby Wordpress Tutorial',
  },
  plugins: [
    // https://public-api.wordpress.com/wp/v2/sites/gatsbyjsexamplewordpress.wordpress.com/pages/
    /*
     * Gatsby's data processing layer begins with “source”
     * plugins. Here the site sources its data from Wordpress.
     */
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        /*
        * The base URL of the Wordpress site without the trailingslash and the protocol. This is required.
        * Example : 'gatsbyjswpexample.wordpress.com' or 'www.example-site.com'
        */
        baseUrl: `dev-gatbsyjswp.pantheonsite.io`,
        // The protocol. This can be http or https.
        protocol: `http`,
        // Indicates whether the site is hosted on wordpress.com.
        // If false, then the asumption is made that the site is self hosted.
        // If true, then the plugin will source its content on wordpress.com using the JSON REST API V2.
        // If your site is hosted on wordpress.org, then set this to false.
        hostingWPCOM: false,
        // If useACF is true, then the source plugin will try to import the Wordpress ACF Plugin contents.
        // This feature is untested for sites hosted on Wordpress.com
        useACF: true,
      },
    },
  ],
}
```

### Creating GraphQL queries that pull data from WordPress

Now you are ready to create a GraphQL query to pull in some data from the WordPress site. You will create a query that pulls in the title of the blogposts, date they were posted, and blogpost content.

Run:

```shell
gatsby develop
```

Open localhost:8000 and localhost:8000/__graphql. 

This query will pull in the blogpost content from WordPress:

```graphql
query {
  allWordpressPage {
    edges {
      node {
        id
        title
        excerpt
        slug
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
}
```


This query will pull in a sorted list of those blogposts:

```graphql
{
  allWordpressPost(sort: { fields: [date] }) {
    edges {
      node {
        title
        excerpt
        Slug
        ...PostIcons
      }
    }
  }
}
```


### Rendering the blogposts to `index.js`

Here is what your `index.js` should look like:

```jsx
import React from 'react'

export default ({ data }) => {
 console.log(data)
 return (
   <div>
     <h1>My WordPress Blog</h1>
     <h4>Posts</h4>
     {data.allWordpressPost.edges.map(({ node }) => (
       <div>
         <p>{node.title}</p>
         <p>{node.excerpt}</p>
       </div>
     ))}
   </div>
 )T
}

// Set here the ID of the home page.
export const pageQuery = graphql`
 query MyFiles {
   allWordpressPost(sort: { fields: [date] }) {
     edges {
       node {
         title
         excerpt
         slug
       }
     }
   }
 }
`
```

[Note to editors: it would be useful to insert a screenshot of the final result here]

### Create slugs for each blogpost and link to them from `index.js`
[Part 7](/tutorial/part-seven/) of the foundational tutorial goes through this process.

---
title: WordPress
---

WordPress is a very well-known and widely used Content Management System. It boasts a user friendly interface and is welcoming to new users of the platform. There is one caveat to WordPress, it isn't super quick. And that’s where Gatsby comes in.

In this guide, we'll walk through setting up a site using WordPress as a Headless CMS. This will allow you to easily port over current websites and/or setup new websites using an already familiar workflow.

## Setup
First, open up the terminal window and run the following to create a new site. This will create a new directory called `wordpress-headless-starter` that contains the starter site, but you can change the "wordpress-headless-starter" to be whatever you like

`gatsby new wordpress-headless-starter https://github.com/lukethacoder/wordpress-headless-starter`

Now move into the newly created directory

`cd wordpress-headless-starter`

Next you need to edit the configuration to point to your WordPress site, or leave it as the default to see how it works. Do this by editing the `gatsby-config.js` file and replacing the `baseUrl`.

```sh
plugins: [
  {
    resolve: 'gatsby-source-wordpress',
    options: {
      // The base url to your WP site.
      baseUrl: "your-wordpress-url-here",
      // WP.com sites set to true, WP.org set to false
      hostingWPCOM: false,
      // The protocol. This can be http or https
      protocol: 'http',
      // Use 'Advanced Custom Fields' WordPress plugin
      useACF: false,
      auth: {},
      // Set to true to debug endpoints on 'gatsby build'
      verboseOutput: false,
    },
    // additional plugins go here
  },
],
```

Then in your terminal run `gatsby develop` to start the Gatsby development server. Once the server is running, it will print the address to open for viewing. Its typically `localhost:8000`. Open that in a browser and you should see the text pulled in from your WordPress site. 

If you get errors, double check you have posts in your WordPress site and double check the `baseUrl`. Other errors may stem from the use of ACF which we will cover below.

## StaticQuery Component
GraphQL queries will be made within the new `<StaticQuery/>` component introduced in GatsbyJS v2. Example code is shown below.

```sh
import React, { Component } from 'react'
import { graphql, StaticQuery } from 'gatsby'
import Layout from '../layouts/'

class IndexPage extends Component {
  render () {
    return (
      <Layout>
        <StaticQuery
          query={graphql`
            query allIndexData {
              allWordpressPost {
                edges {
                  node {
                    title
                    excerpt
                  }
                }
              }
            } 
          `}
          render={data => (
            <div>
              <h1>Blog Posts</h1>
              <div>
                <h2>{data.allWordpressPost.edges[0].node.title}</h2>
                <p>{data.allWordpressPost.edges[0].node.excerpt}</p>
              </div>
              <div>
                <h2>{data.allWordpressPost.edges[1].node.title}</h2>
                <p>{data.allWordpressPost.edges[1].node.excerpt}</p>
              </div>
            </div>
          )}
        />
      </Layout>
    )
  }
}
```

## Advanced Custom Fields

The `gatsby-source-wordpress` plugin supports the use of ACF. Before editing anything in Gatsby you must first install the [Advanced Custom FieldsI](https://wordpress.org/plugins/advanced-custom-fields/) plugin and the [ACF to RestAPI](https://wordpress.org/plugins/acf-to-rest-api/) plugin. You may also need to install the [WP API Menus](https://wordpress.org/plugins/wp-api-menus/) plugin.

Back on your Gatsby site, in `gatsby-config.js`, you must set `useACF` to `true`. You will now be able to query acf fields as shown below. Your fields will be unique to your site.

```sh
query {
  allWordpressPost {
    edges {
      node {
        id
        acf {
          user_title
          user_custom_image
        }
      }
    }
  }
}
```
## Query Sorting and Filtering
If you wish to either sort and/or filter your posts, you can do so using the `sort` field and the `filter` field shown below.

This query sorts the blogposts by the `date` field:
```sh
query {
  allWordpressPost(sort: {fields: [date] }) {
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

This query filters the blogposts by the `title` field to get the posts matching the title of `Post Number One`:
```sh
query {
  allWordpressPost(filter: {title: {eq: "Post Number One"}}) {
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

## And that’s it
You have just setup the basic configuration for your Gatsby website, using WordPress as a Headless CMS. You can view the source code for the starter [here](https://github.com/lukethacoder/wordpress-headless-starter).

> NOTE: to future editors: it would be useful to also have examples of how to load blogposts to their own individual pages using the createPages API, as well as sample code to do so. 

---
title: Creating Dynamically-Rendered Navigation
---


## Creating dynamic navigation in Gatsby

Often at times you will want to be able to edit your websites navigation in response to a *change in requirements*. To achieve this, you can use gatsby to dynamically generate your navigation. Where you store the data for your navigation can be anywhere a backend API, CMS, headless CMS or even the filesystem.

What this doc will cover:

 - Adding data to your siteMetaData
 - Querying it using graphql
 - Pulling the data into a component using StaticQuery
 - Dynamically generating a navigation component

You will be using `gatsby-config.js` to store the data for your links. `gatsby-config.js` is a file used for configuring gatsby located in the root path of every Gatsby project. A plain old javascript object is exported from this file, this object contains `siteMetadata` object which you can query through graphql when generating your static pages. 

This guide will use the gatsby starter project `gatsby-starter-default`, this project can be downloaded through the gatsby command line interface tool using the command `gatsby new [project-name] https://github.com/gatsbyjs/gatsby-starter-default#v2`.  

### Creating the link data
First, locate the `gatsby-config.js` file in the root directory of your project. Inside the `siteMetaData` object, add an array of menu link objects. These objects should contain two properties: name and link. Name is the name of your navigation item, link is the page which will be navigated to when a menu item is clicked.
```js
module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter',
    menuLinks:[
      {name:'home',link:'/'},
      {name:'page2',link:'/page-2'}
    ]
  },
  plugins: []
}
```
### Viewing the `siteMetaData` in graphql

GraphQL can be used to query for information contained in the `siteMetadata` object located in your projects `gatsby-config.js`. In order to test this out you can start the `default-starter-project` in development mode by running `npm run develop`.

Navigate to `http://localhost:8000/___graphql` in your browser of choice to view the GraphiQL editor created by facebook that enables you to test graphql queries on the underlying API's. Using the documentation explorer you can view the current GraphQL schema for your project which is an invaluable resource during development.

Examining the available types in GraphQL you will notice that you can query `site`. This GraphQL type further returns the `siteMetadata` which needs to be accessed to create the dynamic navigation. At this point it is useful if you know a little GraphQL in order to extract the menu links. If you are unfamiliar with GraphQL, there is some excellent documentation available at (LINK) so you can brush up on your skills! The query below will achieve obtaining the menu links.
```js
query SiteQuery {
  site {
    siteMetadata {
      title
      menuLinks {
        name
        link
      }
    }
  }
}
``` 
When executing this query within the GraphiQL editor you see output that looks similar to the following:
```js
{
  "data": {
    "site": {
      "siteMetadata": {
        "title": "Gatsby Default Starter",
        "menuLinks": [
          {
            "name": "home",
            "link": "/"
          },
          {
            "name": "page2",
            "link": "/page-2"
          }
        ]
      }
    }
  }
}
```

Perfect! You now have a way of obtaining data from the `gatsby-config.js` file,  lets continue by pulling this data into the layout using the query you just formed.

### Pulling data inside the layout component
Inside your project locate the `src/components` folder and navigate to the `layout.js` file. Within this layout component you should notice a component named `StaticQuery`. 

StaticQuery is a new component introduced in Gatsby V2 and allows you to run graphql queries within your components, not just pages. It allows developers to colocate data with their components.

Currently the layout component should look like the following:
```js
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
            menuLinks {
              name
              link
            }
          }
        }
      }
    `} ...left out for brevity/>
```

Lets extend the query within this component to include the menuLinks meta data, so it looks as so: (**Note:** *The graphql query must be located within the StaticQuery component, rather than referencing a variable from elsewhere due to how Gatsby parses our projec*t).
```js
<StaticQuery query={
      graphql`
      query SiteQuery {
        site {
          siteMetadata {
            title
            menuLinks {
              name
              link
            }
          }
        }
      }
    `} 
...left out for brevity />
```
With the above changes to your `StaticQuery` component the  `render` property which accepts a function that takes one argument now has  has access to the site meta data for use inside the function (as the argument). The last thing that is left to do is to display the sites navigation.

To do this the header component that is already available in the project seems like it might be a good starting place to display the navigation. Lets pass the menuLinks to this header component as props like so:
```js
<Header menuLinks={data.site.siteMetadata.menuLinks} siteTitle={data.site.siteMetadata.title}/>
```

### Using the header component to display the navigation
Locate the `header.js` file inside `src/components` and remove everything so  just the functional component definition left (everything else is just boilerplate code given to us when generating our project):
```js
import React from 'react'
import { Link } from 'gatsby'
const Header = ({ siteTitle, menuLinks }) => {

}
```
The `siteTitle` and `menuLinks` arguments are de-structered es6 syntax for quickly accessing an objects inner properties. It is functionally equivalent to writing `obj.siteTitle` or `obj.menuLinks`.

You can now access the header components props and map the menuLinks into elements that can be rendered in the document. Like so:
```js
import React from 'react'
import { Link } from 'gatsby'
const Header = ({ siteTitle, menuLinks }) => {
	return (
		<nav>
		    {
		      menuLinks.map( link=>
			    <li key={link.name} style={{'listStyleType':'none'}}>
				    <Link to={link.link}>{link.name}</Link>
			    </li>
			 )
		    }
		</nav>
    )
}
```
If you have made it this far congratulations! You have now dynamically generated your sites navigation and can add new site links dynamically by adding entries to the `gatsby-config.js` file. Be sure to check out more documentation for more in-depth examples of how to achieve other common tasks using Gatsby.







---
title: Client Data Fetching
---

## Context

This article touches on how to fetch data at both _build time_ and _run time_. It uses the plugin [`gatsby-source-graphql`](/packages/gatsby-source-graphql/) to fetch data at [build time](/docs/glossary#build) on the server, while it uses the [`axios`](https://github.com/axios/axios) package to fetch different data on the [client-side](/docs/glossary#client-side) when the page loads.

When this article mentions [hydration](/docs/glossary#hydration), it means that Gatsby (through React.js) builds static files to render server-side. When Gatsby's script bundle downloads and executes in the browser, it preserves the HTML markup built by Gatsby and turns the site into a full React web application that can manipulate the [DOM](/docs/glossary#dom). The result of this process creates fast loading pages and a nice user experience.

Compiling pages at [build-time](/docs/glossary#build) is useful when your website content won't change often, or when triggering a build process to recompile works fine. However, some websites with more dynamic needs require a [client-side](/docs/glossary#client-side) [runtime](/docs/glossary#runtime) to handle constantly changing content after the page loads, like a chat widget or an email client web application.

## Combining build-time and client run-time data

Because a Gatsby site [hydrates](/docs/glossary#hydration) into a React app after loading statically, Gatsby is not just for static sites. You can also fetch data dynamically on the client-side as needed, like you would with any other React app.

To illustrate this, we'll walk through a small example site that uses both Gatsby's data layer at build-time and data on the client at run-time. This example is based loosely on Jason Lengstorf's [Gatsby with Apollo](https://github.com/jlengstorf/gatsby-with-apollo) example. We'll be fetching character data for Rick (of Rick and Morty) and a random pupper image.

> Note: Check out the [full example here](https://github.com/amberleyromo/gatsby-client-data-fetching), if helpful.

### 1. Create a Gatsby page component

No data yet. Just the basic React page that we'll be populating.

```jsx:title=index.js
import React, { Component } from "react"
import { graphql } from "gatsby"

class ClientFetchingExample extends Component {
  render() {
    return (
      <div style={{ textAlign: "center", width: "600px", margin: "50px auto" }}>
        <h1>Image of Rick</h1>
        <p>This will come from a build time query</p>

        <h2>Image of Rick's pupper</h2>
        <p>This will come from a request on the client</p>
      </div>
    )
  }
}

export default ClientFetchingExample
```

### 2. Query for character info at build time

To query for Rick's character info and image, we'll use the `gatsby-source-graphql` plugin. This will allow us to query the Rick and Morty API using Gatsby queries.

> Note: To learn more about using [`gatsby-source-graphql`](/packages/gatsby-source-graphql/), or about [Gatsby's GraphQL data layer](/docs/graphql/), check out their respective docs. The purpose of including it here is only for comparison.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "RMAPI",
        fieldName: "rickAndMorty",
        url: "https://rickandmortyapi-gql.now.sh/",
      },
    },
  ],
}
```

Now we can add the query to our `index.js` page:

```jsx:title=index.js
import React, { Component } from "react"
import { graphql } from "gatsby"

// highlight-start
// This query is executed at build time by Gatsby.
export const GatsbyQuery = graphql`
  {
    rickAndMorty {
      character(id: 1) {
        name
        image
      }
    }
  }
`
// highlight-end

class ClientFetchingExample extends Component {
  render() {
    // highlight-start
    const {
      rickAndMorty: { character },
    } = this.props.data
    // highlight-end

    return (
      <div style={{ textAlign: "center", width: "600px", margin: "50px auto" }}>
        // highlight-start
        <h1>{character.name} With His Pupper</h1>
        <p>Rick & Morty API data loads at build time.</p>
        <div>
          <img
            src={character.image}
            alt={character.name}
            style={{ width: 300 }}
          />
        </div>
        // highlight-end
        <h2>Image of Rick's pupper</h2>
        <p>This will come from a request on the client</p>
      </div>
    )
  }
}

export default ClientFetchingExample
```

### 3. Fetch pupper info and image data on the client

Now we'll finish out by fetching pupper info from the [Dog CEO Dog API](https://dog.ceo/dog-api/). (We'll fetch a random pupper. Rick isn't picky.)

```jsx:title=index.js
import React, { Component } from "react"
import { graphql } from "gatsby"
import axios from "axios" // highlight-line

// This query is executed at build time by Gatsby.
export const GatsbyQuery = graphql`
  {
    rickAndMorty {
      character(id: 1) {
        name
        image
      }
    }
  }
`

class ClientFetchingExample extends Component {
  // highlight-start
  state = {
    loading: false,
    error: false,
    pupper: {
      img: "",
      breed: "",
    },
  }
  // highlight-end

  // highlight-start
  componentDidMount() {
    this.fetchRicksPupper()
  }
  // highlight-end

  render() {
    const {
      rickAndMorty: { character },
    } = this.props.data

    const { img, breed } = this.state.pupper // highlight-line

    return (
      <div style={{ textAlign: "center", width: "600px", margin: "50px auto" }}>
        <h1>{character.name} With His Pupper</h1>
        <p>Rick & Morty API data loads at build time.</p>
        <p>Dog API data loads at run time.</p> // highlight-line
        <div>
          <img
            src={character.image}
            alt={character.name}
            style={{ width: 300 }}
          />
        </div>
         {/* highlight-start */}
        <div>
          {this.state.loading ? (
            <p>Please hold, pupper incoming!</p>
          ) : img && breed ? (
            <>
              <h2>{`${breed} pupper!`}</h2>
              <img src={img} alt={`cute random `} style={{ maxWidth: 300 }} />
            </>
          ) : (
            <p>Oh noes, error fetching pupper :(</p>
          )}
        </div>
       </div> {/* highlight-end */}
    )
  }

  // This data is fetched at run time on the client. // highlight-start
  fetchRicksPupper = () => {
    this.setState({ loading: true })

    axios
      .get(`https://dog.ceo/api/breeds/image/random`)
      .then(pupper => {
        const {
          data: { message: img },
        } = pupper
        const breed = img.split("/")[4]

        this.setState({
          loading: false,
          pupper: {
            ...this.state.pupper,
            img,
            breed,
          },
        })
      })
      .catch(error => {
        this.setState({ loading: false, error })
      })
  }
} // highlight-end

export default ClientFetchingExample
```

That's it -- an example of querying for data at build time using the Gatsby GraphQL data layer and dynamically requesting data on the client at run time.

## Other resources

You may be interested to check out other projects (both used in production and proof of concepts) that illustrate this usage:

- [Gatsby store](https://github.com/gatsbyjs/store.gatsbyjs.org)
- [Gatsby mail](https://github.com/DSchau/gatsby-mail)

---
title: Testing components with GraphQL
---

If you try to run unit tests on components that use GraphQL queries, you will
discover that you have no data. Jest can't run your queries, so if you are
testing components that rely on GraphQL data, you will need to provide the data
yourself. This is a good thing, as otherwise your tests could break if your data
changes, and in the case of remote data sources it would need network access to
run tests.

In general it is best practice to test the smallest components possible, so the
simplest thing to do is to test the individual page components with mock data,
rather than trying to test a full page. However, if you do want to test the full
page you'll need to provide the equivalent data to the component. Luckily
there's a simple way to get the data you need.

First you should make sure you have read
[the unit testing guide](/docs/unit-testing/) and set up your project as
described. This guide is based on the same blog starter project. You will be
writing a simple snapshot test for the index page.

As Jest doesn't run or compile away your GraphQL queries you need to mock the
`graphql` function to stop it throwing an error. If you set your project up with
a mock for `gatsby` as described in the unit testing guide then this is already
done.

## Testing page queries

As this is testing a page component you will need to put your tests in another
folder so that Gatsby doesn't try to turn the tests into pages.

```js:title=src/__tests__/index.js
import React from "react"
import renderer from "react-test-renderer"
import BlogIndex from "../pages/index"

describe("BlogIndex", () =>
  it("renders correctly", () => {
    const tree = renderer.create(<BlogIndex />).toJSON()
    expect(tree).toMatchSnapshot()
  }))
```

If you run this test you will get an error, as the component is expecting a
location object. You can fix this by passing one in:

```js:title=src/__tests__/index.js
import React from "react"
import renderer from "react-test-renderer"
import BlogIndex from "../pages/index"

describe("BlogIndex", () =>
  it("renders correctly", () => {
    const location = {
      pathname: "",
    }

    const tree = renderer.create(<BlogIndex location={location} />).toJSON()
    expect(tree).toMatchSnapshot()
  }))
```

This should fix the `location` error, but now you will have an error because
there is no GraphQL data being passed to the component. We can pass this in too,
but the structure is a little more complicated. Luckily there's an easy way to
get some suitable data. Run `gatsby develop` and go to
http://localhost:8000/___graphql to load the GraphiQL IDE. You can now get the
right data using the same query that you used on the page. If it is a simple
query with no fragments you can copy it directly. That is the case here, run
this query copied from the index page:

```graphql
query IndexQuery {
  site {
    siteMetadata {
      title
    }
  }
  allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
    edges {
      node {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "DD MMMM, YYYY")
          title
        }
      }
    }
  }
}
```

The output panel should now give you a nice JSON object with the query result.
Here it is, trimmed to one node for brevity:

```json
{
  "data": {
    "site": {
      "siteMetadata": {
        "title": "Gatsby Starter Blog"
      }
    },
    "allMarkdownRemark": {
      "edges": [
        {
          "node": {
            "excerpt": "Far far away, behind the word mountains, far from the countries Vokalia and\nConsonantia, there live the blind texts. Separated they live in…",
            "fields": {
              "slug": "/hi-folks/"
            },
            "frontmatter": {
              "date": "28 May, 2015",
              "title": "New Beginnings"
            }
          }
        }
      ]
    }
  }
}
```

GraphiQL doesn't know about any fragments defined by Gatsby, so if your query
uses them then you'll need to replace those with the content of the fragment. If
you're using `gatsby-transformer-sharp` you'll find the fragments in
[gatsby-transformer-sharp/src/fragments.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sharp/src/fragments.js).
So, for example if your query includes:

```graphql
    image {
        childImageSharp {
            fluid(maxWidth: 1024) {
                ...GatsbyImageSharpFluid
            }
        }
    }
```

...it becomes:

```graphql
    image {
        childImageSharp {
            fluid(maxWidth: 1024) {
                base64
                aspectRatio
                src
                srcSet
                sizes
            }
        }
    }
```

When you have the result, copy the `data` value from the output panel. Good
practice is to store your fixtures in a separate file, but for simplicity here
you will be defining it directly inside your test file:

```js:title=src/__tests__/index.js
import React from "react"
import renderer from "react-test-renderer"
import BlogIndex from "../pages/index"

describe("BlogIndex", () =>
  it("renders correctly", () => {
    const location = {
      pathname: "",
    }

    const data = {
      site: {
        siteMetadata: {
          title: "Gatsby Starter Blog",
        },
      },
      allMarkdownRemark: {
        edges: [
          {
            node: {
              excerpt:
                "Far far away, behind the word mountains, far from the countries Vokalia and\nConsonantia, there live the blind texts. Separated they live in…",
              fields: {
                slug: "/hi-folks/",
              },
              frontmatter: {
                date: "28 May, 2015",
                title: "New Beginnings",
              },
            },
          },
        ],
      },
    }

    const tree = renderer
      .create(<BlogIndex location={location} data={data} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  }))
```

Run the tests and they should now pass. Take a look in `__snapshots__` to see
the output.

## Testing StaticQuery

The method above works for page queries, as you can pass the data in directly to
the component. This doesn't work for components that use `StaticQuery` though,
as that uses `context` rather than `props` so we need to take a slightly
different approach to testing these. The blog starter project doesn't include
`StaticQuery`, so the example here is from
[the StaticQuery docs](/docs/static-query/).

Using `StaticQuery` allows you to make queries in any component, not just pages.
This gives a lot of flexibility, and avoid having to pass the props down to
deeply-nested components. The pattern for enabling type checking described in
the docs is a good starting point for making these components testable, as it
separates the query from the definition of the component itself. However that
example doesn't export the inner, pure component, which is what you'll need to
test.

Here is the example of a header component that queries the page data itself,
rather than needing it to be passed from the layout:

```jsx:title=src/components/Header.js
import React from "react"
import { StaticQuery } from "gatsby"

const Header = ({ data }) => (
  <header>
    <h1>{data.site.siteMetadata.title}</h1>
  </header>
)

export default props => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => <Header {...props} data={data} />}
  />
)
```

This is almost ready: all you need to do is export the pure component that you
are passing to StaticQuery. Rename it first to avoid confusion:

```jsx:title=src/components/Header.js
import React from "react"
import { StaticQuery, graphql } from "gatsby"

export const PureHeader = ({ data }) => (
  <header>
    <h1>{data.site.siteMetadata.title}</h1>
  </header>
)

export const Header = props => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => <PureHeader {...props} data={data} />}
  />
)

export default Header
```

Now you have two components exported from the file: the component that includes
the StaticQuery data which is still the default export, and another component
that you can test. This means you can test the component independently of the
GraphQL.

This is a good example of the benefits of keeping components "pure", meaning
they always generate the same output if given the same inputs and have no
side-effects apart from their return value. This means we can be sure the tests
are always reproducible and don't fail if, for example, the network is down or
the data source changes. In this example, `Header` is impure as it makes a
query, so the output depends on something apart from its props. `PureHeader` is
pure because its return value is entirely dependent on the props passed to it.
This means it's very easy to test, and a snapshot should never change.

Here's how:

```js:title=src/components/Header.test.js
import React from "react"
import renderer from "react-test-renderer"
import { PureHeader as Header } from "./Header"

describe("Header", () =>
  it("renders correctly", () => {
    // Created using the query from Header.js
    const data = {
      site: {
        siteMetadata: {
          title: "Gatsby Starter Blog",
        },
      },
    }
    const tree = renderer.create(<Header data={data} />).toJSON()
    expect(tree).toMatchSnapshot()
  }))
```

## Using TypeScript

If you are using TypeScript this is a lot easier to get right as the type errors
will tell you exactly what you should be passing to the components. This is why
it is a good idea to define type interfaces for all of your GraphQL queries.

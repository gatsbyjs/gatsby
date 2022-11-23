---
title: Testing Components with GraphQL
---

If you try to run unit tests on components that use GraphQL queries, you will discover that you have no data. Jest can't run your queries, so if you are testing components that rely on GraphQL data, you will need to provide the data yourself. This is a good thing, as otherwise your tests could break if your data changes, and in the case of remote data sources it would need network access to run tests.

In general it is best practice to test the smallest components possible, so the simplest thing to do is to test the individual page components with mock data, rather than trying to test a full page. However, if you do want to test the full page you'll need to provide the equivalent data to the component. Luckily there's a way to get the data you need.

First you should make sure you have read [the unit testing guide](/docs/how-to/testing/unit-testing/) and set up your project as described. This guide is based on the same blog starter project. You will be writing a snapshot test for the index page.

As Jest doesn't run or compile away your GraphQL queries you need to mock the `graphql` function to stop it throwing an error. If you set your project up with a mock for `gatsby` as described in the unit testing guide then this is already done.

## Testing page queries

As this is testing a page component you will need to put your tests in another folder so that Gatsby doesn't try to turn the tests into pages.

```js:title=src/pages/__tests__/index.js
import React from "react"
import renderer from "react-test-renderer"
import PageTwo from "../page-2"

describe("PageTwo", () => {
  it("renders correctly", () => {
    const tree = renderer.create(<PageTwo />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
```

If you run this test you will get an error, as the `data` prop is not mocked.

In this case, there is no GraphQL data being passed to the component. You can pass this in too, but the structure is a little more complicated. Luckily there's a way to get some suitable data. Run `npm run develop` and go to `http://localhost:8000/___graphql` to load the GraphiQL IDE. You can now get the right data using the same query that you used on the page. If it is a simple query with no fragments you can copy it directly. That is the case here, run this query copied from the index page:

```graphql
query IndexQuery {
  site {
    siteMetadata {
      author
    }
  }
}
```

The output panel should now give you a nice JSON object with the query result. Here it is, trimmed to one node for brevity:

```json
{
  "data": {
    "site": {
      "siteMetadata": {
        "author": "Your name"
      }
    }
  }
}
```

GraphiQL doesn't know about any [fragments defined by Gatsby](/docs/reference/graphql-data-layer/using-graphql-fragments/), so if your query uses them then you'll need to replace those with the content of the fragment.

When you have the result, copy the `data` value from the output panel. Good practice is to store your fixtures in a separate file, but for simplicity here you will be defining it directly inside your test file:

```js:title=src/pages/__tests__/index.js
import React from "react"
import renderer from "react-test-renderer"
import PageTwo from "../page-2"

describe("PageTwo", () => {
  it("renders correctly", () => {
    const data = {
      site: {
        siteMetadata: {
          author: "Your name",
        },
      },
    }

    // highlight-next-line
    const tree = renderer.create(<PageTwo data={data} />).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
```

Run the tests and they should now pass. Take a look in `__snapshots__` to see the output.

## Testing useStaticQuery

The method above works for page queries, as you can pass the data in directly to the component. This doesn't work for components that use `useStaticQuery` though, as that uses [React Context](https://reactjs.org/docs/context.html) rather than `props` so you need to take a slightly different approach to testing these types of components.

Using `useStaticQuery` allows you to make queries in any component, not just pages. This gives a lot of flexibility, and avoid having to pass the props down to deeply-nested components. The pattern for enabling type checking described in the docs is a good starting point for making these components testable, as it separates the query from the definition of the component itself. However that example doesn't export the inner, pure component, which is what you'll need to test.

Here is the example of a layout component that queries the page data itself:

```jsx:title=src/components/layout.jsx
import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <h1>{data.site.siteMetadata.title}</h1>
      <div>
        {children}
      </div>
    </>
  )
}

export default Layout
```

You'll need to mock the `useStaticQuery` call to test the component:

```js:title=src/components/__tests__/layout.js
import * as React from "react"
import renderer from "react-test-renderer"
import * as Gatsby from "gatsby"

// highlight-next-line
const useStaticQuery = jest.spyOn(Gatsby, `useStaticQuery`)
const mockUseStaticQuery = {
  site: {
    siteMetadata: {
      title: `Gatsby Default Starter`
    }
  }
}

import Layout from "../layout"

describe(`Layout`, () => {
  beforeEach(() => {
    // highlight-next-line
    useStaticQuery.mockImplementation(() => mockUseStaticQuery)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it(`renders correctly`, () => {
    const tree = renderer.create(<Layout>Hello World</Layout>).toJSON()
    expect(tree).toMatchSnapshot()
  })
})
```

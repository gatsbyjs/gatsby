---
title: Adding Search with Algolia
---

Once you've added some content to your site, you'll want to make it easy for your visitors to find what they're looking for. This guide will run you through the process of setting up a custom search experience powered by [Algolia](https://www.algolia.com) on any Gatsby site. You'll be writing functional components that rely on React Hooks so following this guide requires you to be using [React 16.8](https://reactjs.org/blog/2019/02/06/react-v16.8.0) or higher.

Two things before you begin:

1. Beyond this guide, you may also want to checkout Algolia's extensive [docs on how to get started in React](https://www.algolia.com/doc/guides/building-search-ui/getting-started/react).
2. If you're looking to add search to a documentation site, you can let Algolia handle most of the steps outlined below by using their [Docsearch](https://community.algolia.com/docsearch) functionality. For other types of sites and more fine-grained control over exactly what data should be indexed, read on.

## Why Use Algolia?

Algolia is a site search hosting platform that hosts page index information for you, and then returns the results to wherever you have the site search located on your site. You tell Algolia what pages you have, where they are, and how to navigate to them, and Algolia returns those results to the user based on whatever search terms they use.

To implement Algolia search on your Gatsby site, you'll need to install the plugin, tell it what information to query, provide your Algolia credentials, and a few other configuration steps. This means that after the queries have run when you `gatsby build`, Algolia will have the entire index of your site available and can serve results to users very quickly. To learn more about the benefits of using Algolia, [check out this blog post from Netlify, who recently switched their site search to Algolia](https://www.netlify.com/blog/2017/10/10/replacing-our-search-with-algolia/).

## Configuring the Algolia plugin

First, you'll need to add [`gatsby-plugin-algolia`](https://github.com/algolia/gatsby-plugin-algolia) and [`react-instantsearch-dom`](https://github.com/algolia/react-instantsearch) to your project. `react-instantsearch` is Algolia's library containing off-the-shelf React components which you can import to save yourself a lot of work. You'll also be using `dotenv` which gets shipped with Gatsby by default. You're going to need it to specify your Algolia app ID and both the search and admin API keys without committing them to version control.

```shell
npm install --save gatsby-plugin-algolia react-instantsearch-dom algoliasearch dotenv
```

You will be using `styled-components` to design the search UI in this guide but you can use whichever CSS solution you prefer. If you'd like to start using `styled-components` as well, you also need to install

```shell
npm install --save styled-components gatsby-plugin-styled-components
```

Next, add `gatsby-plugin-algolia` and `gatsby-plugin-styled-components` to your `gatsby-config.js`.

```js:title=gatsby-config.js
const queries = require("./src/utils/algolia")

require("dotenv").config()

module.exports = {
  siteMetadata: {
    title: `Gatsby+Algolia`,
    description: `How to setup Algolia search in Gatsby`,
    author: `<your name>`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-algolia`,
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_ADMIN_KEY,
        queries,
        chunkSize: 10000, // default: 1000
      },
    },
    `gatsby-plugin-styled-components`,
  ],
}
```

Notice that you're loading `queries` from a file at `./src/utils/algolia.js` (you can of course put it wherever you like) and your Algolia ID and API key from `.env` so add those files.

For this, you will need to navigate to [the 'API Keys' section of your Algolia profile](https://www.algolia.com/api-keys). If you already have an account, you will find your API keys here. If not, you will need to sign up for one and then navigate to this link. It should look something like this screenshot, only with actual numbers instead of redacted ones:

![algolia api key screenshot](./images/algolia-api-keys.png)

Once you have your App ID, Search-Only API Key, and Admin API Key, place the following code into your `.env` file, replacing the placeholder keys with your keys:

```text:title=.env
GATSBY_ALGOLIA_APP_ID=KA4OJA9KAS
GATSBY_ALGOLIA_SEARCH_KEY=lkjas987ef923ohli9asj213k12n59ad
ALGOLIA_ADMIN_KEY=lksa09sadkj1230asd09dfvj12309ajl
```

The placeholder keys in the previous code snippet are random character sequences but the ones you copy from your Algolia profile should be the same length. One of the benefits of using this method of querying your API keys is that they all get stored in one file, on the server, and are therefore never exposed to the client-side, which increases security.

Since your .env file contains your real private API keys, it is considered a security risk to commit your actual `.env` file. It's good practice to commit a `.env.example` to git or other version control so that if someone forks your repo, they know which environment variables they need to supply, without committing your private keys.

```text:title=.env.example
# rename this file to .env and supply the values listed below
# also make sure they are available to the build tool (e.g. Netlify)
# warning: variables prefixed with GATSBY_ will be made available to client-side code
# be careful not to expose sensitive data (in this case your Algolia admin key)

GATSBY_ALGOLIA_APP_ID=insertValue
GATSBY_ALGOLIA_SEARCH_KEY=insertValue
ALGOLIA_ADMIN_KEY=insertValue
```

The `queries` allow you to grab the data you want Algolia to index directly from Gatsby's GraphQL layer by exporting from `src/utils/algolia.js` an array of objects, each containing a required GraphQL query and an optional index name, transformer function and settings object.

```js:title=src/utils/algolia.js
const pageQuery = `{
  pages: allMarkdownRemark(
    filter: {
      fileAbsolutePath: { regex: "/pages/" },
      frontmatter: {purpose: {eq: "page"}}
    }
  ) {
    edges {
      node {
        objectID: id
        frontmatter {
          title
          slug
        }
        excerpt(pruneLength: 5000)
      }
    }
  }
}`

const postQuery = `{
  posts: allMarkdownRemark(
    filter: { fileAbsolutePath: { regex: "/posts/" } }
  ) {
    edges {
      node {
        objectID: id
        frontmatter {
          title
          slug
          date(formatString: "MMM D, YYYY")
          tags
        }
        excerpt(pruneLength: 5000)
      }
    }
  }
}`

const flatten = arr =>
  arr.map(({ node: { frontmatter, ...rest } }) => ({
    ...frontmatter,
    ...rest,
  }))
const settings = { attributesToSnippet: [`excerpt:20`] }

const queries = [
  {
    query: pageQuery,
    transformer: ({ data }) => flatten(data.pages.edges),
    indexName: `Pages`,
    settings,
  },
  {
    query: postQuery,
    transformer: ({ data }) => flatten(data.posts.edges),
    indexName: `Posts`,
    settings,
  },
]

module.exports = queries
```

It might look a little intimidating at first, but basically you're just letting `gatsby-plugin-algolia` know how to acquire the data with which to populate your indices on their servers. The example above uses separate queries passing data to separate indices for pages and blog posts.

Transformers allow you to modify the data returned by the queries to bring it into a format ready for searching. All you're doing here is 'flattening' posts and pages to 'unnest' the frontmatter fields (such as `author`, `date`, `tags`) but transformers could do much more for you if required. This makes the whole process of indexing your data really flexible and powerful. You could for instance use them to filter the results of your queries, format fields, add or merge them, etc.

If you've come this far, then the "backend" is done. You should now be able to run `gatsby build` and see your indices in Algolia's web interface be flooded with your data.

## Adding a search interface to your site

Next, build a user-facing search interface for your site. It needs a way for the user to enter a search string, send that string to Algolia, receive matching results (_hits_ in Algolia speak) from your indices and finally display those to the user.

You're going to assemble everything you need into a React `Search` component that you call from anywhere on your site where you want the user to be able to search. Even though design varies strongly from site to site, you'll note the styles implemented with [`styled-components`](https://styled-components.com) in this guide since working out the CSS transitions to have the search field slide out as the user clicks on it and the results pane to appear once Algolia returns matches took some time.

The `Search` components is made up of the following files:

- **`index.js`**: the main component
- **`input.js`**: the text input field
- **`hitComps.js`**: the components that will render matching posts/pages
- **`styles.js`**: the styled components

There's quite a lot happening in these files so break them down one by one and piece by piece.

### `index.js`

```js:title=src/components/search/index.js
import React, { useState, useEffect, createRef } from "react"
import {
  InstantSearch,
  Index,
  Hits,
  connectStateResults,
} from "react-instantsearch-dom"
import algoliasearch from "algoliasearch/lite"

import { Root, HitsWrapper, PoweredBy } from "./styles"
import Input from "./Input"
import * as hitComps from "./hitComps"

const Results = connectStateResults(
  ({ searchState: state, searchResults: res, children }) =>
    res && res.nbHits > 0 ? children : `No results for '${state.query}'`
)

const Stats = connectStateResults(
  ({ searchResults: res }) =>
    res && res.nbHits > 0 && `${res.nbHits} result${res.nbHits > 1 ? `s` : ``}`
)

const useClickOutside = (ref, handler, events) => {
  if (!events) events = [`mousedown`, `touchstart`]
  const detectClickOutside = event =>
    !ref.current.contains(event.target) && handler()
  useEffect(() => {
    for (const event of events)
      document.addEventListener(event, detectClickOutside)
    return () => {
      for (const event of events)
        document.removeEventListener(event, detectClickOutside)
    }
  })
}

export default function Search({ indices, collapse, hitsAsGrid }) {
  const ref = createRef()
  const [query, setQuery] = useState(``)
  const [focus, setFocus] = useState(false)
  const searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY
  )
  useClickOutside(ref, () => setFocus(false))
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indices[0].name}
      onSearchStateChange={({ query }) => setQuery(query)}
      root={{ Root, props: { ref } }}
    >
      <Input onFocus={() => setFocus(true)} {...{ collapse, focus }} />
      <HitsWrapper show={query.length > 0 && focus} asGrid={hitsAsGrid}>
        {indices.map(({ name, title, hitComp }) => (
          <Index key={name} indexName={name}>
            <header>
              <h3>{title}</h3>
              <Stats />
            </header>
            <Results>
              <Hits hitComponent={hitComps[hitComp](() => setFocus(false))} />
            </Results>
          </Index>
        ))}
        <PoweredBy />
      </HitsWrapper>
    </InstantSearch>
  )
}
```

At the top, you import `InstantSearch` from [`react-instantsearch-dom`](https://community.algolia.com/react-instantsearch) which is the root component that allows your whole search experience to connect to Algolia's service. As the name suggests, `Index` allows you to tap into an individual index and `Hits` provides you with the data returned for a user's search input. Finally [`connectStateResults`](https://community.algolia.com/react-instantsearch/connectors/connectStateResults.html) wraps around custom React components and provides them with high-level stats about the current search state such as the query, the number of results and how long it took to fetch them.

You then import the styled components that make up the UI and the `Input` component into which the user enters the query.

```js:title=src/components/search/index.js
import { Root, SearchBox, HitsWrapper, PoweredBy } from "./styles"
import Input from "./Input"
```

`PoweredBy` renders the string "Powered by Algolia" with a small logo and link. If you're using Algolia's generous free tier, they ask you to acknowledge them in this way below the search results. `react-instantsearch-dom` also provides a [`PoweredBy` component](https://community.algolia.com/react-instantsearch/widgets/PoweredBy.html) specifically for this purpose, but you can build your own. You'll get back to these styled components once you're done with `index.js`.

The last thing you need for the `Search` component to work are hit components for every type of result you want to display to the user. The hit component determines how attributes of matching results (such as author, date, tags and title in the case of a blog post) are displayed to the user.

```js:title=src/components/search/index.js
import * as hitComps from "./hitComps"
```

Next you define two connected components. `Results` informs the user that no matches could be found for a query unless the number of hits is positive, i.e. `searchResults.nbHits > 0`. `Stats` just displays `searchResults.nbHits`.

```js:title=src/components/search/index.js
const Results = connectStateResults(
  ({ searchState: state, searchResults: res, children }) =>
    res && res.nbHits > 0 ? children : `No results for ${state.query}`
)

const Stats = connectStateResults(
  ({ searchResults: res }) =>
    res && res.nbHits > 0 && `${res.nbHits} result${res.nbHits > 1 ? `s` : ``}`
)
```

Now comes the actual `Search` component. It starts off with some state initialization, defining handler functions and event listeners to trigger them. All they do is make the search input slide out when the user clicks a search icon and disappear again when the user clicks or touches (on mobile) anywhere.

```js:title=src/components/search/index.js
export default function Search({ indices, collapse, hitsAsGrid }) {
  const ref = createRef()
  const [query, setQuery] = useState(``)
  const [focus, setFocus] = useState(false)
  const searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY
  )

  const handleClickOutside = event =>
    !ref.current.contains(event.target) && setFocus(false)

  useEffect(() => {
    [`mousedown`, `touchstart`].forEach(event =>
      document.addEventListener(event, handleClickOutside)
    )
    return () =>
      [`mousedown`, `touchstart`].forEach(event =>
        document.removeEventListener(event, handleClickOutside)
      )
  })
```

`Search` returns JSX that renders a dynamic array of `indices` passed as a prop. Each array item should be an object with keys `name`, `title`, `hitComp` that specifies the name of the index in your Algolia account to be queried, the title to display above the results shown to the user and the component `hitComp` that renders the data returned for each match.

```js:title=src/components/search/index.js
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indices[0].name}
      onSearchStateChange={({ query }) => setQuery(query)}
      root={{ Root, props: { ref } }}
    >
      <Input onFocus={() => setFocus(true)} {...{ collapse, focus }} />
      <HitsWrapper show={query.length > 0 && focus} asGrid={hitsAsGrid}>
        {indices.map(({ name, title, hitComp }) => (
          <Index key={name} indexName={name}>
            <header>
              <h3>{title}</h3>
              <Stats />
            </header>
            <Results>
              <Hits hitComponent={hitComps[hitComp](() => setFocus(false))} />
            </Results>
          </Index>
        ))}
        <PoweredBy />
      </HitsWrapper>
    </InstantSearch>
  )
}
```

Passing this `indices` array as a prop allows you to reuse the same `Search` component in different parts of your site and have each of them query different indices. As an example, besides a primary search box in the header used for finding pages and/or posts, your site might have a wiki and you want to offer your visitors a second search box that displays only wiki articles.

Note that you fed `algoliasearch` with the same app ID you specified in our `.env` file and used in `src/utils/algolia.js` as well as with your search-only API key to generate a search client which connects to your backend. _Don't paste in your Algolia admin API key here!_ `algoliasearch` only needs to _read_ your indices. Pasting your admin key here would allow others to obtain it once your site is deployed. They could then start messing with your indexed data on Algolia.

### `input.js`

```js:title=src/components/search/input.js
import React from "react"
import { connectSearchBox } from "react-instantsearch-dom"

import { SearchIcon, Form, Input } from "./styles"

export default connectSearchBox(({ refine, ...rest }) => (
  <Form>
    <Input
      type="text"
      placeholder="Search"
      aria-label="Search"
      onChange={e => refine(e.target.value)}
      {...rest}
    />
    <SearchIcon />
  </Form>
))
```

The `Input` component is where the user enters the search string. It is quite short since the grunt work is done by Algolia's [`connectSearchBox`](https://community.algolia.com/react-instantsearch/connectors/connectSearchBox.html) function.

Now look at the styled components `SearchIcon`, `Form`, `Input` as well as the ones imported in `index.js`.

### `styles.js`

```js:title=src/components/search/styles.js
import React from "react"
import styled, { css } from "styled-components"
import { Search } from "styled-icons/fa-solid/Search"
import { Algolia } from "styled-icons/fa-brands/Algolia"

export const Root = styled.div`
  position: relative;
  display: grid;
  grid-gap: 1em;
`

export const SearchIcon = styled(Search)`
  width: 1em;
  pointer-events: none;
`

const focus = css`
  background: white;
  color: ${props => props.theme.darkBlue};
  cursor: text;
  width: 5em;
  + ${SearchIcon} {
    color: ${props => props.theme.darkBlue};
    margin: 0.3em;
  }
`

const collapse = css`
  width: 0;
  cursor: pointer;
  color: ${props => props.theme.lightBlue};
  + ${SearchIcon} {
    color: white;
  }
  ${props => props.focus && focus}
  margin-left: ${props => (props.focus ? `-1.6em` : `-1em`)};
  padding-left: ${props => (props.focus ? `1.6em` : `1em`)};
  ::placeholder {
    color: ${props => props.theme.gray};
  }
`

const expand = css`
  background: ${props => props.theme.veryLightGray};
  width: 6em;
  margin-left: -1.6em;
  padding-left: 1.6em;
  + ${SearchIcon} {
    margin: 0.3em;
  }
`

export const Input = styled.input`
  outline: none;
  border: none;
  font-size: 1em;
  background: transparent;
  transition: ${props => props.theme.shortTrans};
  border-radius: ${props => props.theme.smallBorderRadius};
  {highlight-next-line}
  ${props => (props.collapse ? collapse : expand)};
`

export const Form = styled.form`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
`

export const HitsWrapper = styled.div`
  display: ${props => (props.show ? `grid` : `none`)};
  max-height: 80vh;
  overflow: scroll;
  z-index: 2;
  -webkit-overflow-scrolling: touch;
  position: absolute;
  right: 0;
  top: calc(100% + 0.5em);
  width: 80vw;
  max-width: 30em;
  box-shadow: 0 0 5px 0;
  padding: 0.7em 1em 0.4em;
  background: white;
  border-radius: ${props => props.theme.smallBorderRadius};
  > * + * {
    padding-top: 1em !important;
    border-top: 2px solid ${props => props.theme.darkGray};
  }
  li + li {
    margin-top: 0.7em;
    padding-top: 0.7em;
    border-top: 1px solid ${props => props.theme.lightGray};
  }
  * {
    margin-top: 0;
    padding: 0;
  }
  ul {
    list-style: none;
  }
  mark {
    color: ${props => props.theme.lightBlue};
    background: ${props => props.theme.darkBlue};
  }
  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.3em;
    h3 {
      color: white;
      background: ${props => props.theme.gray};
      padding: 0.1em 0.4em;
      border-radius: ${props => props.theme.smallBorderRadius};
    }
  }
  h3 {
    margin: 0 0 0.5em;
  }
  h4 {
    margin-bottom: 0.3em;
  }
`

export const PoweredBy = () => (
  <span css="font-size: 0.6em; text-align: end; padding: 0;">
    Powered by{` `}
    <a href="https://algolia.com">
      <Algolia size="1em" /> Algolia
    </a>
  </span>
)
```

Styles will of course be different from one site to the next so these components are listed here for completeness and because they implement the dynamic behavior of the search interface, i.e. that the input field only slides out once the user clicks the `SearchIcon` (a magnifier) and that the pane displaying search (`HitsWrapper`) results only appears once Algolia's server returned matches, both of you which you might want to keep.

Now you're almost done, two small steps remain. First you need to put together a hit component for every type of result you want to display. In this example, these are blog posts and pages. And second, you need to call your `Search` component somewhere on your site. Here are the hit components.

### `hitComps.js`

```js:title=src/components/search/hitComps.js
import React, { Fragment } from "react"
import { Highlight, Snippet } from "react-instantsearch-dom"
import { Link } from "gatsby"
import { Calendar } from "styled-icons/octicons/Calendar"
import { Tags } from "styled-icons/fa-solid/Tags"

export const PageHit = clickHandler => ({ hit }) => (
  <div>
    <Link to={hit.slug} onClick={clickHandler}>
      <h4>
        <Highlight attribute="title" hit={hit} tagName="mark" />
      </h4>
    </Link>
    <Snippet attribute="excerpt" hit={hit} tagName="mark" />
  </div>
)

export const PostHit = clickHandler => ({ hit }) => (
  <div>
    <Link to={`/blog` + hit.slug} onClick={clickHandler}>
      <h4>
        <Highlight attribute="title" hit={hit} tagName="mark" />
      </h4>
    </Link>
    <div>
      <Calendar size="1em" />
      &nbsp;
      <Highlight attribute="date" hit={hit} tagName="mark" />
      &emsp;
      <Tags size="1em" />
      &nbsp;
      {hit.tags.map((tag, index) => (
        <Fragment key={tag}>
          {index > 0 && `, `}
          {tag}
        </Fragment>
      ))}
    </div>
    <Snippet attribute="excerpt" hit={hit} tagName="mark" />
  </div>
)
```

`Highlight` and `Snippet` imported from `react-instantsearch-dom` both display attributes of matching search results to the user. Their distinction is that the former renders it in full (e.g. a title, date or list of tags) whereas the latter only shows a snippet, i.e. a text passage of given length surrounding the matching string (e.g. for body texts). In each case the `attribute` prop should be the name of the property as it was assigned in `src/utils/algolia.js` and as it appears in your Aloglia indices.

## Usage

Now all you need to do is import `Search` somewhere. The obvious place is the `Header` component so add it there.

```js:title=src/components/Header/index.js
import React from "react"

import { Container, Logo } from "./styles"
import Nav from "../Nav"
import Search from "../Search"

const searchIndices = [
  { name: `Pages`, title: `Pages`, hitComp: `PageHit` },
  { name: `Posts`, title: `Blog Posts`, hitComp: `PostHit` },
]

const Header = ({ site, transparent }) => (
  <Container transparent={transparent}>
    <Logo to="/" title={site.title} rel="home" />
    <Nav />
    <Search collapse indices={searchIndices} />
  </Container>
)

export default Header
```

Note that this is where you define your array of search indices and pass it as a prop to `Search`.

If everything works as expected, running `gatsby develop` should now give you some instant search magic looking something like in the video below! You can also play around with it [here](https://janosh.io/blog).

https://youtu.be/Amsub4xJ3Jc

## Additional Resources

If you have any issues or if you want to learn more about using Algolia for search, check out this tutorial from Jason Lengstorf:

https://youtu.be/VSkXyuXzwlc

You can also find stories of companies using Gatsby + Algolia together [in the Algolia section of the blog](/blog/tags/algolia).

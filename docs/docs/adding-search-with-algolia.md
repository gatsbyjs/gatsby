---
title: Adding search with Algolia
---

Once you've added some content to your site, you'll want to make it easy for your visitors to find what they're looking for. This guide will run you through the process of setting up a custom search experience on any Gatsby site powered by [Algolia](https://www.algolia.com).

Two things before we begin:

1. Beyond this guide, you may also want to checkout Algolia's extensive [docs on how to get started in React](https://www.algolia.com/doc/guides/building-search-ui/getting-started/react).
2. If you're looking to add search to a documentation site, you can let Algolia handle most of the steps outlined below for you by using their excellent [Docsearch](https://community.algolia.com/docsearch) functionality. For other types of sites and more fine-grained control over exactly what data should be indexed, read on.

## Configuring the Algolia plugin

First, you'll need to add [`gatsby-plugin-algolia`](https://github.com/algolia/gatsby-plugin-algolia), [`react-instantsearch-dom`](https://github.com/algolia/react-instantsearch) and [`algoliasearch`](https://github.com/algolia/algoliasearch-client-javascript) to your project. With `react-instantsearch` Algolia provides an extensive library of off-the-shelf React components that we can import to save ourselves a lot of work. `algoliasearch` provides the actual search client which we'll simply pass into `react-instantsearch`. If you're not using it already, also install [`dotenv`](https://github.com/motdotla/dotenv) while you're at it. We're going to need it to specify your Algolia app ID and both the search and admin API keys without committing them to version control.

```sh
yarn add gatsby-plugin-algolia react-instantsearch-dom algoliasearch dotenv
```

Next, add `gatsby-plugin-algolia` to your `gatsby-config.js`.

```js:title=gatsby-config.js
const queries = require('./src/utils/algolia')

require('dotenv').config()

module.exports = {
  siteMetadata: {
    title: `Gatsby+Algolia`,
    description: `How to setup Algolia search in Gatsby`,
    author: <your name>,
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
  ],
}
```

Notice that we're loading `queries` from a file at `./src/utils/algolia.js` (you can of course put it wherever you like) and our Algolia ID and API key from `.env` so let's add those files.

```env:title=.env
GATSBY_ALGOLIA_APP_ID = KA4OJA9KAS
GATSBY_ALGOLIA_SEARCH_KEY=lkjas987ef923ohli9asj213k12n59ad
ALGOLIA_ADMIN_KEY = lksa09sadkj1230asd09dfvj12309ajl
```

I inserted random character sequences here but yours should be the same length. Also, it's good practice to commit a `.env.example` to version control so that if someone forks your repo, they know which environment variables they need to supply.

```env:title=.env.example
# rename this file to .env and supply the listed values
# also make sure they are available to the build tool (e.g. Netlify)
# warning: variables prexifed with GATSBY_ will be made available to client-side code,
#   be careful not to expose sensitive data (in this case your Algolia admin key)

GATSBY_ALGOLIA_APP_ID=insertValue
GATSBY_ALGOLIA_SEARCH_KEY=insertValue
ALGOLIA_ADMIN_KEY=insertValue
```

The `queries` allow you to grab the data you want Algolia to index directly from Gatsby's GraphQL layer by exporting from `src/utils/algolia.js` an array of objects, each containing a GraphQL query and (optionally) an index name, a transformer function and a settings object.

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
          date(formatString: "MMM DD, YYYY")
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

It might look a little initmidating at first, but basically you're just letting `gatsby-plugin-algolia` know how to acquire the data with which to populate your indices on Algolia's servers. The example above uses separate queries passing data to separate indices for pages and blog posts.

Notice also that you can run transformers on the data returned by the queries to bring it into a format ready for searching. All we're doing here is 'flattening' posts and pages to 'unnest' the frontmatter but transformers could do much more for you if required. This makes the whole process of indexing your data really flexible and powerful. You could for instance filter the results of your queries here, format fields or even add ones, merge entries and so on.

If you've come this far, then the "backend" is done. You can now run `gatsby build` to see your indices in Algolia's webinterface flooded with all your data (provided the build throws no errors).

## Adding a search interface to your site

What remains to be done now is to add a user-facing search interface to your site. It needs a way for the user to enter a search string, send that string to Algolia, receive matching results from your indices and finally display those to the user. Let's dive right in.

We're going to assemble everything we need into a React `Search` component that we call from anywhere on our site where we want the user to be able to search. Even though design varies strongly from site to site, we'll also go through the styles in this guide since working out the CSS transitions to have the search field slide out as the user clicks on it and the results pane to appear once Algolia returns some matches can take some time. We'll implement this functionality with `styled-components` but of course, you can use any styling method you like and the CSS should remain mostly the same.

The first step is to create the main component file.

```jsx:title=src/components/Search/index.js
import React, { Component, createRef } from "react"
import algoliasearch from "algoliasearch/lite"
import {
  InstantSearch,
  Index,
  Hits,
  connectStateResults,
} from "react-instantsearch-dom"
import { Algolia } from "styled-icons/fa-brands/Algolia"

import { Root, HitsWrapper, By } from "./styles"
import Input from "./Input"
import * as hitComps from "./hits"

const events = ["mousedown", "touchstart"]

const Results = connectStateResults(
  ({ searchState: state, searchResults: res, children }) =>
    res && res.nbHits ? children : `No results for ${state.query}`
)

const Stats = connectStateResults(
  ({ searchResults: res }) =>
    res && res.nbHits > 0 && `${res.nbHits} result${res.nbHits > 1 ? `s` : ``}`
)

export default class Search extends Component {
  state = { query: ``, focussed: false, ref: createRef() }
  searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY
  )

  updateState = state => this.setState(state)

  focus = () => {
    this.setState({ focussed: true })
  }

  disableHits = () => {
    this.setState({ focussed: false })
  }

  handleClickOutside = event => {
    if (!this.state.ref.current.contains(event.target)) {
      this.setState({ focussed: false })
    }
  }

  componentDidMount() {
    events.forEach(event =>
      document.addEventListener(event, this.handleClickOutside)
    )
  }

  componentWillUnmount() {
    events.forEach(event =>
      document.removeEventListener(event, this.handleClickOutside)
    )
  }

  render() {
    const { query, focussed, ref } = this.state
    const { indices, collapse, hitsAsGrid } = this.props
    return (
      <InstantSearch
        searchClient={this.searchClient}
        indexName={indices[0].name}
        onSearchStateChange={this.updateState}
        root={{ Root, props: { ref } }}
      >
        <Input onFocus={this.focus} {...{ collapse, focussed }} />
        <HitsWrapper
          show={query.length > 0 && focussed}
          hitsAsGrid={hitsAsGrid}
        >
          {indices.map(({ name, title, hitComp }) => (
            <Index key={name} indexName={name}>
              <header>
                <h3>{title}</h3>
                <Stats />
              </header>
              <Results>
                <Hits hitComponent={hitComps[hitComp](this.disableHits)} />
              </Results>
            </Index>
          ))}
          <By>
            Powered by{" "}
            <a href="https://www.algolia.com">
              <Algolia size="1em" /> Algolia
            </a>
          </By>
        </HitsWrapper>
      </InstantSearch>
    )
  }
}
```

There's quite a lot happening in this file so let's break it down piece by piece.

```js
import {
  InstantSearch,
  Index,
  Hits,
  connectStateResults,
} from "react-instantsearch-dom"
```

`InstantSearch` imported from [`react-instantsearch-dom`](https://community.algolia.com/react-instantsearch) is Algolia's main off-the-shelf React component that allows your whole search experience to connect to their service. As the name suggests, `Index` allows you to tap into an individual index and `Hits` provides you with the data returned for a user's search input. Finally [`connectStateResults`](https://community.algolia.com/react-instantsearch/connectors/connectStateResults.html) provides high-level stats about the current search state such as the query, the number of results and how long it took to fetch them.

Next we import the styled components that make up the UI.

```js
import { Algolia } from "styled-icons/fa-brands/Algolia"
import { Root, SearchBox, HitsWrapper, By } from "./styles"
```

Notice that we're importing the Algolia logo from `styled-icons`. That's because if you're using Algolia's generous free tier, they ask you to acknowledge them with a little `Powered by Algolia` link below the search results. `react-instantsearch-dom` provides a [`PoweredBy` component](https://community.algolia.com/react-instantsearch/widgets/PoweredBy.html) for that but you can of course build and style your own (as done here).

We'll get back to those styled components once we're done with `index.js`. For now, let's move on.

```js
import Input from "./Input"
```

The Input component is where the user enters the search string. It is quite short since the grunt work is done by one of Algolia's components called [`connectSearchBox`](https://community.algolia.com/react-instantsearch/connectors/connectSearchBox.html):

```jsx:title=src/components/Search/Input.js
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

Let's again worry about the styled components `SearchIcon`, `Form`, `Input` later.

The next line imports hit components for every type of result we want to display to the user. (The term "hit" in this context just means search result.) The hit component determines how attributes of matching results such as author and title in the case of a blog post are displayed to the user.

```js
import * as hitComps from "./hits"
```

`hits.js` itself just bundles the exports from all hit components. We'll get to `PageHit` and `PostHit` in the end.

```js:title=src/components/Search/hits.js
export { default as PageHit } from "./PageHit"
export { default as PostHit } from "./PostHit"
```

Next we define two tiny connected components. `Results` informs the user that no matches could be found for a query if there were no matches, i.e. `searchResults.nbHits == 0`. `Stats` just displays `searchResults.nbHits`.

```js
const Results = connectStateResults(
  ({ searchState: state, searchResults: res, children }) =>
    res && res.nbHits ? children : `No results for ${state.query}`
)

const Stats = connectStateResults(
  ({ searchResults: res }) =>
    res && res.nbHits > 0 && `${res.nbHits} result${res.nbHits > 1 ? `s` : ``}`
)
```

Now comes the actual `Search` component class. It starts off with a bunch of boilerplate to initialize state, define handler functions and make those trigger with event listeners. All they do is make the search input slide out when the user clicks a search icon and make it disappear again when the user clicks anywhere else or starts to scroll.

The `render` function takes a dynamic array of `indices` passed as a prop. Each array item should be an object with keys `name`, `title`, `hitComp` that specifies the name of the index in your Algolia account that should be queried, the title to display aboe the results shown to the user and the component `hitComp` that renders the data returned for each match.

Passing this `indices` array as a prop allows you to reuse the same `Search` component in different parts of your site and have each of them query different Algolia indices. As an example, besides a primary search box in the header used for finding pages and/or posts, your site might have a wiki and you want to offer your visitors a second search box that displays results only for that part of your site.

```jsx
const { indices, collapse, hitsAsGrid } = this.props
...
{indices.map(({ name, title, hitComp }) => (
  <Index key={name} indexName={name}>
    <header>
      {title && <h2>{title}</h2>}
      <Stats />
    </header>
    <Results>
    <Hits hitComponent={hitComps[hitComp](this.disableHits)} />
    </Results>
  </Index>
))}
```

Note below that we feed `InstantSearch` with the same app ID we specified in our `.env` file and used in `src/utils/algolia.js` as well as with our search-only API key. _Don't paste in your admin API key here!_ `InstantSearch` only needs to _read_ your indices. Pasting your admin key here would allow others to obtain it once your site is deployed. They could then start messing with your indexed data on Algolia.

```jsx
<InstantSearch
  appId={process.env.GATSBY_ALGOLIA_APP_ID}
  apiKey={process.env.GATSBY_ALGOLIA_SEARCH_KEY}
  indexName={indices[0].name}
  onSearchStateChange={this.updateState}
  root={{ Root, props: { ref } }}
>
```

Now we come to the styled components. Of course, the design will be very different from one site to the next so we only list them here for completeness and because it might save some time to simply copy and customize them.

```js:title=src/components/Search/styles.js
import styled, { css } from "styled-components"
import { Search } from "styled-icons/fa-solid/Search"

export const Root = styled.div`
  position: relative;
  display: grid;
  grid-gap: 1em;
`

export const SearchIcon = styled(Search)`
  width: 1em;
  pointer-events: none;
`

const focussed = css`
  background: ${props => props.theme.white};
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
    color: ${props => props.theme.white};
  }
  ${props => props.focussed && focussed}
  margin-left: ${props => (props.focussed ? `-1.6em` : `-1em`)};
  padding-left: ${props => (props.focussed ? `1.6em` : `1em`)};
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
  ${props => (props.collapse ? collapse : expand)};
`

export const Form = styled.form`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
`

const list = css`
  position: absolute;
  right: 0;
  top: calc(100% + 0.5em);
  width: calc(4em + 40vw);
  max-width: 30em;
  box-shadow: 0 0 5px 0;
  padding: 0.7em 1em 0.4em;
  background: ${props => props.theme.white};
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
`

const grid = css`
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15em, 1fr));
    grid-gap: 1em;
    li {
      padding: 0.3em 0.5em;
      background: ${props => props.theme.veryLightGray};
      border-radius: ${props => props.theme.smallBorderRadius};
    }
  }
`

export const HitsWrapper = styled.div`
  display: ${props => (props.show ? `grid` : `none`)};
  max-height: 80vh;
  overflow: scroll;
  ${props => (props.hitsAsGrid ? grid : list)};
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
      color: ${props => props.theme.white};
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

export const By = styled.span`
  font-size: 0.6em;
  text-align: end;
  padding: 0;
`
```

Now we're almost done. 2 small steps remain. First, we need to put together a hit component for every type of result we want to display. In our example, these are blog posts and pages. And second, we need to call our `Search` component somewhere on our site. Here are the post and page hit components.

```jsx:title=src/components/Search/PageHit.js
import React from "react"
import { Highlight, Snippet } from "react-instantsearch-dom"
import { Link } from "gatsby"

const PageHit = clickHandler => ({ hit }) => (
  <div>
    <Link to={hit.slug} onClick={clickHandler}>
      <h3>
        <Highlight attribute="title" hit={hit} tagName="mark" />
      </h3>
    </Link>
    <Snippet attribute="excerpt" hit={hit} tagName="mark" />
  </div>
)

export default PageHit
```

```jsx:title=src/components/Search/PostHit.js
import React, { Fragment } from "react"
import { Highlight, Snippet } from "react-instantsearch-dom"
import { Link } from "gatsby"
import { Calendar } from "styled-icons/octicons/Calendar"
import { Tags } from "styled-icons/fa-solid/Tags"

const PostHit = clickHandler => ({ hit }) => (
  <div>
    <Link to={`/blog/` + hit.slug} onClick={clickHandler}>
      <h3>
        <Highlight attribute="title" hit={hit} tagName="mark" />
      </h3>
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
          {index > 0 && ", "}
          <Link to={`blog/` + tag.toLowerCase().replace(` `, `-`)}>{tag}</Link>
        </Fragment>
      ))}
    </div>
    <Snippet attribute="excerpt" hit={hit} tagName="mark" />
  </div>
)

export default PostHit
```

Now all we need to do is import `Search` somewhere. The obvious place is the `Header` component so let's add it there.

```jsx:title=src/components/Header/index.js
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

Note that this is where we define our array of search indices and pass it as a prop to `Search`.

If everything works as expected, running `gatsby develop` should now give you some instant search magic looking something like in the video below! You can also play around with it [here](https://janosh.io/blog).

`youtube: Amsub4xJ3Jc`

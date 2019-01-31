---
title: "Adding search with js-search"
---

## Prerequisites

Before we go through the steps needed for adding client side search to your Gatsby website, it would be advised
if the reader is not familiar on how Gatsby works and is set up to follow through the [tutorial](https://www.gatsbyjs.org/tutorial/) and brush up on the [documentation](https://www.gatsbyjs.org/docs/).

Otherwise just skip this part and move onto the next part.

## What is JS Search

[JS Search](https://github.com/bvaughn/js-search) is a library created by Brian Vaughn, a member of the core team at Facebook. It provides an efficient way to search for data on the client using JavaScript and JSON objects. It also has extensive customisation options, check out their docs for more details.

The full code and documentation for this library is [available on GitHub](https://github.com/bvaughn/js-search). This guide is based on the official js-search example but has been adapted to work with your Gatsby site. 

## Setup

Let's start by creating a new Gatsby site to work with. Open up a terminal and create the folder that you'll use for this project:

```bash
mkdir client-search-with-gatsby
```

Inside that folder, create a new Gatsby website using a starter template, using the command below:

```bash
npx gatsby new jsSearchExample https://github.com/gatsbyjs/gatsby-starter-default
```

After the process is complete, some additional packages are needed.

Navigate into the `jsSearchExample` folder and issue the following command:

```bash
npm install --save js-search axios
```

Or if Yarn is being used:

```bash
yarn add js-search axios
```

Note:

For this particular example [axios](https://github.com/axios/axios) will be used, to handle all of the promise based HTTP requests.

After all of this is done the actual implementation can be started.

Both approaches documented here are fairly generalistic so that most of the options offered by the library can be experimented with.

## First approach

The approach documented below is a fairly simple one, by having the component fetch the data and create the search engine.

Start by creating a file in the `components` folder, for this particular case the name will be `SearchContainer.js` and inside of it the following baseline code will be added to get started:

```javascript
import React, { Component } from "react"
import Axios from "axios"
import * as JsSearch from "js-search"
import DataTable from "./DataTable"
import "./search.css"
class Search extends Component {
  state = {
    bookList: [], // the data that will be fetched
    search: [], // the js-search engine
    searchResults: [], // results of the search
    isError: false, // property to notify the component that something bad happened and let the user know
    indexByTitle: true, // one of the indexes used to search the data recieved
    indexByAuthor: true, //  another of the indexes used to search the data recieved
    termFrequency: true, // something something
    removeStopWords: false,
    searchQuery: "", // the actual query text to be made
    selectedStrategy: "Prefix match", // the strategy used by js-search to speed up the process
    selectedSanitizer: "Lower Case",
  }
  /**
   * React lifecycle method to fetch the data
   */
  async componentDidMount() {
    // fetches the data to be used changes the component state based on the result of the request and data
    Axios.get("http://bvaughn.github.io/js-search/books.json")
      .then(result => {
        const bookData = result.data
        this.setState({ bookList: bookData.books })
        /**
         * calls the rebuildIndex es6 fat arrow function generate the engine with the appropriate options
         */
        this.rebuildIndex()
      })
      .catch(err => {
        this.setState({ isError: true })
        console.log("====================================")
        console.log(`Something bad happened while fetching the data\n${err}`)
        console.log("====================================")
      })
  }
  /**
   * es6 fat arrow function to instantiate the search engine
   * according to the options defined in the component state
   * creates the  index and injects the data
   */
  rebuildIndex = () => {
    const {
      bookList,
      selectedStrategy,
      selectedSanitizer,
      removeStopWords,
      termFrequency,
      indexByTitle,
      indexByAuthor,
    } = this.state
    const dataToSearch = new JsSearch.Search("isbn")

    if (removeStopWords) {
      dataToSearch.tokenizer = new JsSearch.StopWordsTokenizer(
        dataToSearch.tokenizer
      )
    }
    /**
     *  defines a indexing strategy for the data
     * more more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
     */
    if (selectedStrategy === "All") {
      dataToSearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()
    }
    if (selectedStrategy === "Exact match") {
      dataToSearch.indexStrategy = new JsSearch.ExactWordIndexStrategy()
    }
    if (selectedStrategy === "Prefix match") {
      dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy()
    }

    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    selectedSanitizer === "Case Sensitive"
      ? (dataToSearch.sanitizer = new JsSearch.CaseSensitiveSanitizer())
      : (dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer())

    /**
     * defines the search index
     * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
     */
    termFrequency === true
      ? (dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex("isbn"))
      : (dataToSearch.searchIndex = new JsSearch.UnorderedSearchIndex())

    /**
     * checks the values in the state and indexes the data revieved based on it
     */
    if (indexByTitle) {
      dataToSearch.addIndex("title")
    }
    if (indexByAuthor) {
      dataToSearch.addIndex("author")
    }

    dataToSearch.addDocuments(bookList) // adds the data
    this.setState({ search: dataToSearch })
  }

  /**
   * es6 fat arrow function to handle the input change and perfom a search with js-search
   * in which the results will be added to the state
   */
  searchData = e => {
    const { search } = this.state
    const queryResult = search.search(e.target.value)
    this.setState({ searchQuery: e.target.value, searchResults: queryResult })
  }
  render() {
    const { bookList, searchResults, searchQuery, indexByAuthor } = this.state
    return (
      <div>
        <div>
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label htmlFor="Search" className="form-label">
                Enter your search here
              </label>
              <input
                id="Search"
                value={searchQuery}
                onChange={this.searchData}
                placeholder="Enter your search here"
                className="searchQuery"
              />
            </div>
            .....
          </form>
          <div>
            Number of items:
            {searchQuery === "" ? books.length : searchResults.length}
            <DataTable data={searchQuery === "" ? books : searchResults} />
          </div>
        </div>
      </div>
    )
  }
}

export default Search
```

Breaking down the code into smaller parts:

1. When the component is mounted, the `componentDidMount()` lifecycle method is triggered and the data will be fetched.
2. If no errors occur, the data received is added to the state and the `rebuildIndex()` function is invoked.
3. The search engine is then created and configured with the options provided in the component's state.
4. The data that was received is then added and indexed using js-search.
5. When the contents of the input change, `js-search` starts the search process based on the updated input and returns the contents, which is then presented to the user via the `DataTable` component.

Note:

For brevity purposes, most of the component implementation is omited, with the exception of the `searchData()` function, as this one is responsible for making the search, also the implementation of the `DataTable` component and the page holding this component is not shown. The full code of this example is available [in the js-search repo](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-js-search).

## Second approach

This approach takes advantage of Gatsby's APIs to prefetch the data, process it if needed and generate the search engine options beforehand, all of this achieved during the build process. In order to accomplish this, some changes are required to the project.

Starting by modifying the `gatsby-node.js` file by adding the following code:

```javascript
const path = require("path")
const axios = require("axios")

exports.createPages = ({ actions }) => {
  const { createPage } = actions
  return new Promise((resolve, reject) => {
    axios
      .get("https://bvaughn.github.io/js-search/books.json")
      .then(result => {
        const { data } = result
        /**
         * creates a page dynamic page with the data recieved
         * injects the data recived into the context object alongside with some options
         * to configure js-search
         */
        createPage({
          path: "/search",
          component: path.resolve(`./src/templates/ClientSearchTemplate.js`),
          context: {
            bookData: {
              allBooks: data.books,
              options: {
                indexStrategy: "Prefix match",
                searchSanitizer: "Lower Case",
                TitleIndex: true,
                AuthorIndex: true,
                SearchByTerm: true,
              },
            },
          },
        })
        resolve()
      })
      .catch(err => {
        console.log("====================================")
        console.log(`error creating Page:${err}`)
        console.log("====================================")
        reject(new Error(`error on page creation:\n${err}`))
      })
  })
}
```

Contrary to our earlier approach, instead of letting the component do all of the work, it's Gatsby's job to do the work and pass all the data to a page defined by the path object, via [pageContext](https://www.gatsbyjs.org/docs/behind-the-scenes-terminology/#pagecontext).

Let's do this by adding a couple of new components. The first will be your page template component.

It will be created in the following location `/src/templates`, under the name `ClientSearchTemplate.js`, with the following code:

```javascript
import React from "react"
import Layout from "../components/layout"
import ClientSearch from "../components/ClientSearch"

const SearchTemplate = props => {
  const { pageContext } = props
  const { bookData } = pageContext
  const { allBooks, options } = bookData
  return (
    <Layout>
      <h1 style={{ marginTop: "3em", textAlign: "center" }}>
        Search data using JS Search using Gatsby Api
      </h1>
      <h3 style={{ marginTop: "2em", padding: "2em 0em", textAlign: "center" }}>
        Books Indexed by:
      </h3>

      <div>
        <ClientSearch books={allBooks} engine={options} />
      </div>
    </Layout>
  )
}

export default SearchTemplate
```

Now add the second component. Add a file called `ClientSearch.js` to the `components` folder, with the following code as a baseline:

```javascript
import React, { Component } from 'react'
import { Segment, Form, Header } from 'semantic-ui-react'
import * as JsSearch from 'js-search'
import DataTable from './DataTable'
import './search.css'
class ClientSearch extends Component {
  state = {
    isLoading: true,
    searchResults: [],
    search: null,
    isError: false,
    indexByTitle: false,
    indexByAuthor: false,
    termFrequency: true,
    removeStopWords: false,
    searchQuery: '',
    selectedStrategy: '',
    selectedSanitizer: '',
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.search === null) {
      const { engine } = nextProps
      return {
        indexByTitle: engine.TitleIndex,
        indexByAuthor: engine.AuthorIndex,
        termFrequency: engine.SearchByTerm,
        selectedSanitizer: engine.searchSanitizer,
        selectedStrategy: engine.indexStrategy,
      }
    }
    return null
  }
  async componentDidMount() {
    this.rebuildIndex()
  }
  .....
}
export default ClientSearch
```

The code used in here is almost identical to the one documented in the first approach and for the same reason stated in the first approach, here also the full implementation will not be shown.

But there is a slight diference although, it will be used the React `getDerivedStateFromProps()` lifecycle method to adjust the component state accordingly and then `componentDidMount()` to instatiate the client side search, based on the options defined by the state. With this, all of the data will be already available as soon as the specified endpoint is reached, and searching can be made almost instantly.

Hopefully this guide has shed some insights on how you can implement client search using js-search.

Now go and make something great!

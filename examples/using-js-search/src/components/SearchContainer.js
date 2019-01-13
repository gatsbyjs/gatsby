import React, { Component } from 'react'
import Axios from 'axios'
import { Segment, Form, Header } from 'semantic-ui-react'
import * as JsSearch from 'js-search'
import DataTable from './DataTable'

class Search extends Component {
  state = {
    bookList: [],
    search: [],
    searchResults: [],
    isError: false,
    indexByTitle: true,
    indexByAuthor: true,
    termFrequency: true,
    removeStopWords: false,
    searchQuery: ``,
    selectedStrategy: `Prefix match`,
    selectedSanitizer: `Lower Case`,
  }
  /**
   * React lifecycle method to fetch the data
   */
  async componentDidMount() {
    Axios.get(`https://bvaughn.github.io/js-search/books.json`)
      .then(result => {
        const bookData = result.data
        this.setState({ bookList: bookData.books })
        this.rebuildIndex()
      })
      .catch(err => {
        this.setState({ isError: true })
        console.log(`====================================`)
        console.log(`Something bad happened while fetching the data\n${err}`)
        console.log(`====================================`)
      })
  }
  /* eslint-disable */
  onChangeIndexTitle = () => {
    this.setState(prevstate => ({
      indexByTitle: !prevstate.indexByTitle,
    }))
    this.rebuildIndex()
  }

  onChangeIndexAuthor = () => {
    this.setState(prevstate => ({
      indexByAuthor: !prevstate.indexByAuthor,
    }))
    this.rebuildIndex()
  }

  onChangeStopWords = () => {
    this.setState(prevstate => ({
      removeStopWords: !prevstate.removeStopWords,
    }))
    this.rebuildIndex()
  }
  /* eslint-enable */
  onChangeStrategy = (e, { value }) => {
    this.setState({ selectedStrategy: value })
    this.rebuildIndex()
  }
  onChangeSanitizer = (e, { value }) => {
    this.setState({ selectedSanitizer: value })
    this.rebuildIndex()
  }

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

    const dataToSearch = new JsSearch.Search(`isbn`)

    if (removeStopWords) {
      dataToSearch.tokenizer = new JsSearch.StopWordsTokenizer(
        dataToSearch.tokenizer
      )
    }
    /**
     *  defines a indexing strategy for the data
     * more more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
     */
    if (selectedStrategy === `All`) {
      dataToSearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()
    }
    if (selectedStrategy === `Exact match`) {
      dataToSearch.indexStrategy = new JsSearch.ExactWordIndexStrategy()
    }
    if (selectedStrategy === `Prefix match`) {
      dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy()
    }
    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    selectedSanitizer === `Case Sensitive`
      ? (dataToSearch.sanitizer = new JsSearch.CaseSensitiveSanitizer())
      : (dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer())

    /**
     * defines the search index
     * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
     */
    termFrequency === true
      ? (dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex(`isbn`))
      : (dataToSearch.searchIndex = new JsSearch.UnorderedSearchIndex())

    if (indexByTitle) {
      dataToSearch.addIndex(`title`) // defines the index attribute for the data
    }
    if (indexByAuthor) {
      dataToSearch.addIndex(`author`) // defines the index attribute for the data
    }
    dataToSearch.addDocuments(bookList) // adds the data to be searched
    this.setState({ search: dataToSearch })
  }
  searchData = e => {
    const { search } = this.state
    const queryResult = search.search(e.target.value)
    this.setState({ searchQuery: e.target.value, searchResults: queryResult })
  }
  handleSubmit = e => {
    e.preventDefault()
  }
  render() {
    const {
      isError,
      bookList,
      searchResults,
      searchQuery,
      indexByAuthor,
      indexByTitle,
      removeStopWords,
      selectedStrategy,
      selectedSanitizer,
    } = this.state
    if (isError) {
      return (
        <Segment raised>
          <Header
            as="h1"
            content="Ohh no!!!!!"
            style={{ marginTop: `3em` }}
            textAlign="center"
          />
          <Segment>
            <Header
              as="h3"
              content="Something really bad happened"
              style={{ marginTop: `2em`, padding: `2em 0em` }}
              textAlign="center"
            />
          </Segment>
        </Segment>
      )
    }
    return (
      <div>
        <Segment raised>
          <Form>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Search"
                placeholder="Enter your search here"
                value={searchQuery}
                onChange={this.searchData}
              />
            </Form.Group>
            <Form.Group inline>
              <Form.Checkbox
                label="Title"
                checked={indexByTitle}
                onChange={this.onChangeIndexTitle}
              />
              <Form.Checkbox
                label="Author"
                checked={indexByAuthor}
                onChange={this.onChangeIndexAuthor}
              />
              <Form.Checkbox
                label="Remove Stop Words"
                checked={removeStopWords}
                onChange={this.onChangeStopWords}
              />
              <Form.Select
                fluid
                label="Select a strategy for indexing"
                defaultValue={selectedStrategy}
                options={[
                  { key: `A`, text: `All`, value: `All` },
                  { key: `EM`, text: `Exact match`, value: `Exact match` },
                  {
                    key: `PM`,
                    text: `Prefix match`,
                    value: `Prefix match`,
                  },
                ]}
                placeholder="Select a strategy"
                onChange={this.onChangeStrategy}
              />
              <Form.Select
                fluid
                label="Select a sanitizer"
                defaultValue={selectedSanitizer}
                onChange={this.onChangeSanitizer}
                options={[
                  {
                    key: `CS`,
                    text: `Case Sensitive`,
                    value: `Case Sensitive`,
                  },
                  {
                    key: `LS`,
                    text: `Lower Case`,
                    value: `Lower Case`,
                  },
                ]}
                placeholder="Select a sanitizer"
              />
            </Form.Group>
          </Form>
        </Segment>
        <Segment>
          Number of items:
          {searchQuery === `` ? bookList.length : searchResults.length}
          <DataTable data={searchQuery === `` ? bookList : searchResults} />
        </Segment>
      </div>
    )
  }
}

export default Search

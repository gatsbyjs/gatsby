import React, { Component } from 'react'
import Axios from 'axios'
import * as JsSearch from 'js-search'
import DataTable from './DataTable'
import './search.css'
class Search extends Component {
  state = {
    bookList: [],
    search: [],
    searchResults: [],
    isLoading: true,
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
  onChangeStrategy = e => {
    this.setState({ selectedStrategy: e.target.value })
    this.rebuildIndex()
  }
  onChangeSanitizer = e => {
    this.setState({ selectedSanitizer: e.target.value })
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
    this.setState({ search: dataToSearch, isLoading: false })
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
      isLoading,
      bookList,
      searchResults,
      searchQuery,
      indexByAuthor,
      indexByTitle,
      removeStopWords,
      selectedStrategy,
      selectedSanitizer,
    } = this.state
    if (isLoading) {
      return (
        <div>
          <h1 style={{ marginTop: `3em` }}>Getting the search all setup</h1>
          <h1 style={{ marginTop: `3em`, textAlign: `center` }}>
            Getting the search all setup
          </h1>
        </div>
      )
    }
    if (isError) {
      return (
        <div>
          <h1 style={{ marginTop: `3em`, textAlign: `center` }}>Ohh no!!!!!</h1>
          <h3
            style={{
              marginTop: `2em`,
              padding: `2em 0em`,
              textAlign: `center`,
            }}
          >
            Something really bad happened
          </h3>
        </div>
      )
    }
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
            <div className="form-group">
              <label>
                Title
                <input
                  type="checkbox"
                  onChange={this.onChangeIndexTitle}
                  checked={indexByTitle}
                />
              </label>
              <label>
                Author
                <input
                  type="checkbox"
                  checked={indexByAuthor}
                  onChange={this.onChangeIndexAuthor}
                />
              </label>
              <label>
                Remove Stop Words
                <input
                  type="checkbox"
                  checked={removeStopWords}
                  onChange={this.onChangeStopWords}
                />
              </label>
            </div>
            <div className="form-group">
              <label>Select a strategy</label>
              <select onChange={this.onChangeStrategy} value={selectedStrategy}>
                <option value="All">All</option>
                <option value="Exact match">Exact match</option>
                <option value="Prefix match">Prefix match</option>
              </select>
              <label>
                Select a sanitizer
                <select
                  onChange={this.onChangeSanitizer}
                  value={selectedSanitizer}
                >
                  <option value="Case Sensitive">Case Sensitive</option>
                  <option value="Lower Case">Lower Case</option>
                </select>
              </label>
            </div>
          </form>
          <div>
            Number of items:
            {searchQuery === `` ? bookList.length : searchResults.length}
            <DataTable data={searchQuery === `` ? bookList : searchResults} />
          </div>
        </div>
      </div>
    )
  }
}

export default Search

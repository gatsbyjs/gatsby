import React, { Component } from 'react'
import { Segment, Form, Header } from 'semantic-ui-react'
import * as JsSearch from 'js-search'
import DataTable from './DataTable'

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
    searchQuery: ``,
    selectedStrategy: ``,
    selectedSanitizer: ``,
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
  /* eslint-disable */
  onChangeIndexTitle = () => {
    this.setState(prevstate => ({
      indexByTitle: !prevstate.indexByTitle,
    }))
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
  onChangeStrategy = (e, { value }) => {
    this.setState({ selectedStrategy: value })
    this.rebuildIndex()
  }
  onChangeSanitizer = (e, { value }) => {
    this.setState({ selectedSanitizer: value })
    this.rebuildIndex()
  }
  /* eslint-enable */
  rebuildIndex = () => {
    const {
      selectedStrategy,
      selectedSanitizer,
      removeStopWords,
      termFrequency,
      indexByTitle,
      indexByAuthor,
    } = this.state
    const { books } = this.props

    const dataToSearch = new JsSearch.Search(`isbn`)
    if (removeStopWords) {
      dataToSearch.tokenizer = new JsSearch.StopWordsTokenizer(
        dataToSearch.tokenizer
      )
    }
    if (selectedStrategy === `All`) {
      dataToSearch.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()
    }
    if (selectedStrategy === `Exact match`) {
      dataToSearch.indexStrategy = new JsSearch.ExactWordIndexStrategy()
    }
    if (selectedStrategy === `Prefix match`) {
      dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy()
    }
    selectedSanitizer === `Case Sensitive`
      ? (dataToSearch.sanitizer = new JsSearch.CaseSensitiveSanitizer())
      : (dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer())
    termFrequency === true
      ? (dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex(`isbn`))
      : (dataToSearch.searchIndex = new JsSearch.UnorderedSearchIndex())

    if (indexByTitle) {
      dataToSearch.addIndex(`title`)
    }
    if (indexByAuthor) {
      dataToSearch.addIndex(`author`)
    }
    dataToSearch.addDocuments(books)
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
      isLoading,
      isError,
      searchResults,
      searchQuery,
      indexByAuthor,
      indexByTitle,
      removeStopWords,
      selectedStrategy,
      selectedSanitizer,
    } = this.state
    const { books } = this.props
    if (isLoading) {
      return (
        <Segment>
          <Header
            as="h1"
            content="Getting the search all setup"
            style={{ marginTop: `3em` }}
            textAlign="center"
          />
        </Segment>
      )
    }
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
          {searchQuery === `` ? books.length : searchResults.length}
          <DataTable data={searchQuery === `` ? books : searchResults} />
        </Segment>
      </div>
    )
  }
}
export default ClientSearch

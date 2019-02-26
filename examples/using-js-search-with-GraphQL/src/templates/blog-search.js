import React, { Component } from 'react'
import { Link } from 'gatsby'
import * as JsSearch from 'js-search'

class BlogSearch extends Component {
  state = {
    results: [],
    search: null,
    searchQuery: ``,
  }
  componentDidMount() {
    //this.props
    const { pageContext } = this.props
    const { blogPosts, options } = pageContext

    const dataToSearch = new JsSearch.Search('id')

    /**
     *  defines a indexing strategy for the data
     * more more about it in here https://github.com/bvaughn/js-search#configuring-the-index-strategy
     */
    dataToSearch.indexStrategy = new JsSearch.PrefixIndexStrategy()

    /**
     * defines the sanitizer for the search
     * to prevent some of the words from being excluded
     *
     */
    dataToSearch.sanitizer = new JsSearch.LowerCaseSanitizer()

    /**
     * defines the search index
     * read more in here https://github.com/bvaughn/js-search#configuring-the-search-index
     */
    dataToSearch.searchIndex = new JsSearch.TfIdfSearchIndex('id')

    options.map(item => dataToSearch.addIndex(item))

    dataToSearch.addDocuments(blogPosts)
    this.setState({ search: dataToSearch })
  }

  searchData = e => {
    const { search } = this.state
    const queryResult = search.search(e.target.value)
    this.setState({ searchQuery: e.target.value, results: queryResult })
  }

  handleSubmit = e => {
    e.preventDefault()
  }

  render() {
    const { results, searchQuery } = this.state
    const { pageContext } = this.props
    const { blogPosts } = pageContext

    const queryResults = searchQuery === '' ? blogPosts : results
    return (
      <div style={{ margin: '2em auto' }}>
        <h1 style={{ marginTop: `3em`, textAlign: `center` }}>Blog search with JS Search and Gatsby Api</h1>
        <form onSubmit={this.handleSubmit}>
          <div style={{ margin: '0 auto' }}>
            <label htmlFor="Search" style={{ paddingRight: '10px' }}>
              Enter your search here
            </label>
            <input
              id="Search"
              value={searchQuery}
              onChange={this.searchData}
              placeholder="Enter your search here"
              style={{ margin: '0 auto', width: '400px' }}
            />
          </div>
        </form>
        <div>Number of results:{queryResults.length}</div>
        <div>
          <ul>
            {queryResults.map(item => {
              return (
                <li key={`list_item${item.id}`}>
                  <Link key={`link_${item.id}`} to={item.path}>
                    {item.title}
                  </Link>
                  {` `} by {item.author}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }
}

export default BlogSearch

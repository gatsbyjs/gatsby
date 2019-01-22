import React from 'react'
import Layout from '../components/layout'
import ClientSearch from '../components/ClientSearch'

const SearchTemplate = props => {
  const { pageContext } = props
  const { bookData } = pageContext
  const { allBooks, options } = bookData
  return (
    <Layout>
      <h1 style={{ marginTop: '3em', textAlign: 'center' }}>
        Search data using JS Search using Gatsby Api
      </h1>
      <h3 style={{ marginTop: '2em', padding: '2em 0em', textAlign: 'center' }}>
        Books Indexed by:
      </h3>

      <div>
        <ClientSearch books={allBooks} engine={options} />
      </div>
    </Layout>
  )
}

export default SearchTemplate

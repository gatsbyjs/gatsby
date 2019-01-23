import React, { Component } from 'react'
import axios from 'axios'
import Layout from '../components/layout'
import SEO from '../components/seo'
import uuid from 'uuid'
class ClientJSON extends Component {
  state = {
    isError: false,
    errorMessage: ``,
    jsonData: {},
  }
  async componentDidMount() {
    try {
      const JSONRequest = await axios.get(`./second.json`)
      this.setState({ jsonData: JSONRequest.data })
    } catch (error) {
      this.setState({ isError: true, errorMessage: error })
      console.log(`====================================`)
      console.log(`ERROR ON LOAD DATA:\n${error}`)
      console.log(`====================================`)
    }
  }
  render() {
    const { jsonData, isError, errorMessage } = this.state
    if (isError) {
      return (
        <div>
          <h1>Something went bad</h1>
          <h3>{errorMessage}</h3>
        </div>
      )
    }
    if (!jsonData.title) {
      return <h1>fetching data! give it a moment</h1>
    }
    return (
      <Layout>
        <SEO title={jsonData.title} />
        <div>
          {jsonData.content.map(data => (
            <div key={`content_item_${uuid.v4()}`}>{data.item}</div>
          ))}
        </div>
      </Layout>
    )
  }
}

export default ClientJSON

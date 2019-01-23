import React, { Component } from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import axios from 'axios'
import yaml from 'js-yaml'
import uuid from 'uuid'
class ClientYAML extends Component {
  state = {
    isError: false,
    errorMessage: ``,
    yamlData: {},
  }
  async componentDidMount() {
    try {
      const ymlfile = await axios.get(`./second.yaml`)
      const data = yaml.safeLoad(ymlfile.data)
      this.setState({ yamlData: data })
    } catch (error) {
      this.setState({ isError: true, errorMessage: error })
      console.log(`====================================`)
      console.log(`ERROR ON LOAD DATA:\n${error}`)
      console.log(`====================================`)
    }
  }
  render() {
    const { yamlData, isError, errorMessage } = this.state
    if (isError) {
      return (
        <div>
          <h1>Something went bad</h1>
          <h3>{errorMessage}</h3>
        </div>
      )
    }
    if (!yamlData.title) {
      return <h1>fetching data! give it a moment</h1>
    }
    return (
      <Layout>
        <SEO title={yamlData.title} />
        <div>
          {yamlData.content.map(data => (
            <div key={`content_item_${uuid.v4()}`}>{data.item}</div>
          ))}
        </div>
      </Layout>
    )
  }
}
export default ClientYAML

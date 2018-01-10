import React, {Component} from "react"
import Container from "../components/container"

class Plugins extends Component {
  render(){
    return(
      <Container>
        <h1 css={{ marginTop: 0 }}>Plugins</h1>
        <p>Plugins are Node.js packages that implement Gatsby APIs. They enable you to
            easily solve common website build problems e.g. setup Sass, add markdown
            support, process images, etc.</p>
        <p>For larger / complex sites, they let you modularize your site customizations
            into site-specific plugins.</p>
        <p>Gatsby has a large and growing set of plugins. Use the search bar on the left
            to find plugins for your project.</p>
        <h2>How to use?</h2>
        <p>
          Plugins are just Node.js packages meaning you install them like anything else in node using NPM.
        </p>
        <p>
          For example, <code>gatsby-transformer-json</code> is a package which adds support for JSON files to the Gatsby data layer.
        </p>
        <p>
          To install it, in the root of your site you run:
        </p>
        <code>npm install --save gatsby-transformer-json</code>
        <p>
          Then in your site’s <code>gatsby-config.js</code> you simply add <code>gatsby-transformer-json</code> to the
            plugins array.
        </p>
      </Container>
    )
  }
}

export default Plugins

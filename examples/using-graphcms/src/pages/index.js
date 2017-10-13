import React, { Component } from 'react';

class IndexPage extends Component {
  render() {
    const artists = this.props.data.artists

    return (
      <div>
        <h1>Vinylbase Artists</h1>
        <p>Welcome to your new Gatsby example site using the GraphCMS source plugin.</p>
        <p>This is the list of artists and their IDs:</p>
        <ol>
          {artists.edges.map(({ node }, i) => (
            <li key={node.id}>{node.name} (id: {node.id})</li>
          ))}
        </ol>
      </div>
    )
  }
}

export default IndexPage

export const pageQuery = graphql`
query getAllArtists {
  artists: allArtists {
    edges {
      node {
        id
        name
      }
    }
  }
}
`

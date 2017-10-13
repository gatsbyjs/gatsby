import React, { Component } from 'react';

class IndexPage extends Component {
  render() {
    const artists = this.props.data.artists.edges

    return (
      <div>
        <h1>Vinylbase Artists</h1>
        <p>Welcome to your new Gatsby example site using the GraphCMS source plugin.</p>
        <p>This is the list of artists and their IDs:</p>
        { artists.map(({ node }, i) => (
          <div key={node.id}>
            <h2>{node.name} (slug: {node.slug})</h2>
            <img src={node.picture.url} alt={node.name} title={node.name}/>
          </div>
        ))}
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
        slug
        picture {
          id
          url
          width
          height
        }
      }
    }
  }
}
`

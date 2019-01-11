import React from "react"
import { Link, graphql, StaticQuery } from "gatsby"

export default () => (
  <StaticQuery
    query={graphql`
      query {
        allPokemon: allPokeapiPokemon {
          edges {
            node {
              id
              name
              sprites {
                front_default
              }
            }
          }
        }
      }
    `}
    render={data => (
      <div style={{ width: 960, margin: `4rem auto` }}>
        <h1>Choose a Pokémon!</h1>
        <ul style={{ padding: 0 }}>
          {data.allPokemon.edges.map(pokemon => (
            <li
              key={pokemon.node.id}
              style={{
                textAlign: `center`,
                listStyle: `none`,
                display: `inline-block`,
              }}
            >
              <Link to={`/pokemon/${pokemon.node.name}`}>
                <img
                  src={pokemon.node.sprites.front_default}
                  alt={pokemon.node.name}
                />
                <p>{pokemon.node.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}
  />
)

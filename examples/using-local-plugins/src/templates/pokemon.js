import React from "react"
import { Link, graphql } from "gatsby"

export default ({ data: { pokemon } }) => (
  <div style={{ width: 960, margin: `4rem auto` }}>
    <h1>{pokemon.name}</h1>
    <img src={pokemon.sprites.front_default} alt={pokemon.name} />
    <h2>Abilities</h2>
    <ul>
      {pokemon.abilities.map(ability => (
        <li key={ability.name}>
          <Link to={`./pokemon/${pokemon.name}/ability/${ability.name}`}>
            {ability.name}
          </Link>
        </li>
      ))}
    </ul>
    <Link to="/">Back to all Pokémon</Link>
  </div>
)

export const pageQuery = graphql`
  query($name: String!) {
    pokemon: pokeapiPokemon(name: { eq: $name }) {
      name
      sprites {
        front_default
      }
      abilities {
        name
      }
    }
  }
`

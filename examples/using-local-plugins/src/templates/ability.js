import React from "react"
import { Link, graphql } from "gatsby"

const getName = ability =>
  ability.names.find(({ language }) => language.name === `en`).name

export default ({ data: { pokemon, ability } }) => (
  <div style={{ width: 960, margin: `4rem auto` }}>
    <h1>
      {pokemon.name}
      ’s {getName(ability)} ability
    </h1>
    <img src={pokemon.sprites.front_default} alt={pokemon.name} />
    <p>{ability.effect_entries[0].effect}</p>
    <Link to={`/pokemon/${pokemon.name}`}>Back to {pokemon.name}</Link>
  </div>
)

export const pageQuery = graphql`
  query($pokemonId: String!, $abilityId: String!) {
    pokemon: pokeapiPokemon(id: { eq: $pokemonId }) {
      name
      sprites {
        front_default
      }
    }
    ability: pokeapiAbility(id: { eq: $abilityId }) {
      names {
        name
        language {
          name
          url
        }
      }
      effect_entries {
        effect
      }
    }
  }
`

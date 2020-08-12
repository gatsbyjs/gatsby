const axios = require(`axios`)
const createNodeHelpers = require(`gatsby-node-helpers`).default

const get = endpoint => axios.get(`https://pokeapi.co/api/v2${endpoint}`)

const getPokemonData = names =>
  Promise.all(
    names.map(async name => {
      const { data: pokemon } = await get(`/pokemon/${name}`)
      const abilities = await Promise.all(
        pokemon.abilities.map(async ({ ability: { name: abilityName } }) => {
          const { data: ability } = await get(`/ability/${abilityName}`)

          return ability
        })
      )

      return { ...pokemon, abilities }
    })
  )

exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions
  const { createNodeFactory } = createNodeHelpers({
    typePrefix: `Pokeapi`,
  })
  const prepareAbilityNode = createNodeFactory(`Ability`)
  const preparePokemonNode = createNodeFactory(`Pokemon`)

  // Get all our pokemon data
  const allPokemon = await getPokemonData([`pikachu`, `charizard`, `squirtle`])

  // Process data for each pokemon into Gatsby node format
  const processPokemon = pokemon => {
    // Set up each ability as a node
    const abilityNodes = pokemon.abilities.map(abilityData =>
      prepareAbilityNode(abilityData)
    )

    // Actually create the "Ability" nodes for given pokemon
    abilityNodes.forEach(node => {
      createNode(node)
    })

    // Create the "Pokemon" node for given pokemon
    const pokemonNode = preparePokemonNode(pokemon)

    // Attach an array of "Ability" node ids to `abilities___NODE` in the Pokémon
    pokemonNode.abilities___NODE = abilityNodes.map(node => node.id)

    return pokemonNode
  }

  // Process data into nodes using our helper.
  allPokemon.forEach(pokemon => createNode(processPokemon(pokemon)))
}

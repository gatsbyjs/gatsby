exports.createPages = async ({ graphql, actions: { createPage } }) => {
  const result = await graphql(`
    query {
      allPokeapiPokemon {
        edges {
          node {
            name
            id
            abilities {
              id
              name
            }
          }
        }
      }
    }
  `)

  const {
    data: {
      allPokeapiPokemon: { edges: allPokemon },
    },
  } = result

  // Create a page that lists all Pokémon.
  createPage({
    path: `/`,
    component: require.resolve(`./src/templates/all-pokemon.js`),
    context: {
      slug: `/`,
    },
  })

  // Create a page for each Pokémon.
  allPokemon.forEach(pokemon => {
    createPage({
      path: `/pokemon/${pokemon.node.name}/`,
      component: require.resolve(`./src/templates/pokemon.js`),
      context: {
        name: pokemon.node.name,
      },
    })

    // Create a page for each ability of the current Pokémon.
    pokemon.node.abilities.forEach(ability => {
      createPage({
        path: `/pokemon/${pokemon.node.name}/ability/${ability.name}/`,
        component: require.resolve(`./src/templates/ability.js`),
        context: {
          pokemonId: pokemon.node.id,
          abilityId: ability.id,
        },
      })
    })
  })
}

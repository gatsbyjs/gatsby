exports.createPages = ({ actions }) => {
  const { createPage } = actions

  const dogData = [
    {
      name: `Fido`,
      breed: `Sheltie`,
    },
    {
      name: `Sparky`,
      breed: `Corgi`,
    },
  ]
  dogData.forEach(dog => {
    createPage({
      path: `/${dog.name}`,
      component: require.resolve(`./src/templates/dog-template.js`),
      context: { dog },
    })
  })
}

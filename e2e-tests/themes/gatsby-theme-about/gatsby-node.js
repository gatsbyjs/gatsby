const bioTemplate = require.resolve(`./src/templates/bio.js`)

exports.createPages = async ({ actions }) => {
    const { createPage } = actions
    createPage({ 
        path: `/bio`, 
        component: bioTemplate,
    })
}

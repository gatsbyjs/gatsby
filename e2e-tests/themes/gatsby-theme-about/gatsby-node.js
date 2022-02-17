const path = require("path")
const bioTemplate = path.resolve(`./src/templates/bio.js`)

exports.createPages = async ({ actions }) => {
    const { createPage } = actions
    createPage({ 
        path: `/bio`, 
        component: bioTemplate,
    })
}

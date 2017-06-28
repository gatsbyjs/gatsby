const path = require(`path`)
const Promise = require(`bluebird`)

const RedirectPage = path.resolve(`src/components/RedirectPage.js`)

exports.createPages = ({ boundActionCreators }) => {
    const { createPage } = boundActionCreators

    return new Promise((resolve, reject) => {
        createPage({
            path: `/redirect/`,
            component: RedirectPage,
            context: {
                to: `/b/`,
            },
        })
        resolve()
    })
}

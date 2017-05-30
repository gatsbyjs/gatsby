const path = require(`path`)
const Promise = require(`bluebird`)

const RedirectPage = path.resolve(`src/components/RedirectPage.js`)

exports.createPages = ({ boundActionCreators }) => {
    const { upsertPage } = boundActionCreators

    return new Promise((resolve, reject) => {
        upsertPage({
            path: `/redirect/`,
            component: RedirectPage,
            context: {
                to: `/b/`,
            },
        })
        resolve()
    })
}

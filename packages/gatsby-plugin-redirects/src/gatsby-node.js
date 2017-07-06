import path from 'path'

const component = path.resolve(`./src/components/GatsbyRedirect.js`)

const createPageOps = ({ from: path, to }) => ({
    path,
    component,
    context: { to },
})

export const createPages = ({ boundActionCreators }, { redirects }) => {
    const { createPage } = boundActionCreators

    return new Promise((resolve, reject) => {
        redirects.forEach(entry => {
            createPage(createPageOps(entry))
        })
        return resolve()
    })
}

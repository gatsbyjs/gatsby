import path from 'path'

const defaultComponent = path.resolve(__dirname, `components/GatsbyRedirect.js`)

const createPageOps = ({
    from: path,
    to,
    component,
}) => ({
    path,
    component,
    context: { to },
})

export const createPages = ({ boundActionCreators }, { redirects, component }) => {
    const { createPage } = boundActionCreators

    return new Promise((resolve, reject) => {
        redirects.forEach(entry => {
            entry.component = entry.component || component || defaultComponent
            createPage(createPageOps(entry))
        })
        return resolve()
    })
}

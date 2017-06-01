const $ = require(`react`).createElement
const renderToString = require(`react-dom/server`).renderToString
const { Provider } = require(`react-redux`)

const createStore = require(`./src/state/createStore`)

exports.replaceServerBodyRender = ({ component: bodyComponent }) => {

    const store = createStore()

    const connectedBody = ({ children }) => (
        $(Provider, { store }, bodyComponent)
    )

    return {
        body: renderToString(connectedBody),
    }
}

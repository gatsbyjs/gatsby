const reduxCreateStore = require(`redux`).createStore

const reducer = (state, action) => {
    console.log(action)
    if (action.type === `INCREMENT`) {
        return Object.assign({}, state, {
            count: state.count + 1,
        })
    }
    return state
}

const initialState = { count: 0 }

const createStore = () => reduxCreateStore(reducer, initialState)

module.exports = createStore

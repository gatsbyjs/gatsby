const React = require(`react`)
const { Provider } = require(`react-redux`)
const { createStore } = require(`redux`)

const reducer = (state, action) => {
  if (action.type === `SET_BLOG_POST`) {
    return action.payload
  }
  return state
}

const initialState = { id: null, title: `None` }
const store = createStore(reducer, initialState)

// eslint-disable-next-line react/prop-types,react/display-name
module.exports = ({ element }) => <Provider store={store}>{element}</Provider>

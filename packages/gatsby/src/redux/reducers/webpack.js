const merge = require(`webpack-merge`)


module.exports = (state = {}, action) => {
  switch (action.type) {
    case `SET_WEBPACK_CONFIG`: {
      let nextConfig = action.payload
      delete nextConfig.entry
      delete nextConfig.output

      return merge(state, action.payload)
    }
    case `REPLACE_WEBPACK_CONFIG`:
      return { ...action.payload }

    default:
      return state
  }
}


const Prism = require(`prismjs`)

const env = {
  grammar: undefined,
}

function loadEnv(language) {
  env.grammar = Prism.languages[language]
  if (!env.grammar) return
}

module.exports = (language = `javascript`) => {
  loadEnv(language)

  // Gatsby Prism Show Invisibles Plugin
  //
  // This file serves as an adapter module
  // for the original Prism Show Invisibles
  // implementation. The ported plugin code
  // is from npm's prismjs@1.17.1.
  //
  // @see https://github.com/PrismJS/prism/blob/v1.17.1/plugins/show-invisibles/prism-show-invisibles.js
  //
  // prism-show-invisibles.js:start
  if (
    (typeof self !== `undefined` && !self.Prism) ||
    (typeof global !== `undefined` && !global.Prism)
  ) {
    return
  }

  const invisibles = {
    tab: /\t/,
    crlf: /\r\n/,
    lf: /\n/,
    cr: /\r/,
    space: / /,
  }

  /**
   * Handles the recursive calling of `addInvisibles` for one token.
   *
   * @param {Object|Array} tokens The grammar or array which contains the token.
   * @param {string|number} name The name or index of the token in `tokens`.
   */
  function handleToken(tokens, name) {
    const value = tokens[name]

    const type = Prism.util.type(value)
    switch (type) {
      case `RegExp`: {
        const inside = {}
        tokens[name] = {
          pattern: value,
          inside: inside,
        }
        addInvisibles(inside)
        break
      }
      case `Array`: {
        for (let i = 0, l = value.length; i < l; i++) {
          handleToken(value, i)
        }
        break
      }

      default: {
        // 'Object'
        const inside = value.inside || (value.inside = {}) // eslint-disable-line no-redeclare
        addInvisibles(inside)
        break
      }
    }
  }

  /**
   * Recursively adds patterns to match invisible characters to the given grammar (if not added already).
   *
   * @param {Object} grammar
   */
  function addInvisibles(grammar) {
    if (!grammar || grammar[`tab`]) {
      return
    }

    // assign invisibles here to "mark" the grammar in case of self references
    for (const name in invisibles) {
      if (invisibles.hasOwnProperty(name)) {
        grammar[name] = invisibles[name]
      }
    }

    /* eslint-disable no-redeclare */
    for (const name in grammar) {
      /* eslint-enable no-redeclare */
      if (grammar.hasOwnProperty(name) && !invisibles[name]) {
        if (name === `rest`) {
          addInvisibles(grammar[`rest`])
        } else {
          handleToken(grammar, name)
        }
      }
    }
  }

  Prism.hooks.add(`before-highlight`, function (env) {
    addInvisibles(env.grammar)
  })
  // prism-show-invisibles.js:end

  addInvisibles(env.grammar)
}

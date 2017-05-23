const regex = new RegExp(`[^a-zA-Z0-9_]`, `g`)

module.exports = key => key.replace(regex, `___`)

const Joi = require(`@hapi/joi`)

// heh
// createResource —> when comes from the user
//   — when there's an ID — it's now "created"
// read — just grabs it off the same place.
//
// This is freakin Gatsby all over again!!!

module.exports = {
  // ID of a file should be relative to the root of the git repo
  // or the absolute path if we can't find one
  id: Joi.string(),
  _message: Joi.string(),
}

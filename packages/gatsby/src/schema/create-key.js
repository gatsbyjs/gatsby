module.exports = key => {
  key = key.replace(/\./g, `___`)
  key = key.replace(/-/g, `_`)
  return key
}

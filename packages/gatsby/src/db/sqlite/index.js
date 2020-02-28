async function start(...args) {
  console.lg(`sqlite/index/start`, args)
}

function saveState(...args) {
  console.lg(`sqlite/index/saveState`, args)
}

function getDb(...args) {
  console.lg(`sqlite/index/getDb`, args)
}

module.exports = {
  start,
  getDb,
  saveState,
}

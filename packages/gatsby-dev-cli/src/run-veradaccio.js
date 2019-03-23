const { startVerdaccio } = require(`./local-npm-registry/verdaccio`)

// My hack to keep the process alive:
setInterval(function() {}, 60000)

startVerdaccio()

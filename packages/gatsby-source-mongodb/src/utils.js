const uuidv5 = require(`uuid/v5`)

const seedConstant = `774de207-41f2-453b-b236-84f6744e788a`
const createId = (id) =>
  uuidv5(id, uuidv5(`mongodb`, seedConstant))

exports.createId = createId

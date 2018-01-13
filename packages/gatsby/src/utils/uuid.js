const uuidv5 = require(`uuid/v5`)

const seedConstant = `638f7a53-c567-4eca-8fc1-b23efb1cfb2b`

export function createUuid(id, namespace) {
  return uuidv5(id, uuidv5(namespace, seedConstant))
}

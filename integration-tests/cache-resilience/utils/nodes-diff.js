const _ = require(`lodash`)

const reduceArrayToObject = array =>
  array.reduce((accumulator, currentValue) => {
    accumulator[currentValue.id] = currentValue
    return accumulator
  }, {})

const compareState = (oldState, newState) => {
  let additions = _.differenceWith(
    Array.from(newState.values()),
    Array.from(oldState.values()),
    _.isEqual
  )

  let deletions = _.differenceWith(
    Array.from(oldState.values()),
    Array.from(newState.values()),
    _.isEqual
  )

  const changes = _.intersectionWith(
    additions,
    deletions,
    (left, right) => left.id === right.id
  ).map(({ id }) => {
    return {
      id,
      oldValue: oldState.get(id),
      newValue: newState.get(id),
    }
  })

  changes.forEach(({ id }) => {
    additions = additions.filter(addition => addition.id !== id)
    deletions = deletions.filter(deletion => deletion.id !== id)
  })

  return {
    additions: reduceArrayToObject(additions),
    deletions: reduceArrayToObject(deletions),
    changes: reduceArrayToObject(changes),
  }
}

module.exports = {
  compareState,
}

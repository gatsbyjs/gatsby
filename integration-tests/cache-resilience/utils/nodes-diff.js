const _ = require(`lodash`)
const snapshotDiff = require(`snapshot-diff`)

const reduceArrayToObject = array =>
  array.reduce((accumulator, currentValue) => {
    accumulator[currentValue.id] = currentValue
    return accumulator
  }, {})

const diff = (oldValue, newValue) =>
  snapshotDiff(oldValue, newValue, {
    expand: true,
  })
    .split(`\n`)
    .slice(4)
    .join(`\n`)

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
    const oldValue = oldState.get(id)
    const newValue = newState.get(id)

    return {
      id,
      oldValue,
      newValue,
      diff: diff(oldValue, newValue),
    }
  })

  changes.forEach(({ id }) => {
    additions = additions.filter(addition => addition.id !== id)
    deletions = deletions.filter(deletion => deletion.id !== id)
  })

  const ret = {
    additions: reduceArrayToObject(additions),
    deletions: reduceArrayToObject(deletions),
    changes: reduceArrayToObject(changes),
  }
  return {
    ...ret,
    dirtyIds: Object.keys({
      ...ret.additions,
      ...ret.deletions,
      ...ret.changes,
    }).sort(),
  }
}

module.exports = {
  compareState,
  diff,
}

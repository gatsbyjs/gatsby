const addType = type => node => {
  node.internal = {
    type,
  }
  return node
}

const entry = [
  {
    id: `entry_1`,
    string: `a`,
    sortField: `a`,
  },
  {
    id: `entry_2`,
    string: `n`,
    sortField: null,
  },
  {
    id: `entry_3`,
    string: `c`,
  },
  {
    id: `entry_4`,
    string: `d`,
    sortField: `a`,
  },
].map(addType(`Entry`))

const nodes = [...entry]

module.exports = nodes

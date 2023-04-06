exports.createPages = ({ actions }) => {
  actions.createSlice({
    id: `test`,
    component: require.resolve(`./src/components/test-slice`),
  })
}

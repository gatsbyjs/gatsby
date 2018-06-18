const nodeFromData = (datum, createNodeId) => {
  const { attributes: { id: _attributes_id, ...attributes } = {} } = datum
  const preservedId =
    typeof _attributes_id !== `undefined` ? { _attributes_id } : {}
  return {
    id: createNodeId(datum.id),
    drupal_id: datum.id,
    parent: null,
    children: [],
    ...attributes,
    ...preservedId,
    internal: {
      type: datum.type.replace(/-|__|:|\.|\s/g, `_`),
    },
  }
}

exports.nodeFromData = nodeFromData

const nodeFromData = datum => {
  const { attributes: { id: _attributes_id, ...attributes } = {} } = datum
  const preservedId =
    typeof _attributes_id !== `undefined` ? { _attributes_id } : {}
  return {
    id: datum.id,
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

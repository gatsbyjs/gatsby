export function onLoad(id) {
  callback(`load`, id)
}

export function onError(id) {
  callback(`error`, id)
}

function callback(type, id) {
  const element = document.createElement(`span`)
  element.setAttribute(`data-on-${type}-result`, id)
  document.body.appendChild(element)
}

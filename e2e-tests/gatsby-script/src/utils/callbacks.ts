export function onLoad(id: string): void {
  callback(`load`, id)
}

export function onError(id: string): void {
  callback(`error`, id)
}

function callback(type: `load` | `error`, id: string) {
  const element = document.createElement(`span`)
  element.setAttribute(`data-on-${type}-result`, id)
  document.body.appendChild(element)
}

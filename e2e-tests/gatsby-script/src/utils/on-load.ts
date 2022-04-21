export function onLoad(id: string): void {
  const element = document.createElement(`span`)
  element.dataset.onLoadResult = id
  document.body.appendChild(element)
}

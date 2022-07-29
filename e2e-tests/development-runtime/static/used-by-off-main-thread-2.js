{
  const id = `script-with-src`
  const main = document.querySelector(`main`)
  const elem = document.createElement(`div`)
  elem.id = `mutation-${id}`
  elem.textContent = `mutation-${id}: success`
  main.appendChild(elem)
}

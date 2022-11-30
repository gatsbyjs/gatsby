{
  const id = `script-with-src`
  const main = document.querySelector(`main`)
  const elem = document.createElement(`div`)
  elem.textContent = `mutation-${id}: success`
  elem.id = `mutation-${id}`
  main.appendChild(elem)
}

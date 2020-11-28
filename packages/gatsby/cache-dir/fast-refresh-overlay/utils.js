import Anser from "anser"

export function prettifyStack(errorInformation) {
  let txt
  if (Array.isArray(errorInformation)) {
    txt = errorInformation.join(`\n`)
  } else {
    txt = errorInformation
  }
  return Anser.ansiToJson(txt, {
    remove_empty: true,
    use_classes: true,
    json: true,
  })
}

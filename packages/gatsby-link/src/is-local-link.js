export const isLocalLink = path =>
  path &&
  !path.startsWith(`http://`) &&
  !path.startsWith(`https://`) &&
  !path.startsWith(`//`)

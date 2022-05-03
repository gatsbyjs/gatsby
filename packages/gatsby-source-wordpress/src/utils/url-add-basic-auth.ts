export function addBasicAuth({
  url,
  username,
  password,
  defaultProtocol = `https`,
}: {
  url: string
  username: string
  password: string
  defaultProtocol?: string
}): string {
  let [protocol, domain] = url.split(`://`)

  if (!domain) {
    domain = protocol
    protocol = defaultProtocol
  }

  return `${protocol}://${username}:${password}@${domain}`
}

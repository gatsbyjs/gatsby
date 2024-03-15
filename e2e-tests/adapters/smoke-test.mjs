import assert from "node:assert"

{
  // check index page (SSG)
  const response = await fetch(process.env.DEPLOY_URL)
  assert.equal(response.status, 200)

  const body = await response.text()
  assert.match(body, /<h1>Adapters<\/h1>/)
  assert.match(body, /<title[^>]*>Adapters E2E<\/title>/)
}

{
  // check SSR page
  const response = await fetch(
    process.env.DEPLOY_URL + `/routes/ssr/remote-file/`
  )
  assert.equal(response.status, 200)

  const body = await response.text()
  // inline css for placeholder - this tests both LMDB and SHARP
  // (LMDB because of page query and sharp because page query will use sharp to generate placeholder values)
  assert.match(body, /background-color:rgb\(232,184,8\)/)
}

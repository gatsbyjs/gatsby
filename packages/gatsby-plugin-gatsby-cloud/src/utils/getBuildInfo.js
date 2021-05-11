export default async function getBuildInfo() {
  try {
    console.log(`url`, process.env.GATSBY_PREVIEW_API_URL)
    const res = await fetch(process.env.GATSBY_PREVIEW_API_URL, {
      mode: `cors`,
      headers: {
        "Content-Type": `application/json`,
        /*
         * NOTE: Current auth token used is the same auth token that preview exposes
         * Currently this token is only used for read-only purposes but it's good to note for the future if this changes
         */
        Authorization: process.env.GATSBY_PREVIEW_AUTH_TOKEN,
        "x-runner-type": `PREVIEW`,
      },
    })

    return res.json()
  } catch (e) {
    console.log(e, e.message)
  }
}

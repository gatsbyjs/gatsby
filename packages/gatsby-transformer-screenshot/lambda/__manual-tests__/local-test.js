const thing = require(`../index`)
const url = process.env.SITE_URL

const start = async () => {
  const result = await thing.handler(
    {
      body: `{"url":"${url}"}`,
    },
    {
      fail: err => {
        console.log(`error:`)
        console.log(err)
      },
      succeed: res => {
        console.log(`success!`)
        console.log(res)
      },
    }
  )

  return result
}

start()

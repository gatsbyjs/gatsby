import path from "path"
import fs from "fs-extra"
import axios from "axios"

const API_FILE = `https://unpkg.com/gatsby/apis.json`
const ROOT = path.join(__dirname, `..`, `..`)
const OUTPUT_FILE = path.join(ROOT, `latest-apis.json`)

export interface IAPIResponse {
  browser: Record<string, any>
  node: Record<string, any>
  ssr: Record<string, any>
}

export const getLatestAPIs = async (): Promise<IAPIResponse> => {
  try {
    const { data } = await axios.get(API_FILE, { timeout: 5000 })

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), `utf8`)

    return data
  } catch (e) {
    if (await fs.pathExists(OUTPUT_FILE)) {
      return fs.readJSON(OUTPUT_FILE)
    }
    // possible offline/network issue
    return fs.readJSON(path.join(ROOT, `apis.json`)).catch(() => {
      return {
        browser: {},
        node: {},
        ssr: {},
      }
    })
  }
}

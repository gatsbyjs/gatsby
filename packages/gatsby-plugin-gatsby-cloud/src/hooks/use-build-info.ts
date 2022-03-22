import { useEffect, useState } from "react"
import { BuildInfo } from "../models/interfaces"

interface IUseBuildInfoProps {
  buildInfo: BuildInfo | null
  refetch: () => Promise<void>
}

const useBuildInfo = (): IUseBuildInfoProps => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null)
  const refetch = async (): Promise<void> => {
    try {
      const url = process.env.GATSBY_PREVIEW_API_URL || ``
      const res = await fetch(url, {
        mode: `cors`,
        headers: new Headers({
          "Content-Type": `application/json`,
          /*
           * NOTE: Current auth token used is the same auth token that preview exposes
           * Currently this token is only used for read-only purposes but it's good to note for the future if this changes
           */
          Authorization: process.env.GATSBY_PREVIEW_AUTH_TOKEN || ``,
          "x-runner-type": `PREVIEW`,
        }),
      })
      const data: BuildInfo | null = await res.json()
      setBuildInfo(data)
    } catch (e) {
      setBuildInfo(null)
      console.log(e, e.message)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return {
    buildInfo,
    refetch,
  }
}

export default useBuildInfo

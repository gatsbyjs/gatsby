import { useEffect, useState } from "react"

interface IUsePageData {
  data: string | null
  errorMessage: string | null
  refetch: () => Promise<void>
}

interface IUsePageDataOptions {
  immediate: boolean
}

class NotFoundError extends Error {
  constructor(public message: string = `Not Found`) {
    super(message)
  }
}

const usePageData = (options?: IUsePageDataOptions): IUsePageData => {
  const [data, setData] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const refetch = async (): Promise<void> => {
    const urlHostString = window.location.origin
    const pathAdjustment =
      window.location.pathname === `/` ? `/index` : window.location.pathname

    const normalizedPath = `/page-data${pathAdjustment}/page-data.json`.replace(
      /\/\//g,
      `/`
    )

    const url = urlHostString + normalizedPath

    try {
      const response = await fetch(url)
      const data = await response.text()

      // for local dev with `gatsby develop` where page-data.json files never 404 and return an empty object instead.
      if (data === `{}`) {
        // for local development, force an error if page is missing.
        throw new NotFoundError()
      }
      setData(data)
      setErrorMessage(null)
    } catch (e) {
      setData(null)
      if (e instanceof NotFoundError) {
        setErrorMessage(`This page has moved.`)
      } else {
        setErrorMessage(null)
      }
    }
  }

  useEffect(() => {
    if (!options || options?.immediate) {
      refetch()
    }
  }, [])

  return {
    data,
    errorMessage,
    refetch,
  }
}

export default usePageData

export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    __GATSBY_IMAGE_FIRST_RENDER: boolean
  }

  export const SERVER: boolean | undefined
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export const GATSBY___IMAGE: boolean | undefined
}

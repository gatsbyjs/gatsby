import IBuildInfoPayload from "./build-info-payload"

export default interface IBuildInfo extends IBuildInfoPayload {
  errorMessage?: string | null
}

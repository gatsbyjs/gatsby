type UUID = string

declare namespace NodeJS {
  interface Process {
    gatsbyTelemetrySessionId: UUID;
  }
}

